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
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-400">Sin notificaciones</li>
            ) : (
              notifs.slice(0, 15).map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleMarcarLeida(n)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.leida ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <div className={!n.leida ? '' : 'pl-4'}>
                      <p className={`text-sm ${!n.leida ? 'font-semibold text-gray-800' : 'font-normal text-gray-600'}`}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.cuerpo}</p>
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
