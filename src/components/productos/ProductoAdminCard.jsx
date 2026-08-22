import { Pencil, Camera, GitBranch, TrendingUp, Trash2, RotateCcw, ImageOff } from 'lucide-react'
import { formatSoles } from '../../utils/formatters'
import StockBadge from './StockBadge'

export default function ProductoAdminCard({ producto, onEditar, onFotos, onVariante, onHistorial, onEliminar, onRestaurar }) {
  const img = producto.imagen_principal ?? producto.primera_foto
  const eliminado = producto.activo === false

  return (
    <div className={`group bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
      eliminado ? 'border-rose-200 opacity-70' : 'border-gray-100'
    }`}>
      <div className="relative h-40 bg-white border-b border-gray-100 flex items-center justify-center p-3">
        {img ? (
          <img src={img} alt={producto.nombre} loading="lazy" className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <ImageOff size={28} />
            <span className="text-xs">Sin foto</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StockBadge producto={producto} />
        </div>
        {eliminado && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold uppercase tracking-wide">
            Eliminado
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="font-mono text-xs text-gray-400">{producto.sku}</p>
        <p className="font-medium text-sm text-gray-900 leading-tight line-clamp-2">{producto.nombre}</p>
        <p className="text-xs text-gray-500 mt-0.5">{producto.categoria_nombre ?? 'Sin categoría'}</p>
        <p className="text-primary font-bold mt-2">{formatSoles(producto.precio)}</p>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <IconBtn icon={Pencil} title="Editar" onClick={() => onEditar(producto)} />
          <IconBtn icon={Camera} title="Fotos" onClick={() => onFotos(producto)} />
          <IconBtn icon={GitBranch} title="Nueva variante" onClick={() => onVariante(producto)} />
          <IconBtn icon={TrendingUp} title="Historial de precios" onClick={() => onHistorial(producto)} />
          <div className="flex-1" />
          {eliminado
            ? <IconBtn icon={RotateCcw} title="Restaurar" onClick={() => onRestaurar(producto.sku)} />
            : <IconBtn icon={Trash2} title="Eliminar" danger onClick={() => onEliminar(producto.sku)} />}
        </div>
      </div>
    </div>
  )
}

function IconBtn({ icon: Icon, title, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        danger ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' : 'text-gray-400 hover:text-primary hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
    </button>
  )
}
