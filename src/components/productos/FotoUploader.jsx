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
      <div className="flex flex-wrap gap-2">
        {fotos.map(foto => (
          <div key={foto.id} className="relative group w-24 h-24">
            <img src={foto.imagen} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              onClick={() => handleEliminar(foto.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Upload size={20} />
          <span className="text-xs mt-1">{uploading ? '...' : 'Agregar'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}
