import { useState } from 'react'
import { toast } from 'react-toastify'
import { pagarMPYape } from '../../api/pagos'
import { formatSoles } from '../../utils/formatters'
import { ESTADO_PAGO, YAPE_MONTO_MINIMO } from '../../utils/constants'
import { env } from '../../config/env'
import { MENSAJES_YAPE, resolverErrorPago, mensajePagoEnProceso } from './mensajesPago'

const IS_SANDBOX = env.mercadoPago.esSandbox

const inputCls = 'field w-full h-12 rounded-xl border-gray-300 focus:border-[#742284] focus:ring-[#742284]/15'

export default function PagoMPYape({ boleta, onExito }) {
  const [celular, setCelular] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const totalNum = parseFloat(boleta.total)
  const montoSuficiente = totalNum >= YAPE_MONTO_MINIMO

  const cobrar = async () => {
    if (!email.trim()) return toast.error('El email es requerido')
    if (!montoSuficiente) {
      return toast.error(`Yape requiere un monto mínimo de ${formatSoles(YAPE_MONTO_MINIMO)}`)
    }
    setLoading(true)
    try {
      const data = await pagarMPYape({
        boleta_id: boleta.id,
        numero_celular: celular,
        otp,
        email_pagador: email,
      })

      if (data.estado === ESTADO_PAGO.APROBADO) {
        toast.success('Pago Yape aprobado')
        onExito(data)
        return
      }

      if (data.codigo === 'en_proceso' || data.pago?.estado === ESTADO_PAGO.PENDIENTE) {
        toast.info(mensajePagoEnProceso(data, MENSAJES_YAPE))
        onExito(data.pago || data)
        return
      }

      toast.error(data.detail || 'Pago rechazado')
    } catch (err) {
      toast.error(resolverErrorPago(err, MENSAJES_YAPE))
    } finally {
      setLoading(false)
    }
  }

  const puedeCobrar = celular.length >= 9 && otp.length >= 6 && email.trim() && montoSuficiente

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#742284] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img src="/yape.webp" alt="Yape" className="w-12 h-12 rounded-xl bg-white object-cover" />
          <div>
            <p className="text-[13px] font-bold text-white/80">Total a cobrar</p>
            <p className="font-display text-[44px] font-black leading-none tabular-nums">{formatSoles(totalNum)}</p>
          </div>
        </div>
      </div>

      {!montoSuficiente && (
        <div className="rounded-xl bg-err-bg text-err text-sm px-4 py-3">
          Yape requiere un monto mínimo de <b>{formatSoles(YAPE_MONTO_MINIMO)}</b>.
        </div>
      )}

      <ol className="space-y-2.5 bg-[#F3ECFA] rounded-2xl p-4">
        {[
          <>El cliente abre la app <b>Yape</b></>,
          <>Va a <b>Cobrar</b> → <b>Código de aprobación</b></>,
          <>Copia el código de 6 dígitos e ingrésalo aquí</>,
        ].map((paso, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-800">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[#742284] text-white text-xs font-extrabold flex items-center justify-center">
              {i + 1}
            </span>
            <span>{paso}</span>
          </li>
        ))}
      </ol>

      {IS_SANDBOX && (
        <details className="text-xs bg-warn-bg rounded-xl px-3.5 py-3">
          <summary className="font-extrabold text-warn cursor-pointer select-none">
            Modo TEST — datos de prueba
          </summary>
          <table className="mt-2 w-full text-warn">
            <thead>
              <tr className="text-left">
                <th className="pr-4 font-bold">Celular</th>
                <th className="pr-4 font-bold">OTP</th>
                <th className="font-bold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="pr-4">111111111</td><td className="pr-4">123456</td><td className="text-ok font-bold">Aprobado</td></tr>
              <tr><td className="pr-4">111111112</td><td className="pr-4">123456</td><td>Llamar para autorizar</td></tr>
              <tr><td className="pr-4">111111113</td><td className="pr-4">123456</td><td>Fondos insuficientes</td></tr>
              <tr><td className="pr-4">111111114</td><td className="pr-4">123456</td><td>Otro rechazo</td></tr>
            </tbody>
          </table>
        </details>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="field-label">Celular del cliente</label>
        <input
          type="tel"
          placeholder={IS_SANDBOX ? '111111111 (prueba)' : '9XXXXXXXX'}
          maxLength={9}
          value={celular}
          onChange={e => setCelular(e.target.value.replace(/\D/g, ''))}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label">Código OTP (6 dígitos)</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className={`${inputCls} h-16 text-center font-display text-[40px] font-extrabold tracking-[0.4em] tabular-nums`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label">Email del cliente</label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputCls}
        />
      </div>

      <button
        onClick={cobrar}
        disabled={loading || !puedeCobrar}
        className="w-full flex items-center justify-center gap-2.5 h-[58px] rounded-2xl bg-[#742284] text-white text-[17px] font-extrabold hover:bg-[#611C70] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-[#742284] disabled:active:scale-100"
      >
        <img src="/yape.webp" alt="" className="w-6 h-6 rounded-md bg-white object-cover" />
        {loading ? 'Procesando…' : `Cobrar ${formatSoles(boleta.total)}`}
      </button>
    </div>
  )
}
