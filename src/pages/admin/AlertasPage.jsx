import { useEffect, useState } from 'react'
import { getAlertas, marcarAlertaLeida, marcarTodasLeidas } from '../../api/alertas'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { formatFechaHora } from '../../utils/formatters'
import { AlertTriangle, Info, Zap } from 'lucide-react'

const NIVEL_ICON = {
  INFO: <Info size={16} className="text-blue-500" />,
  ADVERTENCIA: <AlertTriangle size={16} className="text-yellow-500" />,
  CRITICO: <Zap size={16} className="text-red-500" />,
}

const NIVEL_COLOR = {
  INFO: 'border-l-blue-400',
  ADVERTENCIA: 'border-l-yellow-400',
  CRITICO: 'border-l-red-500',
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Alertas</h1>
          {noLeidas > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{noLeidas}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={soloNoLeidas} onChange={e => setSoloNoLeidas(e.target.checked)} />
            Solo no leídas
          </label>
          <Button variant="secondary" size="sm" onClick={handleMarcarTodas} disabled={noLeidas === 0}>
            Marcar todas leídas
          </Button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-2">
          {alertas.map(a => (
            <div key={a.id} className={`bg-white rounded-xl shadow-sm border-l-4 px-5 py-4 flex items-start justify-between ${NIVEL_COLOR[a.nivel]} ${a.leida ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{NIVEL_ICON[a.nivel]}</div>
                <div>
                  <p className="text-sm font-medium">{a.mensaje}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.tipo_display ?? a.tipo} · {formatFechaHora(a.fecha)}
                    {a.producto_nombre && ` · ${a.producto_nombre}`}
                  </p>
                </div>
              </div>
              {!a.leida && (
                <Button size="sm" variant="ghost" onClick={() => handleMarcar(a.id)} className="shrink-0 ml-4">
                  Marcar leída
                </Button>
              )}
            </div>
          ))}
          {alertas.length === 0 && (
            <div className="text-center text-gray-400 py-12">No hay alertas</div>
          )}
        </div>
      )}
    </div>
  )
}
