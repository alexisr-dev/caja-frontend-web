import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, FolderTree, FolderSearch } from 'lucide-react'
import { categoriasApi } from '../../api/categorias'
import { useRecursoCrud } from '../../hooks/useRecursoCrud'
import SlideOver from '../../components/common/SlideOver'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import SearchInput from '../../components/common/SearchInput'
import EmptyState from '../../components/common/EmptyState'
import IconButton from '../../components/common/IconButton'

const FORM_VACIO = { nombre: '', descripcion: '' }

const MENSAJES = {
  creado: 'Categoría creada',
  actualizado: 'Categoría actualizada',
  eliminado: 'Categoría eliminada',
  errorGuardar: 'Error al guardar',
}

export default function CategoriasPage() {
  const { items: categorias, loading, saving, guardar, eliminar } = useRecursoCrud(
    categoriasApi,
    { mensajes: MENSAJES, confirmar: () => confirm('¿Eliminar categoría?') },
  )

  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [busqueda, setBusqueda] = useState('')

  const abrirCrear = () => {
    setSeleccionada(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  const abrirEditar = (categoria) => {
    setSeleccionada(categoria)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' })
    setModalAbierto(true)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    const exito = await guardar(form, seleccionada?.id ?? null)
    if (exito) setModalAbierto(false)
  }

  const categoriasVisibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const filtradas = !q
      ? categorias
      : categorias.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        (c.descripcion ?? '').toLowerCase().includes(q))
    return [...filtradas].sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [categorias, busqueda])

  const botonNueva = (
    <Button variant="primary" size="lg" onClick={abrirCrear}>
      <Plus size={18} className="mr-1.5" /> Nueva categoría
    </Button>
  )

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="text-[15px] text-gray-500 mt-2">Organiza tu catálogo en categorías</p>
        </div>
        {botonNueva}
      </div>

      <SearchInput
        value={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar categoría..."
        className="max-w-sm mb-4"
      />

      <p className="text-sm text-gray-500 mb-3">
        {loading
          ? 'Cargando…'
          : `${categoriasVisibles.length} ${categoriasVisibles.length === 1 ? 'categoría' : 'categorías'}`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-4 flex items-center gap-3 animate-pulse">
              <div className="w-[52px] h-[52px] rounded-[14px] bg-sunk shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-sunk rounded-lg w-1/2" />
                <div className="h-3 bg-sunk rounded-lg w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : categoriasVisibles.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          titulo="No se encontraron categorías"
          descripcion="Crea tu primera categoría para organizar productos."
          accion={botonNueva}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriasVisibles.map(categoria => (
            <div key={categoria.id} className="group panel p-4 flex items-center gap-3.5 transition-[box-shadow,border-color] duration-150 hover:border-primary hover:shadow-[0_0_0_3px_rgba(14,165,233,0.16)]">
              <div className="shrink-0 w-[52px] h-[52px] rounded-[14px] bg-sky-100 text-primary flex items-center justify-center">
                {categoria.imagen_icono
                  ? <img src={categoria.imagen_icono} alt="" className="w-8 h-8 object-contain" />
                  : <FolderTree size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-extrabold text-gray-900 truncate">{categoria.nombre}</p>
                <p className="text-[13.5px] text-gray-500 mt-0.5 line-clamp-2">
                  {categoria.descripcion || 'Sin descripción'}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(categoria)} size={16} />
                <IconButton icon={Trash2} title="Eliminar" danger onClick={() => eliminar(categoria.id)} size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      <SlideOver
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={seleccionada ? 'Editar categoría' : 'Nueva categoría'}
        subtitle={seleccionada ? seleccionada.nombre : 'Completa los datos de la categoría'}
        width="md"
      >
        <form onSubmit={handleGuardar} className="space-y-4">
          <Input
            label="Nombre"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            required
          />
          <Input
            label="Descripción"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
