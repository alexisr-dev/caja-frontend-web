import { Banknote, CreditCard } from 'lucide-react'
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
    Icono: Banknote,
    componente: PagoEfectivo,
    subtitulo: () => 'Cobro directo con vuelto',
    estaDisponible: () => true,
    estilos: {
      tile: 'bg-ok text-white',
      hover: 'hover:border-ok focus-visible:border-ok',
    },
  },
  {
    id: METODO_PAGO.TARJETA,
    titulo: 'Tarjeta',
    tituloPaso: 'Pago con tarjeta',
    etiquetaBoleta: 'Tarjeta · Mercado Pago',
    icono: '💳',
    Icono: CreditCard,
    componente: PagoMPTarjeta,
    subtitulo: () => 'Crédito o débito · Mercado Pago',
    estaDisponible: () => true,
    estilos: {
      tile: 'bg-[#0A6BB0] text-white',
      hover: 'hover:border-[#0A6BB0] focus-visible:border-[#0A6BB0]',
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
      tile: 'bg-[#742284] text-white',
      hover: 'hover:border-[#742284] focus-visible:border-[#742284]',
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
