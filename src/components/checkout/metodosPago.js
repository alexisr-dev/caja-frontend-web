import { METODO_PAGO, YAPE_MONTO_MINIMO } from '../../utils/constants'
import { formatSoles } from '../../utils/formatters'
import PagoEfectivo from './PagoEfectivo'
import PagoMPTarjeta from './PagoMPTarjeta'
import PagoMPYape from './PagoMPYape'

export const METODOS_PAGO = [
  {
    id: METODO_PAGO.EFECTIVO,
    titulo: 'Efectivo',
    tituloPaso: 'Pago en efectivo',
    etiquetaBoleta: 'Efectivo',
    icono: '💵',
    componente: PagoEfectivo,
    subtitulo: () => 'Cobro directo con vuelto',
    estaDisponible: () => true,
    estilos: {
      color: 'from-amber-100 to-amber-50',
      hover: 'hover:border-amber-400 hover:shadow-amber-100/50 focus:ring-amber-100',
      titleHover: 'group-hover:text-amber-700',
      arrowHover: 'group-hover:text-amber-400',
    },
  },
  {
    id: METODO_PAGO.TARJETA,
    titulo: 'Tarjeta',
    tituloPaso: 'Pago con tarjeta',
    etiquetaBoleta: 'Tarjeta · Mercado Pago',
    icono: '💳',
    componente: PagoMPTarjeta,
    subtitulo: () => 'Crédito o débito · Mercado Pago',
    estaDisponible: () => true,
    estilos: {
      color: 'from-[#009EE3] to-[#0077B6]',
      hover: 'hover:border-[#009EE3] hover:shadow-[#009EE3]/10 focus:ring-[#009EE3]/20',
      titleHover: 'group-hover:text-[#009EE3]',
      arrowHover: 'group-hover:text-[#009EE3]',
    },
  },
  {
    id: METODO_PAGO.YAPE,
    titulo: 'Yape',
    tituloPaso: 'Pago con Yape',
    etiquetaBoleta: 'Yape · Mercado Pago',
    icono: '📱',
    imagen: '/yape.webp',
    componente: PagoMPYape,
    subtitulo: (total) =>
      total >= YAPE_MONTO_MINIMO
        ? 'Pago rápido con código'
        : `Mínimo ${formatSoles(YAPE_MONTO_MINIMO)}`,
    estaDisponible: (total) => total >= YAPE_MONTO_MINIMO,
    estilos: {
      color: 'from-purple-500 to-purple-600',
      hover: 'hover:border-purple-400 hover:shadow-purple-100/50 focus:ring-purple-100',
      titleHover: 'group-hover:text-purple-700',
      arrowHover: 'group-hover:text-purple-400',
    },
  },
]

export const getMetodoPago = (id) => METODOS_PAGO.find(m => m.id === id) ?? null

export const etiquetarMetodo = (id) => {
  const metodo = getMetodoPago(id)
  return metodo
    ? { icono: metodo.icono, texto: metodo.etiquetaBoleta }
    : { icono: '💳', texto: id }
}

export const resolverOpciones = (total) => {
  const monto = parseFloat(total) || 0
  return METODOS_PAGO.map(metodo => ({
    ...metodo,
    subtituloTexto: metodo.subtitulo(monto),
    disponible: metodo.estaDisponible(monto),
  }))
}
