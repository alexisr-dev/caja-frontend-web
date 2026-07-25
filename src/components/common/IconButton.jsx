/** Boton de accion compacto para las filas y tarjetas de los listados. */
export default function IconButton({ icon: Icon, title, onClick, danger = false, size = 16 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-lg transition-colors ${
        danger
          ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
          : 'text-gray-400 hover:text-primary hover:bg-gray-100'
      }`}
    >
      <Icon size={size} />
    </button>
  )
}
