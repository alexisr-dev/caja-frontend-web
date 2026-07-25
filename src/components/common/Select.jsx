/**
 * Select con el estilo estandar de la app.
 *
 * Reemplaza la constante `selectCls` que estaba copiada en varias pantallas.
 * Acepta `options` como `[{ value, label }]` o `children` para casos sueltos.
 */
export default function Select({ label, options, className = '', children, ...props }) {
  const select = (
    <select
      className={`border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${className}`}
      {...props}
    >
      {options
        ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
        : children}
    </select>
  )

  if (!label) return select

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {select}
    </div>
  )
}
