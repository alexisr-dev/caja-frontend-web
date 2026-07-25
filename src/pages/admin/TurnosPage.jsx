import { useEffect, useState } from 'react'
import { getTurnos } from '../../api/turnos'
import Loader from '../../components/common/Loader'
import { formatSoles, formatFechaHora } from '../../utils/formatters'

export default function TurnosPage() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTurnos().then(d => setTurnos(d.results ?? d)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Turnos de caja</h1>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Apertura</th>
                <th className="px-4 py-3 text-left">Cierre</th>
                <th className="px-4 py-3 text-right">Monto inicial</th>
                <th className="px-4 py-3 text-right">Contado</th>
                <th className="px-4 py-3 text-right">Diferencia</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {turnos.map(t => {
                // El backend ya calcula la diferencia (null mientras el turno sigue abierto).
                const diferencia = t.diferencia != null ? parseFloat(t.diferencia) : null
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{t.vendedor_email ?? t.vendedor}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatFechaHora(t.apertura_fecha)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.cierre_fecha ? formatFechaHora(t.cierre_fecha) : '-'}</td>
                    <td className="px-4 py-3 text-right">{formatSoles(t.monto_inicial)}</td>
                    <td className="px-4 py-3 text-right">{t.monto_contado_cierre != null ? formatSoles(t.monto_contado_cierre) : '-'}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${diferencia === null ? '' : diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {diferencia === null ? '-' : formatSoles(diferencia)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.estado === 'ABIERTO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {turnos.length === 0 && <p className="text-center text-gray-400 py-8">No hay turnos registrados</p>}
        </div>
      )}
    </div>
  )
}
