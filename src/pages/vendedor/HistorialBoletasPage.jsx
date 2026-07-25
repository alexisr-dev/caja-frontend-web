import { useEffect, useState } from 'react'
import { getBoletas } from '../../api/boletas'
import Loader from '../../components/common/Loader'
import { formatSoles, formatFechaHora } from '../../utils/formatters'

const ESTADO_COLOR = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PAGADA: 'bg-green-100 text-green-700',
  ANULADA: 'bg-red-100 text-red-700',
}

export default function HistorialBoletasPage() {
  const [boletas, setBoletas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBoletas().then(d => setBoletas(d.results ?? d)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mis boletas</h1>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boletas.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{b.numero}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFechaHora(b.fecha)}</td>
                  <td className="px-4 py-3 text-gray-600">{b.cliente_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatSoles(b.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[b.estado]}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.pdf_url
                      ? <a href={b.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Ver PDF</a>
                      : <span className="text-gray-300">-</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {boletas.length === 0 && <p className="text-center text-gray-400 py-8">No hay boletas registradas</p>}
        </div>
      )}
    </div>
  )
}
