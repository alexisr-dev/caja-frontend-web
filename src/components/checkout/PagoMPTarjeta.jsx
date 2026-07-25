import { useEffect, useState } from 'react'
import { initMercadoPago } from '@mercadopago/sdk-react'
import { toast } from 'react-toastify'
import {
  CreditCard, Calendar, Lock, User, Mail, Hash, FileText,
  ChevronDown, ShoppingCart, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { pagarMPTarjeta } from '../../api/pagos'
import { formatSoles } from '../../utils/formatters'
import { ESTADO_PAGO } from '../../utils/constants'
import { env } from '../../config/env'
import { MENSAJES_TARJETA, resolverErrorPago, mensajePagoEnProceso } from './mensajesPago'

const PUBLIC_KEY = env.mercadoPago.publicKey
const IS_SANDBOX = env.mercadoPago.esSandbox
const DOC_MAX_LENGTH = { DNI: 8, CE: 12, RUC: 11 }

// Instancia perezosa del SDK de MP, compartida entre renders para no
// reconstruirla en cada consulta de BIN.
let _mpLookup = null
const getMPLookup = () => {
  if (!_mpLookup && window.MercadoPago) {
    _mpLookup = new window.MercadoPago(PUBLIC_KEY, { locale: 'es-PE' })
  }
  return _mpLookup
}

// ── Helpers de formato / marca ──────────────────────────────
const soloDigitos = (v) => v.replace(/\D/g, '')

const fmtNumero = (v) => soloDigitos(v).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExpiry = (v) => {
  const d = soloDigitos(v).slice(0, 4)
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`
}

const detectBrand = (numero) => {
  const n = soloDigitos(numero)
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'master'
  if (/^3[47]/.test(n)) return 'amex'
  return ''
}

const maskNumero = (numero) => {
  const d = soloDigitos(numero).padEnd(16, '•').slice(0, 16)
  return d.replace(/(.{4})/g, '$1 ').trim()
}

const boxCls = 'flex items-center gap-2.5 px-3.5 h-[52px] rounded-xl border-2 border-gray-200 bg-white transition focus-within:border-[#009EE3] focus-within:ring-4 focus-within:ring-[#009EE3]/10'
const inputCls = 'flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400'
const labelCls = 'text-sm font-semibold text-gray-700 mb-1.5 block'

function BrandMark({ method }) {
  if (method === 'visa') return <span className="text-[#1A1F71] font-extrabold italic text-base tracking-tight shrink-0">VISA</span>
  if (method === 'master') return (
    <span className="relative inline-flex items-center w-9 h-6 shrink-0" aria-label="Mastercard">
      <span className="absolute left-0 w-5 h-5 rounded-full bg-[#EB001B]" />
      <span className="absolute left-3 w-5 h-5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
    </span>
  )
  if (method === 'amex') return <span className="text-[#2E77BC] font-extrabold text-xs shrink-0">AMEX</span>
  return <CreditCard size={20} className="text-gray-300 shrink-0" />
}

function BrandMarkWhite({ method }) {
  if (method === 'visa') return <span className="font-extrabold italic text-lg tracking-tight text-white">VISA</span>
  if (method === 'master') return (
    <span className="relative inline-flex items-center w-11 h-7">
      <span className="absolute left-0 w-7 h-7 rounded-full bg-[#EB001B]" />
      <span className="absolute left-4 w-7 h-7 rounded-full bg-[#F79E1B] mix-blend-screen" />
    </span>
  )
  if (method === 'amex') return <span className="font-extrabold text-sm text-white">AMEX</span>
  return <CreditCard size={26} className="text-white/70" />
}

// ── Tarjeta 3D con espejo en vivo + flip al CVV ─────────────
function TarjetaPreview({ numero, nombre, expiry, cvv, brand, flip }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const onMove = (e) => {
    if (flip) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 16 })
  }

  const tema = brand === 'visa'
    ? 'from-[#1A1F71] to-[#2D6CDF]'
    : brand === 'master'
      ? 'from-gray-800 to-gray-950'
      : brand === 'amex'
        ? 'from-[#2E77BC] to-[#155a99]'
        : 'from-indigo-500 via-purple-500 to-fuchsia-500'

  const transform = flip
    ? 'rotateY(180deg)'
    : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`

  return (
    <div className="[perspective:1100px]" onMouseMove={onMove} onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}>
      <div
        className="relative w-full aspect-[1.6/1] [transform-style:preserve-3d] transition-transform duration-500 will-change-transform"
        style={{ transform }}
      >
        {/* Frente */}
        <div className={`absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br ${tema} text-white p-5 shadow-xl shadow-gray-900/30 overflow-hidden`}>
          <div className="absolute -inset-x-10 -top-20 h-40 bg-white/10 rotate-12 blur-2xl pointer-events-none" />
          <div className="relative flex items-start justify-between">
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-inner" />
            <div className="h-7 flex items-center"><BrandMarkWhite method={brand} /></div>
          </div>
          <p className="relative mt-5 text-xl font-mono tracking-[0.18em] text-white/95">{maskNumero(numero)}</p>
          <div className="relative mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-white/50">Titular</p>
              <p className="text-sm font-medium truncate uppercase">{nombre?.trim() || 'NOMBRE APELLIDO'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] uppercase tracking-widest text-white/50">Vence</p>
              <p className="text-sm font-medium">{expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>

        {/* Reverso */}
        <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-gradient-to-br ${tema} text-white shadow-xl shadow-gray-900/30 overflow-hidden`}>
          <div className="w-full h-9 bg-black/80 mt-5" />
          <div className="px-5 mt-4">
            <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1 text-right">CVV</p>
            <div className="h-9 rounded bg-white/90 flex items-center justify-end px-3">
              <span className="text-gray-900 font-mono tracking-widest text-sm">{cvv || '•••'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PagoMPTarjeta({ boleta, onExito }) {
  const [loading, setLoading] = useState(false)
  const [flip, setFlip] = useState(false)
  const [form, setForm] = useState({
    numero: '', expiry: '', cvv: '',
    cardholderName: '', email: '', tipoDoc: 'DNI', numDoc: '',
  })
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [issuerId, setIssuerId] = useState('')

  const brand = detectBrand(form.numero)

  useEffect(() => {
    initMercadoPago(PUBLIC_KEY, { locale: 'es-PE' })
  }, [])

  // Detección de marca/emisor por BIN para enviar payment_method_id al backend
  useEffect(() => {
    const digits = soloDigitos(form.numero)
    if (digits.length < 6) { setPaymentMethodId(''); setIssuerId(''); return }
    const bin = digits.slice(0, 8)
    let activo = true
    ;(async () => {
      const mp = getMPLookup()
      if (!mp) return
      try {
        const methods = await mp.getPaymentMethods({ bin })
        const m = methods?.results?.[0]
        if (!m || !activo) return
        setPaymentMethodId(m.id)
        const issuers = await mp.getIssuers({ paymentMethodId: m.id, bin })
        if (issuers?.[0] && activo) setIssuerId(String(issuers[0].id))
      } catch { /* silencioso */ }
    })()
    return () => { activo = false }
  }, [form.numero])

  const set = (key, fmt) => (e) =>
    setForm(prev => ({ ...prev, [key]: fmt ? fmt(e.target.value) : e.target.value }))

  const numeroDigits = soloDigitos(form.numero)
  const puedePagar =
    numeroDigits.length >= 13 &&
    form.expiry.length === 5 &&
    form.cvv.length >= 3 &&
    form.cardholderName.trim() &&
    form.email.trim() &&
    form.numDoc.trim()

  const cobrar = async () => {
    if (!puedePagar) return toast.error('Completa los datos de la tarjeta')
    const mp = getMPLookup()
    if (!mp) return toast.error('SDK de Mercado Pago no disponible')

    const [mm, aa] = form.expiry.split('/')
    setLoading(true)
    try {
      const token = await mp.createCardToken({
        cardNumber: numeroDigits,
        cardholderName: form.cardholderName,
        cardExpirationMonth: mm,
        cardExpirationYear: `20${aa}`,
        securityCode: form.cvv,
        identificationType: form.tipoDoc,
        identificationNumber: form.numDoc,
      })
      if (!token?.id) throw new Error('No se pudo generar el token de pago')

      const responseData = await pagarMPTarjeta({
        boleta_id: boleta.id,
        token_mp: token.id,
        email_pagador: form.email,
        cuotas: 1,
        tipo_doc: form.tipoDoc,
        num_doc: form.numDoc,
        ...(paymentMethodId && { payment_method_id: paymentMethodId }),
        ...(issuerId && { issuer_id: issuerId }),
      })

      if (responseData.estado === ESTADO_PAGO.APROBADO) {
        toast.success('Pago aprobado')
        onExito(responseData)
        return
      }

      if (responseData.codigo === 'en_proceso' || responseData.pago?.estado === ESTADO_PAGO.PENDIENTE) {
        toast.info(mensajePagoEnProceso(responseData, MENSAJES_TARJETA))
        onExito(responseData.pago || responseData)
        return
      }

      toast.error(responseData.detail || 'Respuesta inesperada del servidor')
    } catch (err) {
      toast.error(resolverErrorPago(err, MENSAJES_TARJETA))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#009EE3]/10 text-[#009EE3] flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Datos de la tarjeta</h3>
            <p className="text-xs text-gray-400">Pago al contado · vía Mercado Pago</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="flex items-center gap-1 text-xs font-semibold text-green-600 justify-end">
            <ShieldCheck size={13} /> Pago seguro
          </p>
          <p className="text-[10px] text-gray-400">Encriptación SSL</p>
        </div>
      </div>

      {/* Tarjeta 3D con espejo en vivo */}
      <TarjetaPreview
        numero={form.numero}
        nombre={form.cardholderName}
        expiry={form.expiry}
        cvv={form.cvv}
        brand={brand}
        flip={flip}
      />

      {IS_SANDBOX && (
        <details className="text-xs bg-amber-50/70 border border-amber-200 rounded-xl px-3 py-2.5">
          <summary className="font-semibold text-amber-800 cursor-pointer select-none">
            Modo TEST — tarjetas de prueba
          </summary>
          <div className="mt-2 space-y-1 text-amber-900/90">
            <p><b>Mastercard</b> · 5031 7557 3453 0604 · CVV 123 · 11/30</p>
            <p><b>Visa</b> · 4235 6477 2802 5682 · CVV 123 · 11/30</p>
            <p className="pt-1"><b>Titular:</b> <code>APRO</code> aprobado · <code>FUND</code> sin fondos · <code>OTHE</code> rechazo</p>
            <p><b>Documento:</b> DNI <code>12345678</code></p>
          </div>
        </details>
      )}

      {/* Número */}
      <div>
        <label className={labelCls}>Número de tarjeta</label>
        <div className={boxCls}>
          <CreditCard size={18} className="text-gray-400 shrink-0" />
          <input
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={form.numero}
            onChange={set('numero', fmtNumero)}
            className={`${inputCls} font-mono tracking-wide`}
          />
          <BrandMark method={brand} />
        </div>
      </div>

      {/* Vencimiento + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Vencimiento</label>
          <div className={boxCls}>
            <Calendar size={18} className="text-gray-400 shrink-0" />
            <input
              inputMode="numeric"
              placeholder="MM/AA"
              value={form.expiry}
              onChange={set('expiry', fmtExpiry)}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>CVV</label>
          <div className={boxCls}>
            <Lock size={18} className="text-gray-400 shrink-0" />
            <input
              inputMode="numeric"
              placeholder="123"
              value={form.cvv}
              onChange={set('cvv', (v) => soloDigitos(v).slice(0, 4))}
              onFocus={() => setFlip(true)}
              onBlur={() => setFlip(false)}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className={labelCls}>Nombre en la tarjeta</label>
        <div className={boxCls}>
          <User size={18} className="text-gray-400 shrink-0" />
          <input
            className={inputCls}
            placeholder="Como aparece en la tarjeta"
            value={form.cardholderName}
            onChange={set('cardholderName')}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelCls}>Email del pagador</label>
        <div className={boxCls}>
          <Mail size={18} className="text-gray-400 shrink-0" />
          <input
            type="email"
            className={inputCls}
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={set('email')}
          />
        </div>
      </div>

      {/* Documento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Tipo doc.</label>
          <div className={`${boxCls} relative`}>
            <FileText size={18} className="text-gray-400 shrink-0" />
            <select
              value={form.tipoDoc}
              onChange={set('tipoDoc')}
              className={`${inputCls} appearance-none cursor-pointer pr-5`}
            >
              <option value="DNI">DNI</option>
              <option value="CE">CE</option>
              <option value="RUC">RUC</option>
            </select>
            <ChevronDown size={16} className="text-gray-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelCls}>N° documento</label>
          <div className={boxCls}>
            <Hash size={18} className="text-gray-400 shrink-0" />
            <input
              className={inputCls}
              placeholder="12345678"
              maxLength={DOC_MAX_LENGTH[form.tipoDoc]}
              value={form.numDoc}
              onChange={set('numDoc', soloDigitos)}
            />
          </div>
        </div>
      </div>

      {/* Resumen / garantías */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#009EE3]/10 text-[#009EE3] flex items-center justify-center shrink-0">
          <ShoppingCart size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">Estás por pagar</p>
          <p className="text-xl font-extrabold text-gray-900 tabular-nums leading-tight">{formatSoles(boleta.total)}</p>
        </div>
        <div className="space-y-1 shrink-0">
          <p className="flex items-center gap-1 text-[11px] text-green-600"><CheckCircle2 size={12} /> Datos protegidos</p>
          <p className="flex items-center gap-1 text-[11px] text-green-600"><CheckCircle2 size={12} /> Pago cifrado</p>
        </div>
      </div>

      {/* Botón */}
      <button
        onClick={cobrar}
        disabled={loading || !puedePagar}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#009EE3] text-white font-bold hover:bg-[#0089C7] transition-colors shadow-sm shadow-[#009EE3]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#009EE3]"
      >
        <Lock size={16} />
        {loading ? 'Procesando…' : puedePagar ? `Pagar ${formatSoles(boleta.total)}` : 'Completa la tarjeta'}
      </button>

      <p className="text-center text-[11px] text-gray-400 leading-relaxed">
        Al continuar aceptas los Términos y la Política de Privacidad
      </p>
    </div>
  )
}
