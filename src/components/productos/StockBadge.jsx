import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export const stockStatus = (producto) => {
  const stock = producto.stock ?? 0
  const minimo = producto.stock_minimo ?? 0
  if (stock <= 0) return 'agotado'
  if (stock <= minimo) return 'bajo'
  return 'ok'
}

const config = {
  ok: { icon: CheckCircle2, cls: 'bg-ok-bg text-ok' },
  bajo: { icon: AlertTriangle, cls: 'bg-warn-bg text-warn' },
  agotado: { icon: XCircle, cls: 'bg-err-bg text-err' },
}

export default function StockBadge({ producto }) {
  const status = stockStatus(producto)
  const { icon: Icon, cls } = config[status]
  const minimo = producto.stock_minimo ?? 0

  return (
    <span
      className={`tag-chip inline-flex items-center gap-1.5 h-7 pr-3 text-[13px] font-extrabold tabular-nums ${cls}`}
      title={minimo > 0 ? `Mínimo: ${minimo}` : undefined}
    >
      <Icon size={14} />
      {producto.stock ?? 0}
    </span>
  )
}
