import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Truck, Percent, Users,
  Receipt, Clock, BarChart2, Bell, Eye, ScanLine, LogOut,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAlertas } from '../../hooks/useAlertas'
import { useFCMToken } from '../../hooks/useFCMToken'
import { useNotificaciones } from '../../hooks/useNotificaciones'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Tag },
  { to: '/admin/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/admin/descuentos', label: 'Descuentos', icon: Percent },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/boletas', label: 'Boletas', icon: Receipt },
  { to: '/admin/turnos', label: 'Turnos', icon: Clock },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart2 },
  { to: '/admin/alertas', label: 'Alertas', icon: Bell },
  { to: '/admin/registro-ia', label: 'Registro IA', icon: Eye },
  { to: '/admin/logs-ia', label: 'Logs IA', icon: ScanLine },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { alertasNoLeidas } = useAlertas()
  const navigate = useNavigate()
  useFCMToken(user)
  useNotificaciones()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Caja Smart</h1>
            {user?.es_demo && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                DEMO
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/admin/alertas' && alertasNoLeidas > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {alertasNoLeidas}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
