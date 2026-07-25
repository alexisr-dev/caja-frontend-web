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

  // Montos rápidos: exacto + billetes comunes mayores al total
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
      {/* Total a cobrar */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total a cobrar</span>
        <span className="text-xl font-bold text-gray-900 tabular-nums">{formatSoles(total)}</span>
      </div>

      {/* Monto recibido */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Monto recibido</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/</span>
          <input
            type="number"
            step="0.10"
            inputMode="decimal"
            placeholder="0.00"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3.5 text-2xl font-bold text-gray-900 tabular-nums border-2 border-gray-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {sugerencias.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMonto(s.toFixed(2))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-colors tabular-nums"
            >
              {i === 0 ? 'Exacto' : formatSoles(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Vuelto en vivo */}
      <div className={`rounded-2xl px-4 py-4 flex items-center justify-between transition-colors ${
        vuelto > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'
      }`}>
        <span className={`text-sm font-medium ${vuelto > 0 ? 'text-green-700' : 'text-gray-400'}`}>Vuelto</span>
        <span className={`text-2xl font-extrabold tabular-nums ${vuelto > 0 ? 'text-green-600' : 'text-gray-300'}`}>
          {formatSoles(vuelto > 0 ? vuelto : 0)}
        </span>
      </div>

      {/* Confirmar */}
      <button
        onClick={cobrar}
        disabled={loading || !suficiente}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600"
      >
        <Banknote size={18} />
        {loading ? 'Procesando…' : 'Confirmar cobro'}
        {!loading && suficiente && <ArrowRight size={18} />}
      </button>
    </div>
  )
}
