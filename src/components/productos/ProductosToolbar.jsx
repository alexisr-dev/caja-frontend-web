import { Search, LayoutGrid, List, Archive } from 'lucide-react'

const selectCls =
  'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'

export default function ProductosToolbar({
  busqueda,
  onBusqueda,
  categorias = [],
  filtroCategoria,
  onFiltroCategoria,
  filtroStock,
  onFiltroStock,
  orden,
  onOrden,
  vista,
  onVista,
  verEliminados,
  onVerEliminados,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <select value={filtroCategoria} onChange={(e) => onFiltroCategoria(e.target.value)} className={selectCls}>
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.nombre}>{c.nombre}</option>
        ))}
      </select>

      <select value={filtroStock} onChange={(e) => onFiltroStock(e.target.value)} className={selectCls}>
        <option value="todos">Todo el stock</option>
        <option value="ok">En stock</option>
        <option value="bajo">Stock bajo</option>
        <option value="agotado">Agotado</option>
      </select>

      <select value={orden} onChange={(e) => onOrden(e.target.value)} className={selectCls}>
        <option value="nombre">Nombre (A-Z)</option>
        <option value="precio_asc">Precio ↑</option>
        <option value="precio_desc">Precio ↓</option>
        <option value="stock_asc">Stock ↑</option>
        <option value="stock_desc">Stock ↓</option>
      </select>

      <button
        onClick={() => onVerEliminados(!verEliminados)}
        title="Los productos eliminados se desactivan, no se borran"
        aria-pressed={verEliminados}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm transition-colors ${
          verEliminados
            ? 'border-primary bg-primary text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Archive size={16} />
        Ver eliminados
      </button>

      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => onVista('tabla')}
          className={`p-2 transition-colors ${vista === 'tabla' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Vista tabla"
          aria-pressed={vista === 'tabla'}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => onVista('tarjetas')}
          className={`p-2 transition-colors ${vista === 'tarjetas' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          title="Vista tarjetas"
          aria-pressed={vista === 'tarjetas'}
        >
          <LayoutGrid size={18} />
        </button>
      </div>
    </div>
  )
}
