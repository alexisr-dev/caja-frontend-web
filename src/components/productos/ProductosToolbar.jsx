import { Search, LayoutGrid, List, Archive } from 'lucide-react'

const selectCls = 'field cursor-pointer font-semibold'

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
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          className="field w-full pl-10 pr-4"
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
        className={`flex items-center gap-2 h-11 rounded-[10px] px-3.5 text-sm font-bold transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] ${
          verEliminados
            ? 'bg-primary text-white'
            : 'bg-white text-gray-900 shadow-[inset_0_0_0_1.5px_#CBC4AE] hover:bg-gray-50'
        }`}
      >
        <Archive size={17} />
        Ver eliminados
      </button>

      <div className="flex items-center h-11 rounded-[10px] bg-sunk p-1 gap-1">
        <button
          onClick={() => onVista('tabla')}
          className={`w-10 h-full inline-flex items-center justify-center rounded-lg transition-colors ${vista === 'tabla' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Vista tabla"
          aria-label="Vista tabla"
          aria-pressed={vista === 'tabla'}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => onVista('tarjetas')}
          className={`w-10 h-full inline-flex items-center justify-center rounded-lg transition-colors ${vista === 'tarjetas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Vista tarjetas"
          aria-label="Vista tarjetas"
          aria-pressed={vista === 'tarjetas'}
        >
          <LayoutGrid size={18} />
        </button>
      </div>
    </div>
  )
}
