import { useRef } from 'react'
import Webcam from 'react-webcam'
import { Loader2 } from 'lucide-react'
import { useEscanerContinuo, CAP_W, CAP_H } from '../../hooks/useEscanerContinuo'
import BoundingBoxOverlay from './BoundingBoxOverlay'

export default function CameraCapture({ onReconocido, pausado = false }) {
  const webcamRef = useRef(null)
  const { bbox, estado, etiqueta } = useEscanerContinuo(webcamRef, onReconocido, pausado)

  const confirmado = estado === 'confirmado'

  return (
    <div className="relative w-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: CAP_W, height: CAP_H }}
        className="w-full rounded-xl"
      />

      {bbox && (
        <BoundingBoxOverlay bbox={bbox} etiqueta={etiqueta} confirmado={confirmado} />
      )}

      {!bbox && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 text-white text-xs backdrop-blur-sm">
            <Loader2 size={14} className="animate-spin" />
            Buscando producto…
          </span>
        </div>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-medium backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        EN VIVO
      </div>
    </div>
  )
}
