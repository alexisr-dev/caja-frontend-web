import { CheckCircle2 } from 'lucide-react'
import { CAP_W, CAP_H } from '../../hooks/useEscanerContinuo'

/** Esquinas tipo corchete que enmarcan el producto detectado. */
const ESQUINAS = [
  'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl',
  'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl',
  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl',
  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl',
]

/**
 * Recuadro sobre el producto detectado.
 *
 * El bbox llega en pixeles del espacio de captura, asi que se convierte a
 * porcentajes para que siga al video sea cual sea su tamano en pantalla.
 *
 * @param {number[]} bbox        [x1, y1, x2, y2] en pixeles de captura.
 * @param {object}   etiqueta    { nombre, confianza } o null.
 * @param {boolean}  confirmado  true cuando el producto ya se agrego.
 */
export default function BoundingBoxOverlay({ bbox, etiqueta, confirmado = false }) {
  if (!bbox) return null

  const acento = confirmado ? 'border-green-400' : 'border-amber-400'

  return (
    <div
      className="absolute rounded-2xl pointer-events-none transition-all duration-150"
      style={{
        left: `${(bbox[0] / CAP_W) * 100}%`,
        top: `${(bbox[1] / CAP_H) * 100}%`,
        width: `${((bbox[2] - bbox[0]) / CAP_W) * 100}%`,
        height: `${((bbox[3] - bbox[1]) / CAP_H) * 100}%`,
        // Oscurece todo lo de fuera: efecto spotlight sobre el producto.
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.30)',
      }}
    >
      <div className={`absolute inset-0 rounded-2xl border ${confirmado ? 'border-green-400/40' : 'border-amber-400/40'}`} />

      {ESQUINAS.map((posicion, i) => (
        <span key={i} className={`absolute w-7 h-7 ${posicion} ${acento}`} />
      ))}

      {/* Linea de escaneo: solo mientras aun no hay confirmacion. */}
      {!confirmado && (
        <span className="absolute left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-[scanline_2.2s_ease-in-out_infinite]" />
      )}

      {etiqueta && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 -top-3.5 whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-md ${
            confirmado ? 'bg-green-500' : 'bg-amber-500'
          }`}
        >
          {confirmado && <CheckCircle2 size={13} />}
          {etiqueta.nombre}
          {etiqueta.confianza != null && (
            <span className="opacity-90">• {Math.round(etiqueta.confianza * 100)}%</span>
          )}
        </span>
      )}
    </div>
  )
}
