import { useState } from 'react'
import { Plus, Pencil, Trash2, Percent } from 'lucide-react'
import { descuentosApi } from '../../api/descuentos'
import { useRecursoCrud } from '../../hooks/useRecursoCrud'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import EmptyState from '../../components/common/EmptyState'
import IconButton from '../../components/common/IconButton'
import DescuentoForm from '../../components/descuentos/DescuentoForm'
import { formatFecha, formatSoles } from '../../utils/formatters'
import { TIPO_DESCUENTO } from '../../utils/constants'

const MENSAJES = {
  creado: 'Descuento creado',
  actualizado: 'Descuento actualizado',
  eliminado: 'Descuento eliminado',
  errorGuardar: 'Error al guardar descuento',
}

const COLUMNAS = ['Producto', 'Tipo', 'Valor', 'Vigencia']

/** Representacion legible del valor segun el tipo de descuento. */
const formatearValor = (descuento) => {
  switch (descuento.tipo) {
    case TIPO_DESCUENTO.PORCENTAJE:
      return `${descuento.valor}%`
    case TIPO_DESCUENTO.MONTO_FIJO:
      return formatSoles(descuento.valor)
    default:
      return `${descuento.lleva_n}×${descuento.paga_m}`
  }
}

export default function DescuentosPage() {
  const { items: descuentos, loading, saving, guardar, eliminar } = useRecursoCrud(
    descuentosApi,
    { mensajes: MENSAJES, confirmar: () => confirm('¿Eliminar descuento?') },
  )

  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)

  const abrirCrear = () => { setSeleccionado(null); setModalAbierto(true) }
  const abrirEditar = (descuento) => { setSeleccionado(descuento); setModalAbierto(true) }

  const handleGuardar = async (data) => {
    const exito = await guardar(data, seleccionado?.id ?? null)
    if (exito) setModalAbierto(false)
  }

  const botonNuevo = (
    <Button variant="primary" onClick={abrirCrear}>
      <Plus size={16} className="mr-1" /> Nuevo descuento
    </Button>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Descuentos</h1>
        {botonNuevo}
      </div>

      {loading ? <Loader /> : descuentos.length === 0 ? (
        <EmptyState
          icon={Percent}
          titulo="No hay descuentos"
          descripcion="Crea una promoción para aplicarla automáticamente en caja."
          accion={botonNuevo}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                {COLUMNAS.map(c => <th key={c} className="px-4 py-3 text-left">{c}</th>)}
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {descuentos.map(descuento => (
                <tr key={descuento.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {descuento.producto?.nombre ?? descuento.producto}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{descuento.tipo}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    {formatearValor(descuento)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatFecha(descuento.fecha_inicio)} — {formatFecha(descuento.fecha_fin)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      descuento.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {descuento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(descuento)} size={15} />
                      <IconButton icon={Trash2} title="Eliminar" danger onClick={() => eliminar(descuento.id)} size={15} />
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
        title={seleccionado ? 'Editar descuento' : 'Nuevo descuento'}
      >
        <DescuentoForm descuento={seleccionado} onSubmit={handleGuardar} loading={saving} />
      </Modal>
    </div>
  )
}
