export default function Select({ label, options, className = '', children, ...props }) {
  const select = (
    <select
      className={`field cursor-pointer font-semibold ${className}`}
      {...props}
    >
      {options
        ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
        : children}
    </select>
  )

  if (!label) return select

  return (
    <div className="flex flex-col gap-1.5">
      <label className="field-label">{label}</label>
      {select}
    </div>
  )
}
