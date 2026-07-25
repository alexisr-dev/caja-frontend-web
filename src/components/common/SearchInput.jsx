import { Search } from 'lucide-react'

/** Campo de busqueda con icono, usado en las pantallas de listado. */
export default function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  )
}
