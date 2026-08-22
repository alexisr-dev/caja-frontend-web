import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, History, LogOut, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTurno } from '../../context/TurnoContext'
import { useCart } from '../../context/CartContext'
import { formatSoles } from '../../utils/formatters'
import CerrarTurnoModal from '../turnos/CerrarTurnoModal'
import { useState } from 'react'
import { useFCMToken } from '../../hooks/useFCMToken'
import { useNotificaciones } from '../../hooks/useNotificaciones'
import NotificacionBell from '../common/NotificacionBell'

export default function CajaLayout() {
  const { user, logout } = useAuth()
  useFCMToken(user)
  useNotificaciones()
  const { turno } = useTurno()
  const { items, total } = useCart()
  const navigate = useNavigate()
  const [showCerrar, setShowCerrar] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">Caja Registradora</h1>
          {user?.es_demo && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              DEMO
            </span>
          )}
          {turno && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Turno abierto
            </span>
          )}
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/caja" end
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Package size={16} /> Caja
          </NavLink>
          <NavLink to="/caja/historial"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <History size={16} /> Historial
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <ShoppingCart size={16} />
            <span>{items.length} items</span>
            <span className="font-bold text-primary">{formatSoles(total)}</span>
          </div>
          {turno && (
            <button
              onClick={() => setShowCerrar(true)}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Cerrar turno
            </button>
          )}
          <NotificacionBell />
          <span className="text-sm text-gray-500">{user?.first_name || user?.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <CerrarTurnoModal open={showCerrar} onClose={() => setShowCerrar(false)} />
    </div>
  )
}
