export default function Loader({ text = 'Cargando...', fullscreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin" />
      <p className="text-sm font-semibold text-gray-500">{text}</p>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ground/80 z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>
}
