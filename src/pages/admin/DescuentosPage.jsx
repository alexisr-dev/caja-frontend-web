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
    <Button variant="primary" size="lg" onClick={abrirCrear}>
      <Plus size={18} className="mr-1.5" /> Nuevo descuento
    </Button>
  )

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <h1 className="page-title">Descuentos</h1>
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
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNAS.map(c => <th key={c} className="th-cell text-left">{c}</th>)}
                <th className="th-cell text-center">Estado</th>
                <th className="th-cell text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {descuentos.map(descuento => (
                <tr key={descuento.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-[15px] font-extrabold">
                    {descuento.producto?.nombre ?? descuento.producto}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500">{descuento.tipo}</td>
                  <td className="px-4 py-3.5">
                    <span className="tag-chip inline-flex items-center h-8 pr-3.5 bg-gold text-gray-900 font-display text-2xl font-black leading-none tabular-nums">
                      {formatearValor(descuento)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-[13px] tabular-nums">
                    {formatFecha(descuento.fecha_inicio)} — {formatFecha(descuento.fecha_fin)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${
                      descuento.activo ? 'bg-ok-bg text-ok' : 'bg-sunk text-gray-500'
                    }`}>
                      {descuento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(descuento)} size={16} />
                      <IconButton icon={Trash2} title="Eliminar" danger onClick={() => eliminar(descuento.id)} size={16} />
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
