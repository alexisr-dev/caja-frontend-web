const tones = {
  default: { chip: 'bg-sky-50 text-primary', value: 'text-gray-900' },
  success: { chip: 'bg-emerald-50 text-emerald-600', value: 'text-gray-900' },
  warning: { chip: 'bg-amber-50 text-amber-600', value: 'text-amber-700' },
  danger: { chip: 'bg-rose-50 text-rose-600', value: 'text-rose-700' },
}

export default function StatCard({ label, value, icon: Icon, tone = 'default', hint }) {
  const t = tones[tone] ?? tones.default

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
      {Icon && (
        <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${t.chip}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${t.value}`}>{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  )
}
