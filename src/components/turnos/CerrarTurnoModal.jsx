import { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { useTurno } from '../../context/TurnoContext'
import { formatSoles } from '../../utils/formatters'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function CerrarTurnoModal({ open, onClose }) {
  const [montoContado, setMontoContado] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)
  const { cerrarTurno } = useTurno()
  const navigate = useNavigate()

  const handleCerrar = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await cerrarTurno(parseFloat(montoContado), observaciones)
      setResultado(data)
    } catch {
      toast.error('Error al cerrar turno')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizar = () => {
    toast.success('Turno cerrado')
    onClose()
    navigate('/login')
  }

  return (
    <Modal open={open} onClose={onClose} title="Cerrar turno de caja" size="sm">
      {!resultado ? (
        <form onSubmit={handleCerrar} className="space-y-4">
          <p className="text-sm text-gray-600">
            Cuenta el efectivo en caja e ingresa el monto total contado.
          </p>
          <Input
            label="Efectivo contado (S/)"
            type="number"
            step="0.10"
            min="0"
            placeholder="0.00"
            value={montoContado}
            onChange={e => setMontoContado(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows={3}
              placeholder="Opcional..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit" variant="danger" disabled={loading || !montoContado}>
              {loading ? 'Cerrando...' : 'Cerrar turno'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold text-center">Cuadre de caja</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Efectivo esperado</span>
              <span>{formatSoles(resultado.esperado_en_caja)}</span>
            </div>
            <div className="flex justify-between">
              <span>Efectivo contado</span>
              <span>{formatSoles(resultado.monto_contado_cierre)}</span>
            </div>
            <div className={`flex justify-between font-bold pt-2 border-t ${
              resultado.diferencia >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Diferencia</span>
              <span>{formatSoles(resultado.diferencia)}</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">{resultado.diagnostico}</p>
          <Button variant="primary" className="w-full" onClick={handleFinalizar}>
            Finalizar
          </Button>
        </div>
      )}
    </Modal>
  )
}
