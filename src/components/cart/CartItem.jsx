import { Trash2, ImageOff } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatSoles } from '../../utils/formatters'

export default function CartItem({ item, bloqueado = false }) {
  const { actualizarCantidad, quitarItem } = useCart()

  const img = item.imagen_principal ?? item.primera_foto ?? item.fotos?.[0]?.imagen

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Miniatura */}
      <div className="shrink-0 w-14 h-14 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
        {img
          ? <img src={img} alt={item.nombre} className="max-w-full max-h-full object-contain" />
          : <ImageOff size={18} className="text-gray-300" />}
      </div>

      {/* Detalle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight line-clamp-2">{item.nombre}</p>
          <button
            onClick={() => quitarItem(item.sku)}
            disabled={bloqueado}
            title="Quitar"
            className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={15} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{item.sku} · {formatSoles(item.precio)} c/u</p>

        <div className="flex items-center justify-between mt-2">
          {/* Control de cantidad */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => actualizarCantidad(item.sku, item.cantidad - 1)}
              disabled={bloqueado}
              className="w-6 h-6 flex items-center justify-center rounded-md border text-sm font-bold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
            <button
              onClick={() => actualizarCantidad(item.sku, item.cantidad + 1)}
              disabled={bloqueado}
              className="w-6 h-6 flex items-center justify-center rounded-md border text-sm font-bold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              +
            </button>
          </div>
          {/* Total de la línea */}
          <span className="text-sm font-semibold text-gray-900">
            {formatSoles(parseFloat(item.precio) * item.cantidad)}
          </span>
        </div>
      </div>
    </div>
  )
}
