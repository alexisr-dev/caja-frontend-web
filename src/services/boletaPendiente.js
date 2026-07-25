import { cancelarBoleta } from '../api/boletas'
import { STORAGE_KEYS } from '../utils/constants'

/**
 * Boleta en curso durante el cobro.
 *
 * Se persiste en `sessionStorage` para sobrevivir a un refresco de pagina en
 * mitad del checkout y poder reutilizar la boleta ya creada en el backend en
 * lugar de generar una nueva (que dejaria la anterior colgada como PENDIENTE).
 *
 * Vive fuera de `api/` porque es estado de navegador, no transporte HTTP.
 */

/**
 * Huella del carrito. Si el vendedor cambia cantidades, la boleta guardada
 * deja de ser valida y hay que pedir una nueva.
 */
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

/** Devuelve la boleta guardada solo si sigue correspondiendo a este carrito. */
export function leerVigente(items) {
  try {
    const guardado = sessionStorage.getItem(STORAGE_KEYS.BOLETA_PENDIENTE)
    if (!guardado) return null
    const { boleta, cartSignature } = JSON.parse(guardado)
    return cartSignature === firmaCarrito(items) ? boleta : null
  } catch {
    // Storage corrupto: se ignora y se creara una boleta nueva.
    return null
  }
}

export function olvidar() {
  sessionStorage.removeItem(STORAGE_KEYS.BOLETA_PENDIENTE)
}

/**
 * Cancela en el backend la boleta pendiente (si la hay) y limpia el storage.
 * Falla en silencio a proposito: es una limpieza best-effort que no debe
 * bloquear al vendedor ni romper el flujo de venta.
 */
export async function cancelarPendiente() {
  try {
    const guardado = sessionStorage.getItem(STORAGE_KEYS.BOLETA_PENDIENTE)
    if (guardado) {
      const { boleta } = JSON.parse(guardado)
      if (boleta?.id) await cancelarBoleta(boleta.id)
    }
  } catch {
    // Sin manejo: la boleta quedara PENDIENTE y el backend la anulara al
    // iniciar la siguiente cobranza.
  }
  olvidar()
}
