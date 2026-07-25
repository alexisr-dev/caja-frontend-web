import { useState } from 'react'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { proveedoresApi } from '../../api/proveedores'
import { useRecursoCrud } from '../../hooks/useRecursoCrud'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import IconButton from '../../components/common/IconButton'

const FORM_VACIO = {
  ruc: '', razon_social: '', telefono: '', email: '', direccion: '', persona_contacto: '',
}

const MENSAJES = {
  creado: 'Proveedor creado',
  actualizado: 'Proveedor actualizado',
  eliminado: 'Proveedor eliminado',
  errorGuardar: 'Error al guardar proveedor',
}

const COLUMNAS = ['RUC', 'Razón social', 'Teléfono', 'Contacto']

export default function ProveedoresPage() {
  const { items: proveedores, loading, saving, guardar, eliminar } = useRecursoCrud(
    proveedoresApi,
    { mensajes: MENSAJES, confirmar: () => confirm('¿Eliminar proveedor?') },
  )

  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)

  const abrirCrear = () => {
    setSeleccionado(null)
    setForm(FORM_VACIO)
    setModalAbierto(true)
  }

  const abrirEditar = (proveedor) => {
    setSeleccionado(proveedor)
    setForm(proveedor)
    setModalAbierto(true)
  }

  const set = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))

  const handleGuardar = async (e) => {
    e.preventDefault()
    // El backend identifica al proveedor por su PK, no por el RUC.
    const exito = await guardar(form, seleccionado?.id ?? null)
    if (exito) setModalAbierto(false)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Button variant="primary" onClick={abrirCrear}>
          <Plus size={16} className="mr-1" /> Nuevo proveedor
        </Button>
      </div>

      {loading ? <Loader /> : proveedores.length === 0 ? (
        <EmptyState
          icon={Truck}
          titulo="No hay proveedores"
          descripcion="Registra tu primer proveedor para asociarlo a los productos."
          accion={(
            <Button variant="primary" onClick={abrirCrear}>
              <Plus size={16} className="mr-1" /> Nuevo proveedor
            </Button>
          )}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                {COLUMNAS.map(c => <th key={c} className="px-4 py-3 text-left">{c}</th>)}
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proveedores.map(proveedor => (
                <tr key={proveedor.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{proveedor.ruc}</td>
                  <td className="px-4 py-3 font-medium">{proveedor.razon_social}</td>
                  <td className="px-4 py-3 text-gray-500">{proveedor.telefono || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{proveedor.persona_contacto || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(proveedor)} size={15} />
                      <IconButton icon={Trash2} title="Eliminar" danger onClick={() => eliminar(proveedor.id)} size={15} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={seleccionado ? 'Editar proveedor' : 'Nuevo proveedor'}
        size="lg"
      >
        <form onSubmit={handleGuardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="RUC (11 dígitos)"
              value={form.ruc}
              onChange={set('ruc')}
              maxLength={11}
              disabled={!!seleccionado}
              required
            />
            <Input label="Razón social" value={form.razon_social} onChange={set('razon_social')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
          </div>
          <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
          <Input label="Persona de contacto" value={form.persona_contacto} onChange={set('persona_contacto')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
