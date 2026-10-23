import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getHistorialPrecios } from '../../api/productos'
import { formatFecha } from '../../utils/formatters'

export default function HistorialPreciosChart({ sku }) {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!sku) return
    getHistorialPrecios(sku)
      .then(d => setData((d.results ?? d).map(h => ({
        fecha: formatFecha(h.fecha),
        precio: parseFloat(h.precio_nuevo),
      }))))
      .catch(() => {})
  }, [sku])

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">Sin historial de precios</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E2DDCD" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#4F5D6B' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#66727F' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => `S/ ${v.toFixed(2)}`}
          contentStyle={{ borderRadius: 12, border: '1px solid #E2DDCD', fontWeight: 700 }}
        />
        <Line
          type="monotone"
          dataKey="precio"
          stroke="#0A4A78"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#ffffff', stroke: '#0A4A78', strokeWidth: 2.5 }}
          activeDot={{ r: 6, fill: '#F5B31B', stroke: '#16202B', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
