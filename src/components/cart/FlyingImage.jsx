import { useEffect, useRef } from 'react'

export const VUELO_MS = 1150 // duración del vuelo (usado también para sincronizar el pulso del carrito)

// Clon de la foto del producto que "vuela" desde `from` hasta `to` siguiendo un
// arco curvo (Bézier) con pop inicial y desvanecido suave. Se autodestruye al final.
// from/to son coordenadas de viewport: { x, y }.
export default function FlyingImage({ img, from, to, onDone }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) { onDone?.(); return }

    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.hypot(dx, dy)
    const lift = Math.min(260, Math.max(120, dist * 0.4)) // altura del arco

    // Punto de control del Bézier cuadrático: a mitad de camino, elevado (arco hacia arriba)
    const cx = dx * 0.5
    const cy = dy * 0.5 - lift

    const N = 30
    const frames = []
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const mt = 1 - t
      const x = 2 * mt * t * cx + t * t * dx
      const y = 2 * mt * t * cy + t * t * dy

      // Escala: pop a 1.12 al inicio, luego decrece suave hasta 0.34
      const s = t < 0.14
        ? 0.72 + (t / 0.14) * (1.12 - 0.72)
        : 1.12 + ((t - 0.14) / 0.86) * (0.34 - 1.12)

      // Opacidad: entra rápido, se mantiene, y desvanece en el último tramo
      let o = 1
      if (t < 0.08) o = t / 0.08
      else if (t > 0.8) o = Math.max(0, (1 - t) / 0.2)

      // Leve giro para dar vida
      const rot = t * 8

      frames.push({
        offset: t,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})`,
        opacity: o,
      })
    }

    const anim = el.animate(frames, {
      duration: VUELO_MS,
      easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
      fill: 'forwards',
    })
    anim.onfinish = () => onDone?.()

    return () => { try { anim.cancel() } catch { /* noop */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <img
      ref={ref}
      src={img}
      alt=""
      style={{
        position: 'fixed',
        left: from.x,
        top: from.y,
        width: 132,
        height: 132,
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
      className="object-contain bg-white rounded-2xl border border-gray-200 shadow-2xl ring-4 ring-primary/20"
    />
  )
}
