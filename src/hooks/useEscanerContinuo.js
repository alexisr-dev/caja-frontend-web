import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { escanearProducto } from '../api/ia'
import { formatSoles } from '../utils/formatters'
import { RESULTADO_IA } from '../utils/constants'

export const CAP_W = 1280
export const CAP_H = 720

const INTERVALO_MS = 700
const VENTANA = 5
const VOTOS_MIN = 3
const COOLDOWN_MS = 1800
const VACIO = '∅'

export function consenso(historial, votosMin = VOTOS_MIN) {
  if (historial.length < votosMin) return null

  const conteo = new Map()
  for (const etiqueta of historial) {
    conteo.set(etiqueta, (conteo.get(etiqueta) ?? 0) + 1)
  }

  let ganadora = null
  let maxVotos = 0
  for (const [etiqueta, votos] of conteo) {
    if (votos > maxVotos) {
      ganadora = etiqueta
      maxVotos = votos
    }
  }
  return maxVotos >= votosMin ? ganadora : null
}

export function useEscanerContinuo(webcamRef, onReconocido, pausado = false) {
  const [bbox, setBbox] = useState(null)
  const [estado, setEstado] = useState('buscando')
  const [etiqueta, setEtiqueta] = useState(null)

  const enVueloRef = useRef(false)
  const historialRef = useRef([])
  const pausaHastaRef = useRef(0)
  const ultimoAgregadoRef = useRef(null)
  const timerRef = useRef(null)
  const montadoRef = useRef(true)

  const pausadoRef = useRef(pausado)
  const onReconocidoRef = useRef(onReconocido)

  useEffect(() => { onReconocidoRef.current = onReconocido }, [onReconocido])

  useEffect(() => {
    pausadoRef.current = pausado
    if (pausado) {
      setBbox(null)
      setEstado('buscando')
      setEtiqueta(null)
      historialRef.current = []
    }
  }, [pausado])

  useEffect(() => {
    montadoRef.current = true

    const recordar = (etq) => {
      const historial = historialRef.current
      historial.push(etq)
      if (historial.length > VENTANA) historial.shift()
    }

    const programar = () => {
      if (!montadoRef.current) return
      timerRef.current = setTimeout(tick, INTERVALO_MS)
    }

    const debeSaltarCiclo = () =>
      pausadoRef.current ||
      Date.now() < pausaHastaRef.current ||
      enVueloRef.current

    const procesarReconocimiento = (data) => {
      const producto = data.producto
      if (data.bbox) setBbox(data.bbox)
      recordar(producto.sku)

      const ganador = consenso(historialRef.current)
      const esNuevo = ganador === producto.sku && ganador !== ultimoAgregadoRef.current

      setEtiqueta({ nombre: producto.nombre, confianza: data.confianza })

      if (!esNuevo) {
        setEstado('buscando')
        return
      }

      setEstado('confirmado')
      onReconocidoRef.current?.(producto)
      toast.success(`${producto.nombre} — ${formatSoles(producto.precio)}`)
      historialRef.current = []
      ultimoAgregadoRef.current = producto.sku
      pausaHastaRef.current = Date.now() + COOLDOWN_MS
    }

    const procesarSinProducto = () => {
      setBbox(null)
      setEstado('buscando')
      recordar(VACIO)
      if (consenso(historialRef.current) === VACIO) {
        ultimoAgregadoRef.current = null
        setEtiqueta(null)
      }
    }

    const tick = async () => {
      if (!montadoRef.current) return
      if (debeSaltarCiclo()) return programar()

      const captura = webcamRef.current?.getScreenshot({ width: CAP_W, height: CAP_H })
      if (!captura) return programar()

      enVueloRef.current = true
      try {
        const blob = await (await fetch(captura)).blob()
        const data = await escanearProducto(blob)
        if (!montadoRef.current) return

        if (data.resultado === RESULTADO_IA.OK && data.producto) {
          procesarReconocimiento(data)
        } else {
          procesarSinProducto()
        }
      } catch {
      } finally {
        enVueloRef.current = false
        programar()
      }
    }

    tick()

    return () => {
      montadoRef.current = false
      clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { bbox, estado, etiqueta }
}
