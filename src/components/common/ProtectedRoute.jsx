import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader fullscreen />
  if (!user) return <Navigate to="/login" replace />
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/login" replace />
  }
  return children
}
