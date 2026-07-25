import { useEffect } from 'react'
import { X } from 'lucide-react'

const widths = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export default function SlideOver({ open, onClose, title, subtitle, children, width = 'lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease-out]" onClick={onClose} />
      <div
        className={`absolute right-0 inset-y-0 w-full ${widths[width]} bg-white shadow-2xl flex flex-col animate-[slideIn_200ms_ease-out]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 -mr-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
      </div>
    </div>
  )
}
