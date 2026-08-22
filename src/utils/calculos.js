import { IGV } from './constants'

export const calcularIGV = (totalConIgv) => totalConIgv * (IGV / (1 + IGV))

export const calcularSubtotalSinIGV = (totalConIgv) => totalConIgv - calcularIGV(totalConIgv)

export const calcularSubtotalLinea = (item) => parseFloat(item.precio) * item.cantidad

export const calcularTotalCarrito = (items) =>
  items.reduce((acumulado, item) => acumulado + calcularSubtotalLinea(item), 0)

export const desglosarTotales = (items) => {
  const total = calcularTotalCarrito(items)
  const igvMonto = calcularIGV(total)
  return { total, igvMonto, subtotalSinIgv: total - igvMonto }
}

export const calcularVuelto = (montoRecibido, total) => Math.max(0, montoRecibido - total)
