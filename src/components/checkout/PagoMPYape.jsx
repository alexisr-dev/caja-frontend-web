import { useState } from 'react'
import { toast } from 'react-toastify'
import { pagarMPYape } from '../../api/pagos'
import { formatSoles } from '../../utils/formatters'
import { ESTADO_PAGO, YAPE_MONTO_MINIMO } from '../../utils/constants'
import { env } from '../../config/env'
import { MENSAJES_YAPE, resolverErrorPago, mensajePagoEnProceso } from './mensajesPago'

const IS_SANDBOX = env.mercadoPago.esSandbox

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
      <div className="rounded-2xl bg-gradient-to-br from-[#742284] to-[#9B2FB0] text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/yape.webp" alt="Yape" className="w-10 h-10 rounded-xl bg-white object-cover" />
          <div>
            <p className="text-xs text-white/70">Total a cobrar</p>
            <p className="text-2xl font-extrabold tabular-nums leading-tight">{formatSoles(totalNum)}</p>
          </div>
        </div>
      </div>

      {!montoSuficiente && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">
          Yape requiere un monto mínimo de <b>{formatSoles(YAPE_MONTO_MINIMO)}</b>.
        </div>
      )}

      <ol className="space-y-2 bg-purple-50 border border-purple-100 rounded-2xl p-4">
        {[
          <>El cliente abre la app <b>Yape</b></>,
          <>Va a <b>Cobrar</b> → <b>Código de aprobación</b></>,
          <>Copia el código de 6 dígitos e ingrésalo aquí</>,
        ].map((paso, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span>{paso}</span>
          </li>
        ))}
      </ol>

      {IS_SANDBOX && (
        <details className="text-xs bg-amber-50/70 border border-amber-200 rounded-xl px-3 py-2.5">
          <summary className="font-semibold text-amber-800 cursor-pointer select-none">
            Modo TEST — datos de prueba
          </summary>
          <table className="mt-2 w-full text-amber-900/90">
            <thead>
              <tr className="text-left">
                <th className="pr-4 font-semibold">Celular</th>
                <th className="pr-4 font-semibold">OTP</th>
                <th className="font-semibold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="pr-4">111111111</td><td className="pr-4">123456</td><td className="text-green-700">Aprobado</td></tr>
              <tr><td className="pr-4">111111112</td><td className="pr-4">123456</td><td>Llamar para autorizar</td></tr>
              <tr><td className="pr-4">111111113</td><td className="pr-4">123456</td><td>Fondos insuficientes</td></tr>
              <tr><td className="pr-4">111111114</td><td className="pr-4">123456</td><td>Otro rechazo</td></tr>
            </tbody>
          </table>
        </details>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Celular del cliente</label>
        <input
          type="tel"
          placeholder={IS_SANDBOX ? '111111111 (prueba)' : '9XXXXXXXX'}
          maxLength={9}
          value={celular}
          onChange={e => setCelular(e.target.value.replace(/\D/g, ''))}
          className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Código OTP (6 dígitos)</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          className="border-2 border-gray-200 rounded-xl px-3 py-3 text-center text-2xl tracking-[0.5em] font-mono outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Email del cliente</label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition"
        />
      </div>

      <button
        onClick={cobrar}
        disabled={loading || !puedeCobrar}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
      >
        <img src="/yape.webp" alt="" className="w-5 h-5 rounded-md bg-white object-cover" />
        {loading ? 'Procesando…' : `Cobrar ${formatSoles(boleta.total)}`}
      </button>
    </div>
  )
}
