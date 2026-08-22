import { useEffect, useState } from 'react'
import { crearBoleta, cancelarBoleta } from '../../api/boletas'
import * as boletaPendiente from '../../services/boletaPendiente'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  return { boleta, setBoleta, creando }
}
