import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { TIPO_DESCUENTO } from '../../utils/constants'
import { getProductos } from '../../api/productos'

export default function DescuentoForm({ descuento, onSubmit, loading }) {
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: descuento || { tipo: TIPO_DESCUENTO.PORCENTAJE, activo: true },
  })

  const tipo = watch('tipo')
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarLista, setMostrarLista] = useState(false)
  const comboRef = useRef(null)

  useEffect(() => {
    getProductos({ activo: true, page_size: 500 })
      .then((d) => setProductos(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (descuento) {
      reset(descuento)
      const p = productos.find((x) => x.sku === descuento.producto)
      setBusqueda(p ? `${p.nombre} (${p.sku})` : String(descuento.producto ?? ''))
    } else {
      setBusqueda('')
    }
  }, [descuento, productos, reset])

  useEffect(() => {
    const handler = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setMostrarLista(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const productosFiltrados = busqueda.trim()
    ? productos
        .filter((p) => {
          const q = busqueda.toLowerCase()
          return p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        })
        .slice(0, 20)
    : productos.slice(0, 20)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Producto</label>
        <input type="hidden" {...register('producto', { required: 'Selecciona un producto' })} />
        <div className="relative" ref={comboRef}>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setMostrarLista(true) }}
            onFocus={() => setMostrarLista(true)}
            placeholder="Buscar por nombre o SKU..."
            autoComplete="off"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {mostrarLista && productosFiltrados.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {productosFiltrados.map((p) => (
                <li
                  key={p.sku}
                  onMouseDown={() => {
                    setValue('producto', p.sku, { shouldValidate: true })
                    setBusqueda(`${p.nombre} (${p.sku})`)
                    setMostrarLista(false)
                  }}
                  className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <span>{p.nombre}</span>
                  <span className="text-gray-400 text-xs ml-2 shrink-0">{p.sku}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {errors.producto && <p className="text-xs text-red-500">{errors.producto.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Tipo de descuento</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          {...register('tipo', { required: true })}
        >
          <option value={TIPO_DESCUENTO.PORCENTAJE}>Porcentaje (%)</option>
          <option value={TIPO_DESCUENTO.MONTO_FIJO}>Monto fijo (S/)</option>
          <option value={TIPO_DESCUENTO.NXM}>N×M (lleva N paga M)</option>
        </select>
      </div>

      {tipo === TIPO_DESCUENTO.PORCENTAJE && (
        <Input
          label="Porcentaje (%)"
          type="number"
          step="0.01"
          min="0.01"
          max="100"
          error={errors.valor?.message}
          {...register('valor', { required: 'Requerido', valueAsNumber: true })}
        />
      )}

      {tipo === TIPO_DESCUENTO.MONTO_FIJO && (
        <Input
          label="Monto a descontar (S/)"
          type="number"
          step="0.01"
          min="0.01"
          error={errors.valor?.message}
          {...register('valor', { required: 'Requerido', valueAsNumber: true })}
        />
      )}

      {tipo === TIPO_DESCUENTO.NXM && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Lleva (N)"
            type="number"
            min="2"
            error={errors.lleva_n?.message}
            {...register('lleva_n', { required: 'Requerido', valueAsNumber: true })}
          />
          <Input
            label="Paga (M)"
            type="number"
            min="1"
            error={errors.paga_m?.message}
            {...register('paga_m', { required: 'Requerido', valueAsNumber: true })}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha inicio"
          type="date"
          error={errors.fecha_inicio?.message}
          {...register('fecha_inicio', { required: 'Requerido' })}
        />
        <Input
          label="Fecha fin"
          type="date"
          error={errors.fecha_fin?.message}
          {...register('fecha_fin', { required: 'Requerido' })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" {...register('activo')} className="rounded" />
        Descuento activo
      </label>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Guardando...' : descuento ? 'Actualizar' : 'Crear descuento'}
        </Button>
      </div>
    </form>
  )
}
