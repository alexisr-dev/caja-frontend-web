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
    <div className="p-8">
      <h1 className="page-title mb-6">Turnos de caja</h1>

      {loading ? <Loader /> : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="th-cell text-left">Vendedor</th>
                <th className="th-cell text-left">Apertura</th>
                <th className="th-cell text-left">Cierre</th>
                <th className="th-cell text-right">Monto inicial</th>
                <th className="th-cell text-right">Contado</th>
                <th className="th-cell text-right">Diferencia</th>
                <th className="th-cell text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {turnos.map(t => {
                const diferencia = t.diferencia != null ? parseFloat(t.diferencia) : null
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-extrabold">{t.vendedor_email ?? t.vendedor}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-[13px] tabular-nums">{formatFechaHora(t.apertura_fecha)}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-[13px] tabular-nums">{t.cierre_fecha ? formatFechaHora(t.cierre_fecha) : '-'}</td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums">{formatSoles(t.monto_inicial)}</td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums">{t.monto_contado_cierre != null ? formatSoles(t.monto_contado_cierre) : '-'}</td>
                    <td className={`px-4 py-3.5 text-right font-display text-[26px] font-black leading-none tabular-nums ${diferencia === null ? '' : diferencia >= 0 ? 'text-ok' : 'text-err'}`}>
                      {diferencia === null ? '-' : formatSoles(diferencia)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${t.estado === 'ABIERTO' ? 'bg-ok-bg text-ok' : 'bg-sunk text-gray-600'}`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {turnos.length === 0 && <p className="text-center text-gray-500 py-8">No hay turnos registrados</p>}
        </div>
      )}
    </div>
  )
}
