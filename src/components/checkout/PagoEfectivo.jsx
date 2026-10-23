import { useState } from 'react'
import { toast } from 'react-toastify'
import { pagarEfectivo } from '../../api/pagos'
import { formatSoles } from '../../utils/formatters'
import { Banknote, ArrowRight } from 'lucide-react'

export default function PagoEfectivo({ boleta, onExito }) {
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(false)

  const total = parseFloat(boleta.total)
  const montoNum = parseFloat(monto) || 0
  const vuelto = montoNum - total
  const suficiente = montoNum >= total

  const sugerencias = [total, ...[10, 20, 50, 100, 200].filter(b => b > total)].slice(0, 5)

  const cobrar = async () => {
    if (!suficiente) return toast.error('Monto insuficiente')
    setLoading(true)
    try {
      const data = await pagarEfectivo(boleta.id, montoNum)
      onExito(data)
    } catch {
      toast.error('Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-sunk px-[18px] py-3.5 flex items-center justify-between">
        <span className="text-[15px] font-bold text-gray-500">Total a cobrar</span>
        <span className="font-display text-[44px] font-black leading-none text-gray-900 tabular-nums">{formatSoles(total)}</span>
      </div>

      <div>
        <label className="field-label mb-2 block text-sm">Monto recibido</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-[34px] font-bold text-gray-400">S/</span>
          <input
            type="number"
            step="0.10"
            inputMode="decimal"
            placeholder="0.00"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            autoFocus
            className="w-full h-[88px] pl-16 pr-5 font-display text-[60px] font-black text-gray-900 tabular-nums border-2 border-gray-300 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-sky-500/15 transition-[border-color,box-shadow] duration-150"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {sugerencias.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMonto(s.toFixed(2))}
              className="h-11 rounded-xl bg-sunk text-sm font-extrabold text-gray-900 hover:bg-navy hover:text-white transition-[background-color,color,transform] duration-150 active:scale-[0.97] tabular-nums"
            >
              {i === 0 ? 'Exacto' : formatSoles(s)}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl px-[22px] py-3 flex items-center justify-between transition-colors duration-150 ${
        vuelto > 0 ? 'bg-ok-deep text-white' : 'bg-sunk text-gray-400'
      }`}>
        <span className="font-display text-[34px] font-black uppercase tracking-wide leading-none">Vuelto</span>
        <span className={`font-display text-[72px] font-black leading-none tabular-nums ${vuelto > 0 ? 'text-gold' : ''}`}>
          {formatSoles(vuelto > 0 ? vuelto : 0)}
        </span>
      </div>

      <button
        onClick={cobrar}
        disabled={loading || !suficiente}
        className="w-full flex items-center justify-center gap-2.5 h-[60px] rounded-2xl bg-ok text-white text-lg font-extrabold hover:bg-[#106532] transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-ok disabled:active:scale-100"
      >
        <Banknote size={22} />
        {loading ? 'Procesando…' : 'Confirmar cobro'}
        {!loading && suficiente && <ArrowRight size={22} />}
      </button>
    </div>
  )
}
