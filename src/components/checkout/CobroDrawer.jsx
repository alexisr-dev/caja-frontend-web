import { useEffect, useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { useCart } from '../../context/CartContext'
import * as boletaPendiente from '../../services/boletaPendiente'
import { formatSoles } from '../../utils/formatters'
import { ESTADO_PAGO } from '../../utils/constants'
import Loader from '../common/Loader'
import BoletaFinal from './BoletaFinal'
import MetodoGrid from './MetodoGrid'
import { getMetodoPago } from './metodosPago'
import { useBoletaPendiente } from './useBoletaPendiente'

const PASO = {
  SELECCION: 'metodo',
  EXITO: 'exito',
}

const TITULO_BASE = 'Cobrar venta'

const SNAPSHOT_VACIO = { items: [], subtotalSinIgv: 0, igvMonto: 0 }

export default function CobroDrawer({ open, onClose, onPagoExitoso }) {
  const { items, subtotalSinIgv, igvMonto, vaciar } = useCart()

  const [paso, setPaso] = useState(PASO.SELECCION)
  const [metodoUsado, setMetodoUsado] = useState(null)
  const [pagoFinal, setPagoFinal] = useState(null)

  const [snapshot, setSnapshot] = useState(SNAPSHOT_VACIO)

  const manejarFalloDeCreacion = () => {
    toast.error('Error al crear boleta. Intenta nuevamente.')
    onClose()
  }

  const { boleta, setBoleta, creando } = useBoletaPendiente(open, items, manejarFalloDeCreacion)

  useEffect(() => {
    if (!open) return
    setPaso(PASO.SELECCION)
    setMetodoUsado(null)
    setPagoFinal(null)
  }, [open])

  const handleClose = () => {
    setBoleta(null)
    setPaso(PASO.SELECCION)
    onClose()
  }

  const handleExito = (pagoData) => {
    setSnapshot({ items: [...items], subtotalSinIgv, igvMonto })
    setPagoFinal(pagoData)
    if (pagoData?.boleta_numero) {
      setBoleta(prev => ({ ...prev, numero: pagoData.boleta_numero }))
    }
    setPaso(PASO.EXITO)

    vaciar()
    boletaPendiente.olvidar()

    if (pagoData?.estado === ESTADO_PAGO.PENDIENTE) {
      toast.warning(
        'Pago en proceso — la boleta se actualizará automáticamente cuando se confirme.',
        { autoClose: 8000 },
      )
    } else {
      toast.success('¡Venta completada exitosamente!')
    }
  }

  const handleNuevaVenta = () => {
    const pago = pagoFinal
    setBoleta(null)
    setPaso(PASO.SELECCION)
    setPagoFinal(null)
    setMetodoUsado(null)
    onPagoExitoso(pago)
  }

  const metodoActivo = getMetodoPago(paso)
  const enSeleccion = paso === PASO.SELECCION
  const enExito = paso === PASO.EXITO
  const cargandoBoleta = creando || (!boleta && !enExito)

  const titulo = creando
    ? 'Generando boleta…'
    : enExito
      ? 'Boleta de venta'
      : (metodoActivo?.tituloPaso ?? TITULO_BASE)

  const mostrarVolver = !enSeleccion && !enExito && !creando

  return (
    <div className={`h-full overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'w-[480px]' : 'w-0'}`}>
      <div className={`ml-5 w-[460px] h-full bg-white rounded-2xl border border-gray-200 shadow-float flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {mostrarVolver && (
              <button
                onClick={() => setPaso(PASO.SELECCION)}
                className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-sunk text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Cambiar método de pago"
                aria-label="Cambiar método de pago"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="modal-title truncate">{titulo}</h2>
          </div>
          {!enExito && (
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-sunk text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors flex-shrink-0"
              title="Cancelar cobro"
              aria-label="Cancelar cobro"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5">
          {cargandoBoleta ? (
            <Loader text="Generando boleta…" />

          ) : enExito ? (
            <BoletaFinal
              boleta={boleta}
              items={snapshot.items}
              subtotalSinIgv={snapshot.subtotalSinIgv}
              igvMonto={snapshot.igvMonto}
              metodo={metodoUsado}
              pagoData={pagoFinal}
              onNuevaVenta={handleNuevaVenta}
            />

          ) : enSeleccion ? (
            <div className="animate-rise-in">
              <div className="tag-price flex flex-col justify-center mb-6 pr-5 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-extrabold">Total a cobrar</p>
                  <p className="text-[13px] font-bold tabular-nums">{boleta.numero}</p>
                </div>
                <p className="font-display text-[68px] font-black leading-none mt-1 tabular-nums">{formatSoles(boleta.total)}</p>
              </div>
              <h3 className="text-[15px] font-extrabold text-gray-900 mb-3">¿Cómo deseas pagar?</h3>
              <MetodoGrid
                total={boleta.total}
                onSeleccionar={(id) => { setMetodoUsado(id); setPaso(id) }}
              />
            </div>

          ) : metodoActivo ? (
            <div className="animate-rise-in">
              <metodoActivo.componente boleta={boleta} onExito={handleExito} />
            </div>

          ) : null}
        </div>
      </div>
    </div>
  )
}
