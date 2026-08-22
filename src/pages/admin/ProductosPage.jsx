import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Camera, GitBranch, TrendingUp, Trash2, RotateCcw, ImageOff, PackageSearch, Package, AlertTriangle, XCircle, Wallet } from 'lucide-react'
import { getProductos, getProducto, crearProducto, actualizarProducto, eliminarProducto } from '../../api/productos'
import { getCategorias } from '../../api/categorias'
import { mensajeError } from '../../api/errores'
import Modal from '../../components/common/Modal'
import SlideOver from '../../components/common/SlideOver'
import StatCard from '../../components/common/StatCard'
import ProductoForm from '../../components/productos/ProductoForm'
import VarianteForm from '../../components/productos/VarianteForm'
import FotoUploader from '../../components/productos/FotoUploader'
import HistorialPreciosChart from '../../components/productos/HistorialPreciosChart'
import ProductosToolbar from '../../components/productos/ProductosToolbar'
import ProductoAdminCard from '../../components/productos/ProductoAdminCard'
import StockBadge, { stockStatus } from '../../components/productos/StockBadge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import SkeletonRows, { SkeletonCards } from '../../components/common/SkeletonRows'
import IconButton from '../../components/common/IconButton'
import { formatSoles } from '../../utils/formatters'
import { toast } from 'react-toastify'

const EtiquetaEliminado = () => (
  <span className="ml-2 align-middle px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold uppercase tracking-wide">
    Eliminado
  </span>
)

