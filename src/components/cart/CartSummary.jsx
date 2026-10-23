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
    <div className="border-t border-gray-200 px-5 py-4 bg-white rounded-b-2xl">
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

      <div className={`tag-price mt-3.5 flex items-center justify-between pr-5 py-2.5 ${items.length === 0 ? 'tag-price-muted' : ''}`}>
        <span className="text-[15px] font-extrabold">Total</span>
        <span className="font-display text-[52px] font-black leading-none tabular-nums">{formatSoles(total)}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleLimpiar}
          disabled={vacio}
          title="Vaciar carrito"
          aria-label="Vaciar carrito"
          className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-sunk text-gray-500 hover:text-err hover:bg-err-bg transition-[background-color,color,transform] duration-150 active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-sunk disabled:hover:text-gray-500 disabled:active:scale-100"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={onCobrar}
          disabled={vacio}
          className="flex-1 h-14 flex items-center justify-center gap-2.5 rounded-xl bg-ok text-white text-[17px] font-extrabold hover:bg-[#106532] transition-[background-color,transform] duration-150 active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-ok disabled:active:scale-100"
        >
          <CreditCard size={20} />
          Cobrar
          {!vacio && <span className="tabular-nums">· {formatSoles(total)}</span>}
        </button>
      </div>
    </div>
  )
}
