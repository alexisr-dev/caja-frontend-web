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

const navCls = ({ isActive }) =>
  `flex items-center gap-2 h-10 px-4 rounded-[10px] text-[15px] font-bold transition-colors ${
    isActive ? 'bg-gold text-gray-900 tag-tab pl-[26px]' : 'text-white/85 hover:bg-white/10'
  }`

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
    <div className="flex flex-col h-screen bg-ground">
      <header className="bg-navy text-white h-16 shrink-0 px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="w-9 h-9 shrink-0" />
            <h1 className="font-display text-[28px] font-black uppercase leading-none tracking-wide whitespace-nowrap">Caja Registradora</h1>
          </div>
          {user?.es_demo && (
            <span className="text-[11px] bg-gold text-gray-900 px-2 py-0.5 rounded-full font-extrabold">
              DEMO
            </span>
          )}
          {turno && (
            <span className="inline-flex items-center gap-2 text-xs bg-white/10 text-white px-3 py-1.5 rounded-full font-bold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#46D27B]" />
              Turno abierto
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1.5">
          <NavLink to="/caja" end className={navCls}>
            <Package size={17} /> Caja
          </NavLink>
          <NavLink to="/caja/historial" className={navCls}>
            <History size={17} /> Historial
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/85">
            <ShoppingCart size={17} />
            <span>{items.length} items</span>
            <span className="font-extrabold text-gold tabular-nums">{formatSoles(total)}</span>
          </div>
          {turno && (
            <button
              onClick={() => setShowCerrar(true)}
              className="text-sm font-bold h-10 px-4 rounded-[10px] text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.45)] hover:bg-white/10 transition-colors active:scale-[0.97]"
            >
              Cerrar turno
            </button>
          )}
          <NotificacionBell />
          <span className="text-sm font-bold text-white/90 max-w-[160px] truncate">{user?.first_name || user?.email}</span>
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="w-10 h-10 inline-flex items-center justify-center rounded-[10px] bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
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
