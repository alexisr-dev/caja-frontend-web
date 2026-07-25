import { IGV } from './constants'

/**
 * Aritmetica de precios.
 *
 * Los precios que maneja la caja ya vienen con IGV incluido, asi que el
 * impuesto se *extrae* del total en lugar de sumarse encima. Esta es la unica
 * definicion de esa formula en el frontend.
 */

/** Porcion de IGV contenida en un importe que ya lo incluye. */
export const calcularIGV = (totalConIgv) => totalConIgv * (IGV / (1 + IGV))

/** Importe neto, una vez descontado el IGV. */
export const calcularSubtotalSinIGV = (totalConIgv) => totalConIgv - calcularIGV(totalConIgv)

/** Total de una linea del carrito (el precio llega como string desde la API). */
export const calcularSubtotalLinea = (item) => parseFloat(item.precio) * item.cantidad

/** Total del carrito completo. */
export const calcularTotalCarrito = (items) =>
  items.reduce((acumulado, item) => acumulado + calcularSubtotalLinea(item), 0)

/** Desglose listo para mostrar: total, IGV contenido y neto. */
export const desglosarTotales = (items) => {
  const total = calcularTotalCarrito(items)
  const igvMonto = calcularIGV(total)
  return { total, igvMonto, subtotalSinIgv: total - igvMonto }
}

export const calcularVuelto = (montoRecibido, total) => Math.max(0, montoRecibido - total)
