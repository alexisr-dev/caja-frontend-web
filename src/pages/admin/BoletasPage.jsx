import { useEffect, useState } from 'react'
import { getBoletas, anularBoleta } from '../../api/boletas'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { formatSoles, formatFechaHora } from '../../utils/formatters'
import { toast } from 'react-toastify'

const ESTADO_COLOR = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PAGADA: 'bg-green-100 text-green-700',
  ANULADA: 'bg-red-100 text-red-700',
}

export default function BoletasPage() {
  const [boletas, setBoletas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAnular, setModalAnular] = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const cargar = () => {
    setLoading(true)
    getBoletas({ estado: filtroEstado || undefined })
      .then(d => setBoletas(d.results ?? d))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [filtroEstado])

  const handleAnular = async () => {
    try {
      await anularBoleta(seleccionada.id, motivo)
      toast.success('Boleta anulada')
      setModalAnular(false)
      cargar()
    } catch {
      toast.error('Error al anular boleta')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Boletas</h1>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADA">Pagada</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boletas.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{b.numero}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFechaHora(b.fecha)}</td>
                  <td className="px-4 py-3 text-gray-600">{b.cliente_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 text-gray-600">{b.vendedor_email ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatSoles(b.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[b.estado]}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {b.pdf_url && (
                        <a href={b.pdf_url} target="_blank" rel="noreferrer"
                          className="text-xs text-primary hover:underline">PDF</a>
                      )}
                      {b.estado === 'PAGADA' && (
                        <Button size="sm" variant="danger" onClick={() => { setSeleccionada(b); setMotivo(''); setModalAnular(true) }}>
                          Anular
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {boletas.length === 0 && <p className="text-center text-gray-400 py-8">No hay boletas</p>}
        </div>
      )}

      <Modal open={modalAnular} onClose={() => setModalAnular(false)} title="Anular boleta" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Estás a punto de anular la boleta <b>{seleccionada?.numero}</b>. Esta acción devolverá el stock.</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Motivo de anulación</label>
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalAnular(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleAnular} disabled={!motivo}>Confirmar anulación</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
