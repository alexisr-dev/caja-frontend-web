/**
 * Estado vacio de un listado: icono, mensaje y (opcionalmente) una accion.
 * Antes cada pantalla repetia este bloque con el mismo markup.
 */
export default function EmptyState({ icon: Icon, titulo, descripcion, accion }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 flex flex-col items-center text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon size={26} className="text-gray-400" />
        </div>
      )}
      <p className="font-medium text-gray-700">{titulo}</p>
      {descripcion && <p className="text-sm text-gray-400 mt-1 mb-5">{descripcion}</p>}
      {accion}
    </div>
  )
}
