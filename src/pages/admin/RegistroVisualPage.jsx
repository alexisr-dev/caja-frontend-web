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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Registro visual IA</h1>
      <p className="text-gray-500 text-sm mb-6">
        Sube fotos de productos para entrenar el catálogo de reconocimiento por imagen (YOLO + CLIP).
      </p>

      <div className="flex gap-6 items-start">

        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 space-y-5">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Producto</label>
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
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {mostrarOpciones && busqueda && productosFiltrados.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {productosFiltrados.map(p => (
                    <li
                      key={p.sku}
                      onMouseDown={() => seleccionarProducto(p)}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10"
                    >
                      <span className="font-medium">{p.nombre}</span>
                      <span className="text-gray-400 ml-2 text-xs">{p.sku}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {sku && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{nombreProducto}</span>
                <span className="text-gray-400 ml-2 text-xs">{sku}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-semibold">
                <Hash size={14} />
                <span className="text-lg">{sufijo}</span>
              </div>
            </div>
          )}

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-contain rounded-xl" />
            ) : (
              <>
                <Upload size={36} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Haz clic para seleccionar foto</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {idChroma && (
            <p className="text-xs text-gray-400 text-center">
              Se registrará como <span className="font-mono font-medium text-gray-600">{idChroma}</span>
            </p>
          )}

          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubir}
            disabled={uploading || !sku || !archivo}
          >
            {uploading ? 'Registrando...' : `Registrar foto ${sufijo}`}
          </Button>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-yellow-500" />
            <h2 className="font-semibold text-gray-800">Cómo preparar las fotos</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            YOLO detecta el producto en la imagen y CLIP genera el vector de reconocimiento.
            La calidad de la foto impacta directamente en la precisión del reconocimiento.
          </p>

          <div className="space-y-2 mb-6">
            {TIPS.filter(t => t.ok).map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                {t.texto}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Evitar</p>
            {TIPS.filter(t => !t.ok).map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-500">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                {t.texto}
              </div>
            ))}
          </div>

          <div className="mt-5 bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700">
            <strong>Tip:</strong> Registra entre 10 y 15 fotos por producto con diferentes ángulos e iluminaciones.
            CLIP necesita suficientes embeddings variados para lograr un reconocimiento robusto en condiciones reales.
          </div>
        </div>

      </div>
    </div>
  )
}
