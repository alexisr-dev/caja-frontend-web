import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  className = '',
  ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="field-label">{label}</label>
      )}
      <input
        ref={ref}
        className={`field w-full ${error ? 'field-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[13px] font-bold text-err">{error}</p>}
    </div>
  )
})

export default Input
