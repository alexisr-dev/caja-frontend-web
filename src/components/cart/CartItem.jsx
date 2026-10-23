import { Trash2, ImageOff } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatSoles } from '../../utils/formatters'

const stepperBtn = 'w-9 h-9 inline-flex items-center justify-center text-lg font-extrabold text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500'

export default function CartItem({ item, bloqueado = false }) {
  const { actualizarCantidad, quitarItem } = useCart()

  const img = item.imagen_principal ?? item.primera_foto ?? item.fotos?.[0]?.imagen

  return (
    <div className="flex gap-3.5 py-3.5 border-b border-gray-200 last:border-0">
      <div className="shrink-0 w-14 h-14 rounded-xl bg-sunk flex items-center justify-center overflow-hidden">
        {img
          ? <img src={img} alt={item.nombre} className="max-w-full max-h-full object-contain" />
          : <ImageOff size={18} className="text-gray-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-bold leading-tight line-clamp-2 text-gray-900">{item.nombre}</p>
          <span className="shrink-0 font-display text-2xl font-extrabold leading-none text-gray-900 tabular-nums">
            {formatSoles(parseFloat(item.precio) * item.cantidad)}
          </span>
        </div>
        <p className="text-[12.5px] text-gray-500 mt-1 tabular-nums">{item.sku} · {formatSoles(item.precio)} c/u</p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="inline-flex items-center rounded-[10px] bg-sunk overflow-hidden">
            <button
              onClick={() => actualizarCantidad(item.sku, item.cantidad - 1)}
              disabled={bloqueado}
              className={stepperBtn}
            >
              −
            </button>
            <span className="min-w-[32px] text-center font-display text-[22px] font-extrabold leading-none tabular-nums">{item.cantidad}</span>
            <button
              onClick={() => actualizarCantidad(item.sku, item.cantidad + 1)}
              disabled={bloqueado}
              className={stepperBtn}
            >
              +
            </button>
          </div>
          <button
            onClick={() => quitarItem(item.sku)}
            disabled={bloqueado}
            title="Quitar"
            className="shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-[10px] text-gray-400 hover:text-err hover:bg-err-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
