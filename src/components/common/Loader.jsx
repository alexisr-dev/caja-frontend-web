export default function Loader({ text = 'Cargando...', fullscreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>
}
