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
    <div className="relative w-full overflow-hidden rounded-xl">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: CAP_W, height: CAP_H }}
        className="w-full"
      />

      {bbox && (
        <BoundingBoxOverlay bbox={bbox} etiqueta={etiqueta} confirmado={confirmado} />
      )}

      {!bbox && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-navy text-white text-[13px] font-bold">
            <Loader2 size={15} className="animate-spin" />
            Buscando producto…
          </span>
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-navy text-white text-[12px] font-extrabold">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#46D27B] opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#46D27B]" />
        </span>
        EN VIVO
      </div>
    </div>
  )
}
