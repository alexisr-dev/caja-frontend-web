import { cancelarBoleta } from '../api/boletas'
import { STORAGE_KEYS } from '../utils/constants'

export function firmaCarrito(items) {
  return [...items]
    .sort((a, b) => a.sku.localeCompare(b.sku))
    .map(i => `${i.sku}:${i.cantidad}`)
    .join(',')
}

export function guardar(boleta, items) {
  sessionStorage.setItem(
    STORAGE_KEYS.BOLETA_PENDIENTE,
    JSON.stringify({ boleta, cartSignature: firmaCarrito(items) }),
  )
}

export function leerVigente(items) {
  try {
    const guardado = sessionStorage.getItem(STORAGE_KEYS.BOLETA_PENDIENTE)
    if (!guardado) return null
    const { boleta, cartSignature } = JSON.parse(guardado)
    return cartSignature === firmaCarrito(items) ? boleta : null
  } catch {
    return null
  }
}

export function olvidar() {
  sessionStorage.removeItem(STORAGE_KEYS.BOLETA_PENDIENTE)
}

export async function cancelarPendiente() {
  try {
    const guardado = sessionStorage.getItem(STORAGE_KEYS.BOLETA_PENDIENTE)
    if (guardado) {
      const { boleta } = JSON.parse(guardado)
      if (boleta?.id) await cancelarBoleta(boleta.id)
    }
  } catch {
  }
  olvidar()
}
