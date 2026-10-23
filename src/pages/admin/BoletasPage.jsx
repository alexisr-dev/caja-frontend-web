import { useEffect, useState } from 'react'
import { getBoletas, anularBoleta } from '../../api/boletas'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { formatSoles, formatFechaHora } from '../../utils/formatters'
import { toast } from 'react-toastify'

const ESTADO_COLOR = {
  PENDIENTE: 'bg-warn-bg text-warn',
  PAGADA: 'bg-ok-bg text-ok',
  ANULADA: 'bg-err-bg text-err',
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
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <h1 className="page-title">Boletas</h1>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="field cursor-pointer font-semibold"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADA">Pagada</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="th-cell text-left">Número</th>
                <th className="th-cell text-left">Fecha</th>
                <th className="th-cell text-left">Cliente</th>
                <th className="th-cell text-left">Vendedor</th>
                <th className="th-cell text-right">Total</th>
                <th className="th-cell text-center">Estado</th>
                <th className="th-cell text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {boletas.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-[15px] font-extrabold tabular-nums">{b.numero}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-[13px] tabular-nums">{formatFechaHora(b.fecha)}</td>
                  <td className="px-4 py-3.5 text-gray-600">{b.cliente_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3.5 text-gray-600">{b.vendedor_email ?? '-'}</td>
                  <td className="px-4 py-3.5 text-right font-display text-[28px] font-extrabold leading-none tabular-nums">{formatSoles(b.total)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${ESTADO_COLOR[b.estado]}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {b.pdf_url && (
                        <a href={b.pdf_url} target="_blank" rel="noreferrer"
                          className="text-[13px] font-extrabold text-primary hover:underline">PDF</a>
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
          {boletas.length === 0 && <p className="text-center text-gray-500 py-8">No hay boletas</p>}
        </div>
      )}

      <Modal open={modalAnular} onClose={() => setModalAnular(false)} title="Anular boleta" size="sm">
        <div className="space-y-4">
          <p className="text-[15px] text-gray-600 leading-relaxed">Estás a punto de anular la boleta <b className="text-gray-900 tabular-nums">{seleccionada?.numero}</b>. Esta acción devolverá el stock.</p>
          <div className="flex flex-col gap-1.5">
            <label className="field-label">Motivo de anulación</label>
            <textarea
              className="field h-auto py-2.5 resize-none"
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
