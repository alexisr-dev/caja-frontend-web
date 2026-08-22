import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export const stockStatus = (producto) => {
  const stock = producto.stock ?? 0
  const minimo = producto.stock_minimo ?? 0
  if (stock <= 0) return 'agotado'
  if (stock <= minimo) return 'bajo'
  return 'ok'
}

const config = {
  ok: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  bajo: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-700' },
  agotado: { icon: XCircle, cls: 'bg-rose-50 text-rose-700' },
}

export default function StockBadge({ producto }) {
  const status = stockStatus(producto)
  const { icon: Icon, cls } = config[status]
  const minimo = producto.stock_minimo ?? 0

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}
      title={minimo > 0 ? `Mínimo: ${minimo}` : undefined}
    >
      <Icon size={13} />
      {producto.stock ?? 0}
    </span>
  )
}
