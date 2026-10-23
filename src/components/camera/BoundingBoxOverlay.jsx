import { CheckCircle2 } from 'lucide-react'
import { CAP_W, CAP_H } from '../../hooks/useEscanerContinuo'

const ESQUINAS = [
  'top-0 left-0 border-t-[4px] border-l-[4px] rounded-tl-xl',
  'top-0 right-0 border-t-[4px] border-r-[4px] rounded-tr-xl',
  'bottom-0 left-0 border-b-[4px] border-l-[4px] rounded-bl-xl',
  'bottom-0 right-0 border-b-[4px] border-r-[4px] rounded-br-xl',
]

export default function BoundingBoxOverlay({ bbox, etiqueta, confirmado = false }) {
  if (!bbox) return null

  const acento = confirmado ? 'border-[#46D27B]' : 'border-gold'

  return (
    <div
      className="absolute rounded-xl pointer-events-none transition-all duration-150"
      style={{
        left: `${(bbox[0] / CAP_W) * 100}%`,
        top: `${(bbox[1] / CAP_H) * 100}%`,
        width: `${((bbox[2] - bbox[0]) / CAP_W) * 100}%`,
        height: `${((bbox[3] - bbox[1]) / CAP_H) * 100}%`,
        boxShadow: '0 0 0 9999px rgba(14,43,68,0.32)',
      }}
    >
      <div className={`absolute inset-0 rounded-xl border ${confirmado ? 'border-[#46D27B]/40' : 'border-gold/40'}`} />

      {ESQUINAS.map((posicion, i) => (
        <span key={i} className={`absolute w-8 h-8 ${posicion} ${acento}`} />
      ))}

      {!confirmado && (
        <span className="absolute left-2 right-2 h-[3px] rounded-full bg-gold/80 animate-[scanline_2.2s_ease-in-out_infinite]" />
      )}

      {etiqueta && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 -top-4 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-extrabold text-gray-900 shadow-pop ${
            confirmado ? 'bg-[#46D27B]' : 'bg-gold'
          }`}
        >
          {confirmado && <CheckCircle2 size={15} />}
          {etiqueta.nombre}
          {etiqueta.confianza != null && (
            <span className="tabular-nums">• {Math.round(etiqueta.confianza * 100)}%</span>
          )}
        </span>
      )}
    </div>
  )
}
