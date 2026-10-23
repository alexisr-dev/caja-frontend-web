import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTurno } from '../../context/TurnoContext'
import AbrirTurnoModal from '../../components/turnos/AbrirTurnoModal'

export default function AbrirTurnoPage() {
  const { turno, loading } = useTurno()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && turno) navigate('/caja', { replace: true })
  }, [turno, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ground">
      <AbrirTurnoModal open={true} onClose={() => navigate('/login')} />
    </div>
  )
}
