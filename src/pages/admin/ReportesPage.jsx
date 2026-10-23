import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { getReporteVentas, getTopProductos, getStockBajo } from '../../api/reportes'
import Loader from '../../components/common/Loader'
import { formatSoles } from '../../utils/formatters'

const TOOLTIP_STYLE = { borderRadius: 12, border: '1px solid #E2DDCD', fontWeight: 700 }
const TICK = { fontSize: 11, fill: '#4F5D6B' }

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
    <div className="p-8 space-y-5">
      <h1 className="page-title">Reportes</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2.5 text-sm">
          <label className="font-bold text-gray-700">Desde:</label>
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
            className="field tabular-nums font-semibold" />
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <label className="font-bold text-gray-700">Hasta:</label>
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
            className="field tabular-nums font-semibold" />
        </div>
      </div>

      <div className="panel grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-[13px] font-bold text-gray-500">Total boletas</p>
          <p className="font-display text-[44px] font-black leading-none mt-1 tabular-nums">{resumen.boletas ?? 0}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] font-bold text-gray-500">Total ventas</p>
          <p className="font-display text-[44px] font-black leading-none mt-1 tabular-nums text-ok">{formatSoles(resumen.total_ventas ?? 0)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] font-bold text-gray-500">Ticket promedio</p>
          <p className="font-display text-[44px] font-black leading-none mt-1 tabular-nums text-primary">{formatSoles(resumen.ticket_promedio ?? 0)}</p>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-extrabold mb-4">Ventas por día</h2>
        {porDia.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Sin ventas en el período</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={porDia} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E2DDCD" />
              <XAxis dataKey="fecha" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#66727F' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => formatSoles(v)} contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0A4A78"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#F5B31B', stroke: '#16202B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="panel p-6">
          <h2 className="text-lg font-extrabold mb-4">Top productos más vendidos</h2>
          {topData.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="#E2DDCD" />
                <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" tick={{ fontSize: 12, fill: '#16202B' }} width={150} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(14,43,68,0.06)' }} />
                <Bar dataKey="ventas" fill="#9DB8CE" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-extrabold mb-1">Stock bajo / agotado</h2>
          <p className="text-[13px] text-gray-500 mb-4">
            {stockBajo?.agotados?.cantidad ?? 0} agotados · {stockBajo?.stock_bajo?.cantidad ?? 0} bajo mínimo
          </p>
          <div className="overflow-y-auto max-h-56">
            {todosStockBajo.map(p => (
              <div key={p.sku} className="flex items-center justify-between text-sm py-2.5 border-b border-gray-200 last:border-0">
                <div>
                  <p className="font-extrabold">{p.nombre}</p>
                  <p className="text-xs text-gray-500 tabular-nums">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className={`font-extrabold tabular-nums ${p.stock === 0 ? 'text-err' : 'text-warn'}`}>{p.stock} u.</p>
                  <p className="text-xs text-gray-500 tabular-nums">mín. {p.stock_minimo}</p>
                </div>
              </div>
            ))}
            {todosStockBajo.length === 0 && <p className="text-gray-500 text-sm">Stock en orden</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
