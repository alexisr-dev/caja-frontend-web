import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getReporteVentas, getTopProductos, getStockBajo } from '../../api/reportes'
import Loader from '../../components/common/Loader'
import { formatSoles } from '../../utils/formatters'

export default function ReportesPage() {
  const [reporteVentas, setReporteVentas] = useState(null)
  const [topProductos, setTopProductos] = useState([])
  const [stockBajo, setStockBajo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [fechaHasta, setFechaHasta] = useState(() => new Date().toISOString().split('T')[0])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getReporteVentas({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta }),
      getTopProductos(),
      getStockBajo(),
    ]).then(([v, top, stock]) => {
      setReporteVentas(v)
      setTopProductos(Array.isArray(top) ? top : [])
      setStockBajo(stock)
    }).finally(() => setLoading(false))
  }, [fechaDesde, fechaHasta])

  if (loading) return <Loader />

  const porDia = reporteVentas?.por_dia ?? []
  const resumen = reporteVentas?.resumen ?? {}

  const productosAgotados = stockBajo?.agotados?.productos ?? []
  const productosBajos = stockBajo?.stock_bajo?.productos ?? []
  const todosStockBajo = [...productosAgotados, ...productosBajos]

  const topData = topProductos.map(p => ({
    nombre: p.nombre?.length > 20 ? p.nombre.slice(0, 20) + '…' : p.nombre,
    ventas: p.contador_ventas ?? 0,
  }))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reportes</h1>

      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Desde:</label>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Hasta:</label>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Total boletas</p>
          <p className="text-2xl font-bold">{resumen.boletas ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Total ventas</p>
          <p className="text-2xl font-bold text-green-600">{formatSoles(resumen.total_ventas ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Ticket promedio</p>
          <p className="text-2xl font-bold text-primary">{formatSoles(resumen.ticket_promedio ?? 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Ventas por día</h2>
        {porDia.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Sin ventas en el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={porDia}>
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => formatSoles(v)} />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Top productos más vendidos</h2>
          {topData.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-1">Stock bajo / agotado</h2>
          <p className="text-xs text-gray-400 mb-4">
            {stockBajo?.agotados?.cantidad ?? 0} agotados · {stockBajo?.stock_bajo?.cantidad ?? 0} bajo mínimo
          </p>
          <div className="space-y-2 overflow-y-auto max-h-56">
            {todosStockBajo.map(p => (
              <div key={p.sku} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <div>
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>{p.stock} u.</p>
                  <p className="text-xs text-gray-400">mín. {p.stock_minimo}</p>
                </div>
              </div>
            ))}
            {todosStockBajo.length === 0 && <p className="text-gray-400 text-sm">Stock en orden</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
