const tones = {
  default: { label: 'text-gray-500', value: 'text-gray-900' },
  success: { label: 'text-ok', value: 'text-gray-900' },
  warning: { label: 'text-warn', value: 'text-warn' },
  danger: { label: 'text-err', value: 'text-err' },
}

export default function StatCard({ label, value, tone = 'default', hint }) {
  const t = tones[tone] ?? tones.default

  return (
    <div className="px-5 py-4 min-w-0">
      <p className={`text-[13px] font-bold truncate ${t.label}`}>{label}</p>
      <p className={`font-display text-[40px] font-black leading-[1.05] mt-0.5 tabular-nums ${t.value}`}>{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-0.5 truncate">{hint}</p>}
    </div>
  )
}
