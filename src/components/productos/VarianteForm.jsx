import { useForm } from 'react-hook-form'
import { GitBranch } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'

export default function VarianteForm({ skuPadre, nombrePadre, onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const submit = (data) => onSubmit({ ...data, padre: skuPadre })

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-3">
        <GitBranch size={15} className="text-gray-400 shrink-0" />
        <div className="text-sm">
          <span className="text-gray-500">Variante de </span>
          <span className="font-medium text-gray-800">{nombrePadre ?? skuPadre}</span>
          <span className="font-mono text-xs text-gray-400 ml-2">{skuPadre}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU variante"
          error={errors.sku?.message}
          placeholder={`${skuPadre}-V1`}
          {...register('sku', { required: 'Requerido' })}
        />
        <Input
          label="Nombre variante"
          error={errors.nombre?.message}
          placeholder="ej: sabor fresa, talla M…"
          {...register('nombre', { required: 'Requerido' })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio (S/)"
          type="number"
          step="0.01"
          error={errors.precio?.message}
          {...register('precio', { required: 'Requerido', min: 0 })}
        />
        <Input
          label="Stock inicial"
          type="number"
          {...register('stock', { min: 0 })}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creando...' : 'Crear variante'}
        </Button>
      </div>
    </form>
  )
}
