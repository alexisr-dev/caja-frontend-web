import { useEffect, useState } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
      destacada: true,
    },
    {
      label: 'Esta semana',
      value: formatSoles(data.ventas_semana.total),
      sub: `${data.ventas_semana.cantidad} boletas`,
    },
    {
      label: 'Este mes',
      value: formatSoles(data.ventas_mes.total),
      sub: `${data.ventas_mes.cantidad} boletas`,
    },
    {
      label: 'Alertas activas',
      value: data.alertas_no_leidas.total,
      sub: `${data.alertas_no_leidas.critico} críticas`,
      tono: data.alertas_no_leidas.critico > 0 ? 'text-err' : 'text-warn',
    },
    {
      label: 'Escaneos 24h',
      value: data.escaneos_24h,
      sub: 'reconocimientos IA',
    },
    {
      label: 'Precisión IA',
      value: data.tasa_reconocimiento_ia_24h != null ? `${data.tasa_reconocimiento_ia_24h}%` : 'N/A',
      sub: 'últimas 24 horas',
    },
  ]

  const [destacada, ...resto] = cards

  return (
    <div className="p-8">
      <h1 className="page-title mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5 mb-5">
        <div className="panel p-5">
          <div className="tag-price py-3.5 pr-5">
            <p className="text-sm font-extrabold">{destacada.label}</p>
            <p className="font-display text-[56px] font-black leading-none mt-1 tabular-nums">{destacada.value}</p>
          </div>
          <p className="text-sm text-gray-500 mt-3 px-1">{destacada.sub}</p>
        </div>

        <div className="panel grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-gray-200 overflow-hidden">
          {resto.map(c => (
            <div key={c.label} className="px-5 py-5 min-w-0">
              <p className="text-[13px] font-bold text-gray-500">{c.label}</p>
              <p className={`font-display text-[40px] font-black leading-[1.05] mt-1 tabular-nums ${c.tono ?? 'text-gray-900'}`}>{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {data.alertas_no_leidas.total > 0 && (
        <div className="panel px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-gray-500 font-bold">Alertas sin leer:</span>
          {data.alertas_no_leidas.critico > 0 && (
            <span className="text-err font-extrabold">{data.alertas_no_leidas.critico} críticas</span>
          )}
          {data.alertas_no_leidas.advertencia > 0 && (
            <span className="text-warn font-extrabold">{data.alertas_no_leidas.advertencia} advertencias</span>
          )}
          {data.alertas_no_leidas.info > 0 && (
            <span className="text-[#075985] font-extrabold">{data.alertas_no_leidas.info} informativas</span>
          )}
        </div>
      )}

      <div className="panel p-6">
        <h2 className="text-lg font-extrabold mb-4">Ventas últimos 7 días</h2>
        {ventas7dias.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">Sin datos de ventas en los últimos 7 días</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ventas7dias} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E2DDCD" />
              <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#4F5D6B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#66727F' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={v => formatSoles(v)}
                cursor={{ fill: 'rgba(14,43,68,0.06)' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2DDCD', fontWeight: 700 }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {ventas7dias.map((_, i) => (
                  <Cell key={i} fill={i === ventas7dias.length - 1 ? '#F5B31B' : '#9DB8CE'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
