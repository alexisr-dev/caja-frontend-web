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

/** Pasos del drawer que no corresponden a un medio de pago concreto. */
const PASO = {
  SELECCION: 'metodo',
  EXITO: 'exito',
}

const TITULO_BASE = 'Cobrar venta'

const SNAPSHOT_VACIO = { items: [], subtotalSinIgv: 0, igvMonto: 0 }

/**
 * Panel lateral de cobro.
 *
 * Actua solo como orquestador del flujo (seleccion de medio → cobro → boleta):
 * el detalle de cada medio de pago lo aporta el registro `metodosPago`, el
 * comprobante lo pinta `BoletaFinal` y la boleta la gestiona
 * `useBoletaPendiente`.
 */
export default function CobroDrawer({ open, onClose, onPagoExitoso }) {
  // El total a cobrar se toma de la boleta ya creada en el backend, no del
  // carrito: es el importe autoritativo (incluye descuentos aplicados alli).
  const { items, subtotalSinIgv, igvMonto, vaciar } = useCart()

  const [paso, setPaso] = useState(PASO.SELECCION)
  const [metodoUsado, setMetodoUsado] = useState(null)
  const [pagoFinal, setPagoFinal] = useState(null)

  // Copia del carrito tomada justo antes de vaciarlo, para poder seguir
  // mostrando (e imprimiendo) el detalle en la boleta final.
  const [snapshot, setSnapshot] = useState(SNAPSHOT_VACIO)

  const manejarFalloDeCreacion = () => {
    toast.error('Error al crear boleta. Intenta nuevamente.')
    onClose()
  }

  const { boleta, setBoleta, creando } = useBoletaPendiente(open, items, manejarFalloDeCreacion)

  // Cada apertura del drawer arranca un cobro limpio.
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

  /** Cobro aceptado: congela el carrito, lo vacia y muestra el comprobante. */
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
    <div className={`h-full overflow-hidden transition-all duration-300 ease-out ${open ? 'w-[460px]' : 'w-0'}`}>
      <div className={`w-[460px] h-full bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {mostrarVolver && (
              <button
                onClick={() => setPaso(PASO.SELECCION)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
                title="Cambiar método de pago"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-gray-900 truncate">{titulo}</h2>
          </div>
          {/* Se oculta la X en la boleta final para evitar un cierre accidental. */}
          {!enExito && (
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
              title="Cancelar cobro"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
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
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-gray-200">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total a cobrar</p>
                <p className="text-3xl font-extrabold mt-1 tracking-tight">{formatSoles(boleta.total)}</p>
                <p className="text-xs text-gray-500 mt-1 font-mono">{boleta.numero}</p>
              </div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">¿Cómo deseas pagar?</h3>
              <MetodoGrid
                total={boleta.total}
                onSeleccionar={(id) => { setMetodoUsado(id); setPaso(id) }}
              />
            </div>

          ) : metodoActivo ? (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <metodoActivo.componente boleta={boleta} onExito={handleExito} />
            </div>

          ) : null}
        </div>
      </div>
    </div>
  )
}
