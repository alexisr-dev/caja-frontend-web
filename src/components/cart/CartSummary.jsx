import { useCart } from '../../context/CartContext'
import { formatSoles } from '../../utils/formatters'
import { CreditCard, Trash2 } from 'lucide-react'
import { cancelarPendiente } from '../../services/boletaPendiente'

export default function CartSummary({ bloqueado = false, onCobrar }) {
  const { items, subtotalSinIgv, igvMonto, total, vaciar } = useCart()
  const vacio = items.length === 0 || bloqueado

  const handleLimpiar = async () => {
    await cancelarPendiente()
    vaciar()
  }

  return (
    <div className="border-t border-gray-100 px-5 py-4 bg-white">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal (sin IGV)</span>
          <span className="tabular-nums">{formatSoles(subtotalSinIgv)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>IGV 18%</span>
          <span className="tabular-nums">{formatSoles(igvMonto)}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
        <span className="text-sm font-medium text-gray-500">Total</span>
        <span className="text-2xl font-bold text-gray-900 tabular-nums">{formatSoles(total)}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleLimpiar}
          disabled={vacio}
          title="Vaciar carrito"
          className="shrink-0 flex items-center justify-center w-11 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:hover:border-gray-200"
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={onCobrar}
          disabled={vacio}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          <CreditCard size={18} />
          Cobrar
          {!vacio && <span className="tabular-nums">· {formatSoles(total)}</span>}
        </button>
      </div>
    </div>
  )
}
