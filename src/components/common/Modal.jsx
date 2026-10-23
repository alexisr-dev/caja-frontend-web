import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/55 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white rounded-[20px] border border-gray-200 shadow-float w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-pop-in`}
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-[10px] bg-sunk text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
