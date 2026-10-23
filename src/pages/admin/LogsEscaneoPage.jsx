import { useEffect, useMemo, useState } from 'react'
import { getLogsEscaneo } from '../../api/ia'
import Loader from '../../components/common/Loader'
import StatCard from '../../components/common/StatCard'
import Select from '../../components/common/Select'
import { formatFechaHora, formatPorcentaje } from '../../utils/formatters'
import { RESULTADO_IA, RESULTADO_IA_LABEL } from '../../utils/constants'

const RESULTADO_COLOR = {
  [RESULTADO_IA.OK]: 'bg-ok-bg text-ok',
  [RESULTADO_IA.NO_DETECTADO]: 'bg-warn-bg text-warn',
  [RESULTADO_IA.DESCONOCIDO]: 'bg-warn-bg text-warn',
  [RESULTADO_IA.SKU_NO_EXISTE]: 'bg-err-bg text-err',
  [RESULTADO_IA.ERROR]: 'bg-err-bg text-err',
}

const OPCIONES_RESULTADO = [
  { value: '', label: 'Todos los resultados' },
  ...Object.values(RESULTADO_IA).map(valor => ({
    value: valor,
    label: RESULTADO_IA_LABEL[valor],
  })),
]

const COLUMNAS = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'modo', label: 'Modo' },
  { key: 'resultado', label: 'Resultado', align: 'text-center' },
  { key: 'producto', label: 'Producto' },
  { key: 'confianza', label: 'Confianza', align: 'text-right' },
  { key: 'latencia', label: 'Latencia', align: 'text-right' },
]

export default function LogsEscaneoPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroResultado, setFiltroResultado] = useState('')

  useEffect(() => {
    let vigente = true
    setLoading(true)
    getLogsEscaneo({ resultado: filtroResultado || undefined })
      .then(d => { if (vigente) setLogs(d.results ?? d) })
      .catch(() => { if (vigente) setLogs([]) })
      .finally(() => { if (vigente) setLoading(false) })
    return () => { vigente = false }
  }, [filtroResultado])

  const { total, exitosos, tasa } = useMemo(() => {
    const total = logs.length
    const exitosos = logs.filter(l => l.resultado === RESULTADO_IA.OK).length
    return { total, exitosos, tasa: total > 0 ? (exitosos / total) * 100 : 0 }
  }, [logs])

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <h1 className="page-title">Logs de escaneo IA</h1>
        <Select
          value={filtroResultado}
          onChange={e => setFiltroResultado(e.target.value)}
          options={OPCIONES_RESULTADO}
        />
      </div>

      <div className="panel grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 overflow-hidden mb-6">
        <StatCard label="Total escaneos" value={total} />
        <StatCard label="Exitosos" value={exitosos} tone="success" />
        <StatCard label="Tasa de éxito" value={formatPorcentaje(tasa)} />
      </div>

      {loading ? <Loader /> : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNAS.map(c => (
                  <th key={c.key} className={`th-cell ${c.align ?? 'text-left'}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-[13px] tabular-nums">{formatFechaHora(l.fecha)}</td>
                  <td className="px-4 py-3 text-gray-600">{l.usuario_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 text-gray-500">{l.modo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${RESULTADO_COLOR[l.resultado] ?? 'bg-sunk text-gray-600'}`}>
                      {RESULTADO_IA_LABEL[l.resultado] ?? l.resultado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-[13px] font-bold tabular-nums tracking-wide">{l.producto_sku ?? '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-700 tabular-nums">
                    {l.confianza != null ? formatPorcentaje(l.confianza * 100) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                    {l.latencia_ms != null ? `${l.latencia_ms} ms` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center text-gray-500 py-8">No hay logs</p>}
        </div>
      )}
    </div>
  )
}
