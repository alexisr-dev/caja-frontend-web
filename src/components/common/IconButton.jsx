export default function IconButton({ icon: Icon, title, onClick, danger = false, size = 16 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-150 active:scale-95 ${
        danger
          ? 'text-gray-500 hover:text-err hover:bg-err-bg'
          : 'text-gray-500 hover:text-primary hover:bg-sunk'
      }`}
    >
      <Icon size={size} />
    </button>
  )
}
