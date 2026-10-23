import { useRef, useState, useEffect } from 'react'
import { registroVisual } from '../../api/ia'
import { getProductos } from '../../api/productos'
import { Upload, CheckCircle, AlertCircle, Lightbulb, Hash } from 'lucide-react'
import Button from '../../components/common/Button'
import { toast } from 'react-toastify'

const TIPS = [
  { ok: true,  texto: 'Fondo blanco o neutro, sin objetos de fondo' },
  { ok: true,  texto: 'Un solo producto por foto, centrado' },
  { ok: true,  texto: 'Buena iluminación, sin sombras ni reflejos' },
  { ok: true,  texto: 'Imagen nítida, no movida ni desenfocada' },
  { ok: true,  texto: 'Varía el ángulo e iluminación entre fotos' },
  { ok: false, texto: 'Imagen borrosa o con movimiento' },
  { ok: false, texto: 'Varios productos juntos en la misma foto' },
  { ok: false, texto: 'Flash directo que crea reflejos blancos' },
  { ok: false, texto: 'Más de 5 MB de peso' },
]

export default function RegistroVisualPage() {
  const [productos, setProductos] = useState([])
  const [sku, setSku]             = useState('')
  const [nombreProducto, setNombreProducto] = useState('')
  const [contador, setContador]   = useState(1)
  const [preview, setPreview]     = useState(null)
  const [archivo, setArchivo]     = useState(null)
  const [uploading, setUploading] = useState(false)
  const [busqueda, setBusqueda]   = useState('')
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    getProductos({ page_size: 200 }).then(d => setProductos(d.results ?? d))
  }, [])

  const productosFiltrados = productos.filter(p =>
    !busqueda ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 10)

  const seleccionarProducto = (p) => {
    setSku(p.sku)
    setNombreProducto(p.nombre)
    setBusqueda(`${p.nombre} (${p.sku})`)
    setContador(1)
    setPreview(null)
    setArchivo(null)
    setMostrarOpciones(false)
  }

  const sufijo = String(contador).padStart(2, '0')
  const idChroma = sku ? `${sku}_${sufijo}` : null

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleSubir = async () => {
    if (!sku || !archivo) return toast.error('Selecciona producto y foto')
    setUploading(true)
    try {
      await registroVisual(sku, archivo, sufijo)
      toast.success(`Foto ${sufijo} registrada`)
      setContador(c => c + 1)
      setPreview(null)
      setArchivo(null)
    } catch {
      toast.error('Error al registrar imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="page-title mb-3">Registro visual IA</h1>
      <p className="text-gray-500 text-[15px] mb-6">
        Sube fotos de productos para entrenar el catálogo de reconocimiento por imagen (YOLO + CLIP).
      </p>

      <div className="flex flex-col xl:flex-row gap-6 items-start">

        <div className="w-full max-w-md panel p-6 space-y-5">

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Producto</label>
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={e => {
                  setBusqueda(e.target.value)
                  setSku('')
                  setNombreProducto('')
                  setContador(1)
                  setMostrarOpciones(true)
                }}
                onFocus={() => setMostrarOpciones(true)}
                onBlur={() => setTimeout(() => setMostrarOpciones(false), 150)}
                placeholder="Buscar por nombre o SKU..."
                className="field w-full"
              />
              {mostrarOpciones && busqueda && productosFiltrados.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-pop mt-1.5 max-h-52 overflow-y-auto p-1.5 animate-pop-in">
                  {productosFiltrados.map(p => (
                    <li
                      key={p.sku}
                      onMouseDown={() => seleccionarProducto(p)}
                      className="px-3 py-2.5 text-sm rounded-lg cursor-pointer hover:bg-sky-50"
                    >
                      <span className="font-bold">{p.nombre}</span>
                      <span className="text-gray-500 ml-2 text-xs tabular-nums">{p.sku}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {sku && (
            <div className="flex items-center justify-between bg-sunk rounded-xl px-4 py-3">
              <div className="text-sm text-gray-600">
                <span className="font-extrabold text-gray-900">{nombreProducto}</span>
                <span className="text-gray-500 ml-2 text-xs tabular-nums">{sku}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary">
                <Hash size={15} />
                <span className="font-display text-[34px] font-black leading-none tabular-nums">{sufijo}</span>
              </div>
            </div>
          )}

          <div
            onClick={() => inputRef.current?.click()}
            className="bg-sunk shadow-[inset_0_0_0_2px_#CBC4AE] rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer hover:shadow-[inset_0_0_0_2px_#0A4A78] transition-shadow"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-contain rounded-2xl" />
            ) : (
              <>
                <Upload size={36} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-semibold">Haz clic para seleccionar foto</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {idChroma && (
            <p className="text-xs text-gray-500 text-center">
              Se registrará como <span className="font-extrabold text-gray-800 tabular-nums">{idChroma}</span>
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubir}
            disabled={uploading || !sku || !archivo}
          >
            {uploading ? 'Registrando...' : `Registrar foto ${sufijo}`}
          </Button>
        </div>

        <div className="flex-1 min-w-0 panel p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-9 h-9 rounded-[10px] bg-gold-soft text-warn flex items-center justify-center">
              <Lightbulb size={18} />
            </span>
            <h2 className="text-lg font-extrabold text-gray-900">Cómo preparar las fotos</h2>
          </div>
          <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
            YOLO detecta el producto en la imagen y CLIP genera el vector de reconocimiento.
            La calidad de la foto impacta directamente en la precisión del reconocimiento.
          </p>

          <div className="space-y-2.5 mb-6">
            {TIPS.filter(t => t.ok).map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[14.5px] text-gray-800">
                <CheckCircle size={17} className="text-ok mt-0.5 shrink-0" />
                {t.texto}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2.5">
            <p className="text-xs font-extrabold text-gray-500 mb-2">Evitar</p>
            {TIPS.filter(t => !t.ok).map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[14.5px] text-gray-600">
                <AlertCircle size={17} className="text-err mt-0.5 shrink-0" />
                {t.texto}
              </div>
            ))}
          </div>

          <div className="mt-5 bg-sky-50 rounded-xl px-4 py-3 text-[13px] text-[#075985] leading-relaxed">
            <strong>Tip:</strong> Registra entre 10 y 15 fotos por producto con diferentes ángulos e iluminaciones.
            CLIP necesita suficientes embeddings variados para lograr un reconocimiento robusto en condiciones reales.
          </div>
        </div>

      </div>
    </div>
  )
}
