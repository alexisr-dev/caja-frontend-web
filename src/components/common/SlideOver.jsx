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
      <div className="absolute inset-0 bg-navy/55 animate-[fadeIn_150ms_ease-out]" onClick={onClose} />
      <div
        className={`absolute right-0 inset-y-0 w-full ${widths[width]} bg-white shadow-float flex flex-col animate-[slideIn_220ms_cubic-bezier(0.32,0.72,0,1)]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-4 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="font-display text-[38px] font-black uppercase leading-none tracking-wide text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-[10px] bg-sunk text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-7 py-6 flex-1">{children}</div>
      </div>
    </div>
  )
}
