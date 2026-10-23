import { CheckCircle, Clock, Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { formatSoles, formatFechaHoraCorta } from '../../utils/formatters'
import { ESTADO_PAGO, METODO_PAGO } from '../../utils/constants'
import { etiquetarMetodo, getMetodoPago } from './metodosPago'
import { imprimirBoleta } from './boletaImprimible'

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
  const metodoCfg = getMetodoPago(metodo)
  const Icono = metodoCfg?.Icono
  const mostrarVuelto = metodo === METODO_PAGO.EFECTIVO && vuelto != null

  const handleImprimir = () => {
    const abierta = imprimirBoleta({ boleta, items, subtotalSinIgv, igvMonto, metodo, pagoData })
    if (!abierta) toast.error('Permite las ventanas emergentes para descargar la boleta')
  }

  return (
    <div className="animate-rise-in flex flex-col gap-4">

      <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${pendiente ? 'bg-warn-bg' : 'bg-ok-bg'}`}>
        <span className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${pendiente ? 'bg-gold text-gray-900' : 'bg-ok text-white'}`}>
          {pendiente ? <Clock size={26} /> : <CheckCircle size={26} />}
        </span>
        <div className="min-w-0">
          <p className={`font-display text-[38px] font-black uppercase leading-none ${pendiente ? 'text-[#5E3E00]' : 'text-ok-deep'}`}>
            {pendiente ? 'Pago en proceso' : '¡Venta completada!'}
          </p>
          {pendiente && (
            <p className="text-[13px] text-[#5E3E00] mt-1.5">
              Se confirmará automáticamente cuando se apruebe
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="bg-navy text-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/70 font-bold">Boleta de venta</p>
              <p className="text-xl font-extrabold tabular-nums mt-0.5 tracking-wide">{boleta.numero}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-white/80 tabular-nums">{formatFechaHoraCorta(new Date())}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-200">
          <p className="text-xs font-extrabold text-gray-500 mb-3">Productos</p>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.sku} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0 text-xs font-extrabold text-gray-500 bg-sunk rounded-lg px-1.5 py-0.5 tabular-nums">
                    {item.cantidad}x
                  </span>
                  <span className="text-sm text-gray-800 truncate">{item.nombre}</span>
                </div>
                <span className="text-sm font-extrabold text-gray-900 tabular-nums flex-shrink-0">
                  {formatSoles(parseFloat(item.precio) * item.cantidad)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-gray-200 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal (sin IGV)</span>
            <span className="tabular-nums">{formatSoles(subtotalSinIgv)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>IGV (18%)</span>
            <span className="tabular-nums">{formatSoles(igvMonto)}</span>
          </div>
          <div className="tag-price flex justify-between items-center pr-4 py-2 mt-2">
            <span className="font-extrabold text-[15px]">Total</span>
            <span className="font-display text-[44px] font-black leading-none tabular-nums">
              {formatSoles(boleta.total)}
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-extrabold text-gray-500 mb-2">Método de pago</p>
          <div className="flex items-center gap-2.5">
            {Icono ? (
              <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${metodoCfg.estilos.tile}`}>
                <Icono size={18} />
              </span>
            ) : metodoCfg?.imagen ? (
              <img src={metodoCfg.imagen} alt="" className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 object-cover" />
            ) : (
              <span className="text-lg">{icono}</span>
            )}
            <span className="text-sm font-extrabold text-gray-800">{texto}</span>
          </div>
          {mostrarVuelto && (
            <div className="mt-3 bg-ok-deep rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm text-white font-bold">Vuelto entregado</span>
              <span className="font-display text-[38px] font-black leading-none text-gold tabular-nums">
                {formatSoles(vuelto)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleImprimir}
          className="w-full h-12 rounded-xl bg-sunk hover:bg-gray-200 text-gray-900 font-bold text-[15px] transition-[background-color,transform] duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Descargar boleta PDF
        </button>
        <button
          onClick={onNuevaVenta}
          className="w-full h-14 rounded-xl bg-navy hover:bg-navy-700 text-white font-extrabold text-[17px] transition-[background-color,transform] duration-150 active:scale-[0.98]"
        >
          Nueva venta →
        </button>
      </div>

    </div>
  )
}
