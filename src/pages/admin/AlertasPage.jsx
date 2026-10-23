import { useEffect, useState } from 'react'
import { getAlertas, marcarAlertaLeida, marcarTodasLeidas } from '../../api/alertas'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { formatFechaHora } from '../../utils/formatters'
import { AlertTriangle, Info, Zap } from 'lucide-react'

const NIVEL_ICON = {
  INFO: { Icon: Info, tile: 'bg-sky-100 text-[#075985]' },
  ADVERTENCIA: { Icon: AlertTriangle, tile: 'bg-warn-bg text-warn' },
  CRITICO: { Icon: Zap, tile: 'bg-err-bg text-err' },
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [soloNoLeidas, setSoloNoLeidas] = useState(false)

  const cargar = () => {
    setLoading(true)
    getAlertas({ leida: soloNoLeidas ? false : undefined })
      .then(d => setAlertas(d.results ?? d))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [soloNoLeidas])

  const handleMarcar = async (id) => {
    await marcarAlertaLeida(id)
    cargar()
  }

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas()
    cargar()
  }

  const noLeidas = alertas.filter(a => !a.leida).length

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="page-title">Alertas</h1>
          {noLeidas > 0 && (
            <span className="bg-err text-white text-sm font-extrabold min-w-[28px] h-7 px-2.5 rounded-full inline-flex items-center justify-center">{noLeidas}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2.5 text-sm font-bold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={soloNoLeidas}
              onChange={e => setSoloNoLeidas(e.target.checked)}
              className="w-[18px] h-[18px] rounded accent-[#0A4A78]"
            />
            Solo no leídas
          </label>
          <Button variant="secondary" onClick={handleMarcarTodas} disabled={noLeidas === 0}>
            Marcar todas leídas
          </Button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {alertas.map(a => {
            const nivel = NIVEL_ICON[a.nivel] ?? NIVEL_ICON.INFO
            const Icon = nivel.Icon
            return (
              <div key={a.id} className={`panel px-5 py-4 flex items-center justify-between gap-4 ${a.leida ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center ${nivel.tile}`} title={a.nivel}>
                    <Icon size={24} />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-base ${a.leida ? 'font-medium' : 'font-extrabold'}`}>{a.mensaje}</p>
                    <p className="text-[13px] text-gray-500 mt-0.5 tabular-nums">
                      {a.tipo_display ?? a.tipo} · {formatFechaHora(a.fecha)}
                      {a.producto_nombre && ` · ${a.producto_nombre}`}
                    </p>
                  </div>
                </div>
                {!a.leida && (
                  <Button size="sm" variant="secondary" onClick={() => handleMarcar(a.id)} className="shrink-0">
                    Marcar leída
                  </Button>
                )}
              </div>
            )
          })}
          {alertas.length === 0 && (
            <div className="text-center text-gray-500 py-12">No hay alertas</div>
          )}
        </div>
      )}
    </div>
  )
}
