import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { agregarFoto, eliminarFoto } from '../../api/productos'
import { toast } from 'react-toastify'

export default function FotoUploader({ sku, fotos = [], onActualizar }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('imagen', file)
      await agregarFoto(sku, fd)
      toast.success('Foto agregada')
      onActualizar()
    } catch {
      toast.error('Error al subir foto')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleEliminar = async (id) => {
    try {
      await eliminarFoto(id)
      toast.success('Foto eliminada')
      onActualizar()
    } catch {
      toast.error('Error al eliminar foto')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {fotos.map(foto => (
          <div key={foto.id} className="relative group w-28 h-28">
            <img src={foto.imagen} alt="" className="w-full h-full object-cover rounded-2xl bg-sunk" />
            <button
              onClick={() => handleEliminar(foto.id)}
              aria-label="Eliminar foto"
              className="absolute -top-2 -right-2 w-7 h-7 bg-err text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 bg-sunk shadow-[inset_0_0_0_2px_#CBC4AE] rounded-2xl flex flex-col items-center justify-center text-primary hover:shadow-[inset_0_0_0_2px_#0A4A78] transition-shadow disabled:opacity-50"
        >
          <Upload size={24} />
          <span className="text-[13px] font-extrabold mt-1">{uploading ? '...' : 'Agregar'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}
