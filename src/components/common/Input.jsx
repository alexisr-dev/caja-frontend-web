import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  className = '',
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        ref={ref}
        className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Input
