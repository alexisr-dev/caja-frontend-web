export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) {
  const base = 'inline-flex items-center justify-center font-bold rounded-[10px] whitespace-nowrap transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-sunk text-gray-900 hover:bg-gray-200',
    danger: 'bg-err text-white hover:bg-[#A53019]',
    success: 'bg-ok text-white hover:bg-[#106532]',
    outline: 'bg-white text-gray-900 shadow-[inset_0_0_0_1.5px_#CBC4AE] hover:bg-gray-50',
    ghost: 'text-gray-500 hover:bg-sunk',
  }

  const sizes = {
    sm: 'h-9 px-3 text-[13px] rounded-lg',
    md: 'h-11 px-[18px] text-[15px]',
    lg: 'h-14 px-6 text-[17px] rounded-xl',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