const ORDENADORES = {
  precio_asc: (a, b) => (a.precio ?? 0) - (b.precio ?? 0),
  precio_desc: (a, b) => (b.precio ?? 0) - (a.precio ?? 0),
  stock_asc: (a, b) => (a.stock ?? 0) - (b.stock ?? 0),
  stock_desc: (a, b) => (b.stock ?? 0) - (a.stock ?? 0),
  nombre: (a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''),
}

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)

  const [vista, setVista] = useState('tabla')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos')
  const [orden, setOrden] = useState('nombre')
  const [verEliminados, setVerEliminados] = useState(false)

  const cargar = () => {
    setLoading(true)
    getProductos({
      search: busqueda || undefined,
      activo: verEliminados ? undefined : true,
    })
      .then(d => setProductos(d.results ?? d))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [busqueda, verEliminados])
  useEffect(() => { getCategorias().then(d => setCategorias(d.results ?? d)).catch(() => {}) }, [])

  const normalizar = (data) => ({
    ...data,
    fecha_vencimiento: data.fecha_vencimiento || null,
  })

  const handleCrear = async (data) => {
    setSaving(true)
    try {
      await crearProducto(normalizar(data))
      toast.success('Producto creado')
      setModal(null)
      cargar()
    } catch (err) {
      toast.error(mensajeError(err, 'Error al crear producto'))
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async (data) => {
    setSaving(true)
    try {
      await actualizarProducto(seleccionado.sku, normalizar(data))
      toast.success('Producto actualizado')
      setModal(null)
      cargar()
    } catch (err) {
      toast.error(mensajeError(err, 'Error al actualizar'))
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (sku) => {
    if (!confirm(`¿Eliminar producto ${sku}?\n\nSe desactiva y deja de venderse, pero se conserva en las boletas ya emitidas. Puedes restaurarlo desde "Ver eliminados".`)) return
    try {
      await eliminarProducto(sku)
      toast.success('Producto eliminado')
      cargar()
    } catch (err) {
      toast.error(mensajeError(err, 'Error al eliminar'))
    }
  }

  const handleRestaurar = async (sku) => {
    try {
      await actualizarProducto(sku, { activo: true })
      toast.success('Producto restaurado')
      cargar()
    } catch (err) {
      toast.error(mensajeError(err, 'Error al restaurar'))
    }
  }

  const abrir = async (tipo, producto = null) => {
    if ((tipo === 'editar' || tipo === 'fotos') && producto) {
      const detail = await getProducto(producto.sku)
      setSeleccionado(detail)
    } else {
      setSeleccionado(producto)
    }
    setModal(tipo)
  }

  const kpis = useMemo(() => {
    const total = productos.length
    const agotados = productos.filter(p => (p.stock ?? 0) <= 0).length
    const bajos = productos.filter(p => p.stock > 0 && p.stock <= (p.stock_minimo ?? 0)).length
    const valor = productos.reduce((s, p) => s + (parseFloat(p.precio) || 0) * (p.stock || 0), 0)
    return { total, agotados, bajos, valor }
  }, [productos])

  const productosVisibles = useMemo(() => {
    let lista = productos
    if (filtroCategoria) lista = lista.filter(p => p.categoria_nombre === filtroCategoria)
    if (filtroStock !== 'todos') lista = lista.filter(p => stockStatus(p) === filtroStock)

    return [...lista].sort(ORDENADORES[orden] ?? ORDENADORES.nombre)
  }, [productos, filtroCategoria, filtroStock, orden])

  const editando = modal === 'editar'

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tu catálogo e inventario</p>
        </div>
        <Button variant="primary" onClick={() => abrir('crear')}>
          <Plus size={16} className="mr-1.5" /> Nuevo producto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total productos" value={kpis.total} icon={Package} tone="default" />
        <StatCard label="Stock bajo" value={kpis.bajos} icon={AlertTriangle} tone="warning" hint="Igual o bajo el mínimo" />
        <StatCard label="Agotados" value={kpis.agotados} icon={XCircle} tone="danger" />
        <StatCard label="Valor inventario" value={formatSoles(kpis.valor)} icon={Wallet} tone="success" />
      </div>

      <div className="mb-4">
        <ProductosToolbar
          busqueda={busqueda}
          onBusqueda={setBusqueda}
          categorias={categorias}
          filtroCategoria={filtroCategoria}
          onFiltroCategoria={setFiltroCategoria}
          filtroStock={filtroStock}
          onFiltroStock={setFiltroStock}
          orden={orden}
          onOrden={setOrden}
          vista={vista}
          onVista={setVista}
          verEliminados={verEliminados}
          onVerEliminados={setVerEliminados}
        />
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {loading ? 'Cargando…' : `${productosVisibles.length} ${productosVisibles.length === 1 ? 'producto' : 'productos'}`}
      </p>

      {loading ? (
        vista === 'tarjetas' ? <SkeletonCards /> : <SkeletonRows />
      ) : productosVisibles.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          titulo="No se encontraron productos"
          descripcion="Ajusta los filtros o crea tu primer producto."
          accion={(
            <Button variant="primary" onClick={() => abrir('crear')}>
              <Plus size={16} className="mr-1.5" /> Nuevo producto
            </Button>
          )}
        />
      ) : vista === 'tabla' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Producto</th>
                <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                <th className="px-4 py-3 text-right font-semibold">Precio</th>
                <th className="px-4 py-3 text-center font-semibold">Stock</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productosVisibles.map(p => (
                <tr key={p.sku} className={`hover:bg-gray-50/70 transition-colors ${p.activo === false ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagen_principal || p.primera_foto ? (
                        <img
                          src={p.imagen_principal ?? p.primera_foto}
                          alt={p.nombre}
                          className="w-11 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <ImageOff size={16} className="text-gray-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {p.nombre}
                          {p.activo === false && <EtiquetaEliminado />}
                        </p>
                        <p className="font-mono text-xs text-gray-400">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.categoria_nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatSoles(p.precio)}</td>
                  <td className="px-4 py-3 text-center"><StockBadge producto={p} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <IconButton icon={Pencil} title="Editar" onClick={() => abrir('editar', p)} />
                      <IconButton icon={Camera} title="Fotos" onClick={() => abrir('fotos', p)} />
                      <IconButton icon={GitBranch} title="Nueva variante" onClick={() => abrir('variante', p)} />
                      <IconButton icon={TrendingUp} title="Historial de precios" onClick={() => abrir('historial', p)} />
                      {p.activo === false
                        ? <IconButton icon={RotateCcw} title="Restaurar" onClick={() => handleRestaurar(p.sku)} />
                        : <IconButton icon={Trash2} title="Eliminar" danger onClick={() => handleEliminar(p.sku)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosVisibles.map(p => (
            <ProductoAdminCard
              key={p.sku}
              producto={p}
              onEditar={(prod) => abrir('editar', prod)}
              onFotos={(prod) => abrir('fotos', prod)}
              onVariante={(prod) => abrir('variante', prod)}
              onHistorial={(prod) => abrir('historial', prod)}
              onEliminar={handleEliminar}
              onRestaurar={handleRestaurar}
            />
          ))}
        </div>
      )}

      <SlideOver
        open={modal === 'crear' || editando}
        onClose={() => setModal(null)}
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        subtitle={editando ? seleccionado?.sku : 'Completa los datos del producto'}
      >
        {editando
          ? <ProductoForm producto={seleccionado} onSubmit={handleEditar} loading={saving} />
          : <ProductoForm onSubmit={handleCrear} loading={saving} />}
      </SlideOver>

      <Modal open={modal === 'fotos'} onClose={() => setModal(null)} title="Fotos del producto">
        {seleccionado && (
          <FotoUploader
            sku={seleccionado.sku}
            fotos={seleccionado.fotos ?? []}
            onActualizar={async () => {
              const fresh = await getProducto(seleccionado.sku)
              setSeleccionado(fresh)
              cargar()
            }}
          />
        )}
      </Modal>

      <Modal open={modal === 'variante'} onClose={() => setModal(null)} title="Crear variante">
        {seleccionado && (
          <VarianteForm skuPadre={seleccionado.sku} nombrePadre={seleccionado.nombre} onSubmit={handleCrear} loading={saving} />
        )}
      </Modal>

      <Modal open={modal === 'historial'} onClose={() => setModal(null)} title="Historial de precios">
        {seleccionado && <HistorialPreciosChart sku={seleccionado.sku} />}
      </Modal>
    </div>
  )
}
