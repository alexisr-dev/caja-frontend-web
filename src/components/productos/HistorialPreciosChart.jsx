import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
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
    return <p className="text-sm text-gray-400">Sin historial de precios</p>
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `S/ ${v.toFixed(2)}`} />
        <Line type="monotone" dataKey="precio" stroke="#0ea5e9" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
