import { useState } from 'react'
import { resolverOpciones } from './metodosPago'

/** Icono del medio de pago: imagen si existe, con emoji como respaldo. */
function MetodoIcono({ opcion }) {
  const [fallo, setFallo] = useState(false)
  const usarImagen = opcion.imagen && !fallo

  return (
    <div className={`
      flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden
      flex items-center justify-center text-2xl shadow-sm
      ${usarImagen ? 'bg-white' : `bg-gradient-to-br ${opcion.estilos.color}`}
      ${opcion.disponible ? 'group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300' : 'grayscale'}
    `}>
      {usarImagen
        ? <img src={opcion.imagen} alt={opcion.titulo} className="w-full h-full object-cover" onError={() => setFallo(true)} />
        : opcion.icono}
    </div>
  )
}

/** Selector de medio de pago, construido desde el registro `metodosPago`. */
export default function MetodoGrid({ total, onSeleccionar }) {
  const opciones = resolverOpciones(total)

  return (
    <div className="grid grid-cols-1 gap-3">
      {opciones.map(opcion => (
        <button
          key={opcion.id}
          type="button"
          onClick={() => opcion.disponible && onSeleccionar(opcion.id)}
          disabled={!opcion.disponible}
          className={`
            group relative w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300 ease-out
            ${opcion.disponible
              ? `border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-4 active:scale-[0.98] cursor-pointer ${opcion.estilos.hover}`
              : 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed'
            }
          `}
        >
          <MetodoIcono opcion={opcion} />
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-base ${opcion.disponible ? `text-gray-800 ${opcion.estilos.titleHover}` : 'text-gray-400'} transition-colors`}>
              {opcion.titulo}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{opcion.subtituloTexto}</p>
          </div>
          {opcion.disponible ? (
            <svg className={`w-5 h-5 text-gray-300 ${opcion.estilos.arrowHover} group-hover:translate-x-1 transition-all duration-300 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="px-2 py-1 rounded-lg bg-gray-200 text-gray-500 text-[10px] font-bold flex-shrink-0">
              NO DISPONIBLE
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
