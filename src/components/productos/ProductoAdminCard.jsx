import { Pencil, Camera, GitBranch, TrendingUp, Trash2, RotateCcw, ImageOff } from 'lucide-react'
import { formatSoles } from '../../utils/formatters'
import StockBadge from './StockBadge'

export default function ProductoAdminCard({ producto, onEditar, onFotos, onVariante, onHistorial, onEliminar, onRestaurar }) {
  const img = producto.imagen_principal ?? producto.primera_foto
  const eliminado = producto.activo === false

  return (
    <div className={`group panel overflow-hidden flex flex-col transition-shadow duration-150 hover:shadow-float ${
      eliminado ? 'opacity-70' : ''
    }`}>
      <div className="relative h-40 bg-sunk flex items-center justify-center p-3">
        {img ? (
          <img src={img} alt={producto.nombre} loading="lazy" className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <ImageOff size={28} />
            <span className="text-xs">Sin foto</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <StockBadge producto={producto} />
        </div>
        {eliminado && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-err-bg text-err text-[10px] font-extrabold uppercase tracking-wide">
            Eliminado
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 tabular-nums tracking-wide">{producto.sku}</p>
        <p className="font-extrabold text-[15px] text-gray-900 leading-tight line-clamp-2 mt-0.5">{producto.nombre}</p>
        <p className="text-xs text-gray-500 mt-1">{producto.categoria_nombre ?? 'Sin categoría'}</p>
        <p className="font-display text-[34px] font-black leading-none text-gray-900 mt-2.5 tabular-nums">{formatSoles(producto.precio)}</p>

        <div className="flex items-center gap-0.5 mt-3 pt-3 border-t border-gray-200">
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
      aria-label={title}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-150 active:scale-95 ${
        danger ? 'text-gray-500 hover:text-err hover:bg-err-bg' : 'text-gray-500 hover:text-primary hover:bg-sunk'
      }`}
    >
      <Icon size={17} />
    </button>
  )
}
