/**
 * Placeholder de carga con forma de fila de tabla.
 * `avatar` usa un circulo (usuarios) en lugar de un cuadrado (productos).
 */
export default function SkeletonRows({ filas = 8, avatar = false }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className={`w-11 h-11 bg-gray-100 shrink-0 ${avatar ? 'rounded-full' : 'rounded-lg'}`} />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/5" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-16" />
          <div className="h-6 bg-gray-100 rounded-full w-12" />
        </div>
      ))}
    </div>
  )
}

/** Variante en rejilla, para las vistas de tarjetas. */
export function SkeletonCards({ tarjetas = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: tarjetas }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-100" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
