import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, ShoppingCart, AlertTriangle, Eye, Calendar, TrendingUp } from 'lucide-react'
import { getDashboard, getReporteVentas } from '../../api/reportes'
import Loader from '../../components/common/Loader'
import { formatSoles } from '../../utils/formatters'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [ventas7dias, setVentas7dias] = useState([])

  useEffect(() => {
    getDashboard().then(setData).catch(() => {})

    const hoy = new Date()
    const hace7 = new Date()
    hace7.setDate(hoy.getDate() - 6)
    getReporteVentas({
      fecha_desde: hace7.toISOString().split('T')[0],
      fecha_hasta: hoy.toISOString().split('T')[0],
    }).then(r => setVentas7dias(r.por_dia ?? [])).catch(() => {})
  }, [])

  if (!data) return <Loader />

  const cards = [
    {
      label: 'Vendido hoy',
      value: formatSoles(data.ventas_hoy.total),
      sub: `${data.ventas_hoy.cantidad} boletas`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Esta semana',
      value: formatSoles(data.ventas_semana.total),
      sub: `${data.ventas_semana.cantidad} boletas`,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Este mes',
      value: formatSoles(data.ventas_mes.total),
      sub: `${data.ventas_mes.cantidad} boletas`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
    {
      label: 'Alertas activas',
      value: data.alertas_no_leidas.total,
      sub: `${data.alertas_no_leidas.critico} críticas`,
      icon: AlertTriangle,
      color: data.alertas_no_leidas.critico > 0 ? 'bg-red-500' : 'bg-yellow-500',
    },
    {
      label: 'Escaneos 24h',
      value: data.escaneos_24h,
      sub: 'reconocimientos IA',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      label: 'Precisión IA',
      value: data.tasa_reconocimiento_ia_24h != null ? `${data.tasa_reconocimiento_ia_24h}%` : 'N/A',
      sub: 'últimas 24 horas',
      icon: Eye,
      color: 'bg-pink-500',
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`${c.color} text-white w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <p className="text-gray-500 text-xs mb-0.5">{c.label}</p>
            <p className="text-xl font-bold leading-tight">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {data.alertas_no_leidas.total > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-6 text-sm">
          <span className="text-gray-500 font-medium">Alertas sin leer:</span>
          {data.alertas_no_leidas.critico > 0 && (
            <span className="text-red-600 font-semibold">{data.alertas_no_leidas.critico} críticas</span>
          )}
          {data.alertas_no_leidas.advertencia > 0 && (
            <span className="text-yellow-600 font-semibold">{data.alertas_no_leidas.advertencia} advertencias</span>
          )}
          {data.alertas_no_leidas.info > 0 && (
            <span className="text-blue-600 font-semibold">{data.alertas_no_leidas.info} informativas</span>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Ventas últimos 7 días</h2>
        {ventas7dias.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Sin datos de ventas en los últimos 7 días</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ventas7dias}>
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => formatSoles(v)} />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
