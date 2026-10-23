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
    <div className="flex h-screen bg-ground">
      <aside className="w-[248px] shrink-0 bg-navy text-white flex flex-col">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-9 h-9 shrink-0" />
            <h1 className="font-display text-[30px] font-black uppercase leading-none tracking-wide">Caja Smart</h1>
            {user?.es_demo && (
              <span className="text-[11px] bg-gold text-gray-900 px-2 py-0.5 rounded-full font-extrabold">
                DEMO
              </span>
            )}
          </div>
          <p className="text-[13px] text-white/65 mt-3 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 h-10 px-3 rounded-[10px] text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-gold text-gray-900 tag-nav pl-[22px]'
                    : 'text-white/85 hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === '/admin/alertas' && alertasNoLeidas > 0 && (
                <span className="bg-err text-white text-xs font-extrabold min-w-[22px] h-[22px] px-1.5 rounded-full inline-flex items-center justify-center leading-none">
                  {alertasNoLeidas}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 h-10 text-sm font-bold text-white/75 hover:text-white transition-colors w-full px-3 rounded-[10px] hover:bg-white/10"
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
