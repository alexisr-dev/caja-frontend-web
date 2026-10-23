export default function SkeletonRows({ filas = 8, avatar = false }) {
  return (
    <div className="panel overflow-hidden divide-y divide-gray-200">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className={`w-11 h-11 bg-sunk shrink-0 ${avatar ? 'rounded-full' : 'rounded-xl'}`} />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-sunk rounded-lg w-1/3" />
            <div className="h-3 bg-sunk rounded-lg w-1/5" />
          </div>
          <div className="h-4 bg-sunk rounded-lg w-16" />
          <div className="h-6 bg-sunk rounded-full w-12" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCards({ tarjetas = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: tarjetas }).map((_, i) => (
        <div key={i} className="panel overflow-hidden animate-pulse">
          <div className="h-36 bg-sunk" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-sunk rounded-lg w-1/3" />
            <div className="h-4 bg-sunk rounded-lg w-3/4" />
            <div className="h-4 bg-sunk rounded-lg w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
