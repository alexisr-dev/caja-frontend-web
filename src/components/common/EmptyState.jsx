export default function EmptyState({ icon: Icon, titulo, descripcion, accion }) {
  return (
    <div className="panel py-16 flex flex-col items-center text-center">
      {Icon && (
        <div className="tag-price tag-price-muted w-[132px] h-16 flex items-center justify-center mb-5 pl-5">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <p className="text-[17px] font-extrabold text-gray-900">{titulo}</p>
      {descripcion && <p className="text-sm text-gray-500 mt-1 mb-5">{descripcion}</p>}
      {accion}
    </div>
  )
}
