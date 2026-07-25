import { useEffect, useMemo, useState } from 'react'
import { ScanLine, CheckCircle2, Percent } from 'lucide-react'
import { getLogsEscaneo } from '../../api/ia'
import Loader from '../../components/common/Loader'
import StatCard from '../../components/common/StatCard'
import Select from '../../components/common/Select'
import { formatFechaHora, formatPorcentaje } from '../../utils/formatters'
import { RESULTADO_IA, RESULTADO_IA_LABEL } from '../../utils/constants'

const RESULTADO_COLOR = {
  [RESULTADO_IA.OK]: 'bg-green-100 text-green-700',
  [RESULTADO_IA.NO_DETECTADO]: 'bg-yellow-100 text-yellow-700',
  [RESULTADO_IA.DESCONOCIDO]: 'bg-orange-100 text-orange-700',
  [RESULTADO_IA.SKU_NO_EXISTE]: 'bg-red-100 text-red-700',
  [RESULTADO_IA.ERROR]: 'bg-red-100 text-red-700',
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Logs de escaneo IA</h1>
        <Select
          value={filtroResultado}
          onChange={e => setFiltroResultado(e.target.value)}
          options={OPCIONES_RESULTADO}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total escaneos" value={total} icon={ScanLine} />
        <StatCard label="Exitosos" value={exitosos} icon={CheckCircle2} tone="success" />
        <StatCard label="Tasa de éxito" value={formatPorcentaje(tasa)} icon={Percent} />
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                {COLUMNAS.map(c => (
                  <th key={c.key} className={`px-4 py-3 ${c.align ?? 'text-left'}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFechaHora(l.fecha)}</td>
                  <td className="px-4 py-3 text-gray-600">{l.usuario_email ?? 'Anónimo'}</td>
                  <td className="px-4 py-3 text-gray-500">{l.modo}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULTADO_COLOR[l.resultado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {RESULTADO_IA_LABEL[l.resultado] ?? l.resultado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{l.producto_sku ?? '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {l.confianza != null ? formatPorcentaje(l.confianza * 100) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {l.latencia_ms != null ? `${l.latencia_ms} ms` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-center text-gray-400 py-8">No hay logs</p>}
        </div>
      )}
    </div>
  )
}
