import { useEffect, useState } from 'react'
import { getBoletas } from '../../api/boletas'
import Loader from '../../components/common/Loader'
import { formatSoles, formatFechaHora } from '../../utils/formatters'

const ESTADO_COLOR = {
  PENDIENTE: 'bg-warn-bg text-warn',
  PAGADA: 'bg-ok-bg text-ok',
  ANULADA: 'bg-err-bg text-err',
}

export default function HistorialBoletasPage() {
  const [boletas, setBoletas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBoletas().then(d => setBoletas(d.results ?? d)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <h1 className="page-title mb-6">Mis boletas</h1>

      {loading ? <Loader /> : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="th-cell text-left">Número</th>
                <th className="th-cell text-left">Fecha</th>
                <th className="th-cell text-left">Cliente</th>
                <th className="th-cell text-right">Total</th>
                <th className="th-cell text-center">Estado</th>
                <th className="th-cell text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {boletas.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-[15px] font-extrabold tabular-nums">{b.numero}</td>
                  <td className="px-4 py-4 text-gray-500 text-[13.5px] tabular-nums">{formatFechaHora(b.fecha)}</td>
                  <td className="px-4 py-4 text-gray-600">{b.cliente_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-4 text-right font-display text-[28px] font-extrabold leading-none tabular-nums">{formatSoles(b.total)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${ESTADO_COLOR[b.estado]}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {b.pdf_url
                      ? <a href={b.pdf_url} target="_blank" rel="noreferrer" className="text-[13.5px] font-extrabold text-primary underline-offset-2 hover:underline">Ver PDF</a>
                      : <span className="text-gray-300">-</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {boletas.length === 0 && <p className="text-center text-gray-500 py-8">No hay boletas registradas</p>}
        </div>
      )}
    </div>
  )
}
