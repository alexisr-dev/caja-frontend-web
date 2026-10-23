import { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { useTurno } from '../../context/TurnoContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function AbrirTurnoModal({ open, onClose }) {
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(false)
  const { abrirTurno } = useTurno()
  const navigate = useNavigate()

  const handleAbrir = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await abrirTurno(parseFloat(monto))
      toast.success('Turno abierto correctamente')
      onClose()
      navigate('/caja')
    } catch {
      toast.error('Error al abrir turno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Abrir turno de caja" size="sm">
      <form onSubmit={handleAbrir} className="space-y-4">
        <p className="text-[15px] text-gray-600 leading-relaxed">
          Ingresa el monto inicial de efectivo en caja para comenzar el turno.
        </p>
        <Input
          label="Monto inicial (S/)"
          type="number"
          step="0.10"
          min="0"
          placeholder="0.00"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" variant="success" disabled={loading || !monto}>
            {loading ? 'Abriendo...' : 'Abrir turno'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
