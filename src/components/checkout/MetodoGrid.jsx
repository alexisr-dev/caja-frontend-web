import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { resolverOpciones } from './metodosPago'

function MetodoIcono({ opcion }) {
  const [fallo, setFallo] = useState(false)
  const usarImagen = opcion.imagen && !fallo
  const Icono = opcion.Icono

  return (
    <div className={`
      shrink-0 w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center
      ${usarImagen ? 'bg-white border border-gray-200' : opcion.estilos.tile}
      ${opcion.disponible ? '' : 'grayscale opacity-60'}
    `}>
      {usarImagen
        ? <img src={opcion.imagen} alt={opcion.titulo} className="w-full h-full object-cover" onError={() => setFallo(true)} />
        : Icono
          ? <Icono size={28} />
          : <span className="text-2xl">{opcion.icono}</span>}
    </div>
  )
}

export default function MetodoGrid({ total, onSeleccionar }) {
  const opciones = resolverOpciones(total)

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {opciones.map(opcion => (
        <button
          key={opcion.id}
          type="button"
          onClick={() => opcion.disponible && onSeleccionar(opcion.id)}
          disabled={!opcion.disponible}
          className={`
            group w-full flex items-center gap-4 px-[18px] h-20 rounded-2xl border-[1.5px] text-left bg-white
            transition-[border-color,box-shadow,transform] duration-150
            ${opcion.disponible
              ? `border-gray-200 active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20 ${opcion.estilos.hover}`
              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }
          `}
        >
          <MetodoIcono opcion={opcion} />
          <div className="flex-1 min-w-0">
            <p className={`font-extrabold text-lg ${opcion.disponible ? 'text-gray-900' : 'text-gray-400'}`}>
              {opcion.titulo}
            </p>
            <p className="text-[13px] text-gray-500 leading-snug mt-0.5">{opcion.subtituloTexto}</p>
          </div>
          {opcion.disponible ? (
            <ChevronRight size={20} className="text-gray-400 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-sunk text-gray-500 text-[11px] font-extrabold shrink-0">
              NO DISPONIBLE
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
