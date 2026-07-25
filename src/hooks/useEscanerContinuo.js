import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { escanearProducto } from '../api/ia'
import { formatSoles } from '../utils/formatters'
import { RESULTADO_IA } from '../utils/constants'

// ── Parametros de calibracion del escaner ────────────────────────────────────
export const CAP_W = 1280
export const CAP_H = 720

const INTERVALO_MS = 700   // espera entre ciclos; la tasa real la limita el "en vuelo"
const VENTANA = 5          // frames que se acumulan para votar
const VOTOS_MIN = 3        // coincidencias necesarias para confirmar
const COOLDOWN_MS = 1800   // pausa tras agregar, para cambiar de producto
const VACIO = '∅'          // centinela de frame sin producto reconocido

/**
 * Etiqueta mas votada del historial, si alcanza el minimo de votos.
 *
 * La votacion por mayoria evita que un unico frame borroso agregue un producto
 * equivocado al carrito: hacen falta VOTOS_MIN lecturas coincidentes.
 */
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

/**
 * Bucle de reconocimiento en vivo sobre una webcam.
 *
 * Captura un frame cada `INTERVALO_MS`, lo manda al backend y confirma un
 * producto solo cuando varios frames seguidos coinciden. Tras confirmar entra
 * en cooldown para que el vendedor pueda retirar el producto sin que se
 * duplique.
 *
 * @param {object}   webcamRef    Ref al componente `react-webcam`.
 * @param {Function} onReconocido Se invoca con el producto confirmado.
 * @param {boolean}  pausado      Suspende la deteccion (p. ej. cobro abierto).
 * @returns {{bbox, estado, etiqueta}} Estado para pintar el overlay.
 */
export function useEscanerContinuo(webcamRef, onReconocido, pausado = false) {
  const [bbox, setBbox] = useState(null)
  const [estado, setEstado] = useState('buscando') // 'buscando' | 'confirmado'
  const [etiqueta, setEtiqueta] = useState(null)   // { nombre, confianza }

  const enVueloRef = useRef(false)      // hay una peticion sin resolver
  const historialRef = useRef([])       // ultimas N etiquetas (SKU o VACIO)
  const pausaHastaRef = useRef(0)       // timestamp de fin del cooldown
  const ultimoAgregadoRef = useRef(null) // anti-duplicado del ultimo SKU
  const timerRef = useRef(null)
  const montadoRef = useRef(true)

  // Refs espejo: permiten que el bucle lea siempre el valor actual sin tener
  // que recrearse (y perder su estado) en cada render.
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
      pausadoRef.current ||                      // cobro abierto
      Date.now() < pausaHastaRef.current ||      // cooldown tras agregar
      enVueloRef.current                         // peticion anterior sin resolver

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
      // Cuando el cuadro queda vacio de forma estable, se libera el
      // anti-duplicado para poder volver a escanear el mismo producto.
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
        // Fallo de red en un frame suelto: se ignora para no spamear al
        // vendedor; el siguiente ciclo reintenta.
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
