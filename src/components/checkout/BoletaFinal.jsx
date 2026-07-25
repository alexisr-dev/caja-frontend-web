import { CheckCircle, Clock, Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { formatSoles, formatFechaHoraCorta } from '../../utils/formatters'
import { ESTADO_PAGO, METODO_PAGO } from '../../utils/constants'
import { etiquetarMetodo } from './metodosPago'
import { imprimirBoleta } from './boletaImprimible'

/** Comprobante en pantalla que se muestra al cerrar la venta. */
export default function BoletaFinal({
  boleta,
  items,
  subtotalSinIgv,
  igvMonto,
  metodo,
  pagoData,
  onNuevaVenta,
}) {
  const pendiente = pagoData?.estado === ESTADO_PAGO.PENDIENTE
  const vuelto = pagoData?.vuelto
  const { icono, texto } = etiquetarMetodo(metodo)
  const mostrarVuelto = metodo === METODO_PAGO.EFECTIVO && vuelto != null

  const handleImprimir = () => {
    const abierta = imprimirBoleta({ boleta, items, subtotalSinIgv, igvMonto, metodo, pagoData })
    if (!abierta) toast.error('Permite las ventanas emergentes para descargar la boleta')
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5">

      {/* Encabezado de éxito */}
      <div className={`rounded-2xl p-6 text-center ${pendiente ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
        {pendiente
          ? <Clock size={48} className="mx-auto text-amber-500 mb-3" />
          : <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />}
        <p className={`text-xl font-extrabold ${pendiente ? 'text-amber-700' : 'text-green-700'}`}>
          {pendiente ? 'Pago en proceso' : '¡Venta completada!'}
        </p>
        {pendiente && (
          <p className="text-xs text-amber-600 mt-1">
            Se confirmará automáticamente cuando se apruebe
          </p>
        )}
      </div>

      {/* Boleta formal */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        <div className="bg-gray-900 text-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Boleta de venta</p>
              <p className="text-lg font-bold font-mono mt-0.5">{boleta.numero}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{formatFechaHoraCorta(new Date())}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Productos</p>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.sku} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0 text-xs font-bold text-gray-400 bg-gray-100 rounded-md px-1.5 py-0.5 tabular-nums">
                    {item.cantidad}x
                  </span>
                  <span className="text-sm text-gray-700 truncate">{item.nombre}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 tabular-nums flex-shrink-0">
                  {formatSoles(parseFloat(item.precio) * item.cantidad)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal (sin IGV)</span>
            <span className="tabular-nums">{formatSoles(subtotalSinIgv)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>IGV (18%)</span>
            <span className="tabular-nums">{formatSoles(igvMonto)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-extrabold text-[#009EE3] tabular-nums tracking-tight">
              {formatSoles(boleta.total)}
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Método de pago</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{icono}</span>
            <span className="text-sm font-semibold text-gray-700">{texto}</span>
          </div>
          {mostrarVuelto && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-green-700 font-medium">Vuelto entregado</span>
              <span className="text-lg font-extrabold text-green-600 tabular-nums">
                {formatSoles(vuelto)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleImprimir}
          className="w-full py-3.5 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Descargar boleta PDF
        </button>
        <button
          onClick={onNuevaVenta}
          className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-base transition-colors shadow-lg shadow-gray-900/20"
        >
          Nueva venta →
        </button>
      </div>

    </div>
  )
}
