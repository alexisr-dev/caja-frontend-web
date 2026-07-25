const LOCALE = 'es-PE'

const OPCIONES_FECHA = { day: '2-digit', month: '2-digit', year: 'numeric' }
const OPCIONES_HORA = { hour: '2-digit', minute: '2-digit' }

export const formatSoles = (value) => {
  const num = parseFloat(value) || 0
  return `S/ ${num.toFixed(2)}`
}

export const formatFecha = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString(LOCALE, OPCIONES_FECHA)
}

export const formatFechaHora = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString(LOCALE, { ...OPCIONES_FECHA, ...OPCIONES_HORA })
}

/**
 * Variante sin coma separadora, para la cabecera de la boleta impresa donde
 * el ancho de 80 mm hace preferible el formato compacto.
 */
export const formatFechaHoraCorta = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.toLocaleDateString(LOCALE, OPCIONES_FECHA)}  ${d.toLocaleTimeString(LOCALE, OPCIONES_HORA)}`
}

export const formatPorcentaje = (value) => {
  const num = parseFloat(value) || 0
  return `${num.toFixed(1)}%`
}
