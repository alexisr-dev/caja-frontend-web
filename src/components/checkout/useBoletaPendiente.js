import { useEffect, useState } from 'react'
import { crearBoleta, cancelarBoleta } from '../../api/boletas'
import * as boletaPendiente from '../../services/boletaPendiente'

/**
 * Obtiene la boleta con la que se va a cobrar cuando se abre el drawer.
 *
 * Reutiliza la que quedo guardada en sesion si el carrito no cambio; si no,
 * pide una nueva al backend. Si el drawer se cierra mientras la peticion esta
 * en vuelo, cancela la boleta creada para no dejarla colgada como PENDIENTE.
 *
 * @param {boolean} abierto  Si el drawer esta visible.
 * @param {Array}   items    Items del carrito.
 * @param {Function} onError Callback cuando la boleta no se pudo crear.
 */
export function useBoletaPendiente(abierto, items, onError) {
  const [boleta, setBoleta] = useState(null)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    if (!abierto) return

    const vigente = boletaPendiente.leerVigente(items)
    if (vigente) {
      setBoleta(vigente)
      return
    }

    let cancelado = false
    setCreando(true)

    crearBoleta({
      tipo: 'BOLETA',
      items: items.map(i => ({ sku: i.sku, cantidad: i.cantidad })),
    })
      .then(data => {
        if (cancelado) {
          // El drawer se cerro mientras se creaba: anularla de inmediato.
          cancelarBoleta(data.id).catch(() => {})
          return
        }
        boletaPendiente.guardar(data, items)
        setBoleta(data)
      })
      .catch(() => {
        if (!cancelado) onError?.()
      })
      .finally(() => {
        if (!cancelado) setCreando(false)
      })

    return () => { cancelado = true }
    // `items` se congela al abrir: cambiarlo con el drawer abierto no debe
    // disparar la creacion de otra boleta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  return { boleta, setBoleta, creando }
}
