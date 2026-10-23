import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../../api/notificaciones'

export default function NotificacionBell() {
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const noLeidas = notifs.filter((n) => !n.leida).length

  const cargar = async () => {
    try {
      const data = await getNotificaciones({ leida: 'false' })
      setNotifs(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
    }
  }

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarcarLeida = async (n) => {
    if (n.leida) return
    await marcarLeida(n.id)
    setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, leida: true } : x))
  }

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas()
    setNotifs((prev) => prev.map((x) => ({ ...x, leida: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) cargar() }}
        aria-label="Notificaciones"
        className="relative w-10 h-10 inline-flex items-center justify-center rounded-[10px] bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-err text-white text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none ring-2 ring-navy">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-pop border border-gray-200 z-50 overflow-hidden animate-pop-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-[15px] font-extrabold text-gray-900">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-primary hover:underline font-bold"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200">
            {notifs.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">Sin notificaciones</li>
            ) : (
              notifs.slice(0, 15).map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleMarcarLeida(n)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.leida ? 'bg-sky-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <div className={!n.leida ? '' : 'pl-4'}>
                      <p className={`text-sm ${!n.leida ? 'font-extrabold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.cuerpo}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
