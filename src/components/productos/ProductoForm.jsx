import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Button from '../common/Button'
import { getCategorias } from '../../api/categorias'
import { getProveedores } from '../../api/proveedores'

export default function ProductoForm({ producto, onSubmit, loading }) {
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: producto || {},
  })

  useEffect(() => {
    getCategorias().then(d => setCategorias(d.results ?? d))
    getProveedores().then(d => setProveedores(d.results ?? d))
  }, [])

  useEffect(() => {
    if (!producto || categorias.length === 0) return
    reset({
      ...producto,
      categoria: producto.categoria?.id ?? producto.categoria ?? '',
      proveedor: producto.proveedor?.id ?? producto.proveedor ?? '',
    })
  }, [producto, categorias, proveedores, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          error={errors.sku?.message}
          {...register('sku', { required: 'Requerido' })}
          disabled={!!producto}
        />
        <Input
          label="Nombre"
          error={errors.nombre?.message}
          {...register('nombre', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Descripción"
        {...register('descripcion')}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Precio (S/)"
          type="number"
          step="0.01"
          error={errors.precio?.message}
          {...register('precio', { required: 'Requerido', min: 0 })}
        />
        <Input
          label="Stock"
          type="number"
          {...register('stock', { min: 0 })}
        />
        <Input
          label="Stock mínimo"
          type="number"
          {...register('stock_minimo', { min: 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Categoría</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            {...register('categoria')}
          >
            <option value="">Sin categoría</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Proveedor</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            {...register('proveedor')}
          >
            <option value="">Sin proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>{p.razon_social}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Fecha de vencimiento"
        type="date"
        {...register('fecha_vencimiento')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Guardando...' : producto ? 'Actualizar' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
