import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTurno } from '../../context/TurnoContext'
import { useCart } from '../../context/CartContext'
import CartList from '../../components/cart/CartList'
import CartSummary from '../../components/cart/CartSummary'
import FlyingImage, { VUELO_MS } from '../../components/cart/FlyingImage'
import CobroDrawer from '../../components/checkout/CobroDrawer'
import CameraCapture from '../../components/camera/CameraCapture'
import Loader from '../../components/common/Loader'
import { cancelarPendiente } from '../../services/boletaPendiente'
import { Camera, CameraOff, ScanLine, ShoppingCart, Sparkles } from 'lucide-react'

export default function CajaPage() {
  const { turno, loading: loadingTurno } = useTurno()
  const { items, agregarItem } = useCart()
  const navigate = useNavigate()

  const [modoCamera, setModoCamera] = useState(false)
  const [cobroAbierto, setCobroAbierto] = useState(false)

  // Animación "fly to cart"
  const cameraWrapRef = useRef(null)
  const cartRef = useRef(null)
  const [voladores, setVoladores] = useState([])
  const [cartPulse, setCartPulse] = useState(false)

  useEffect(() => {
    if (!loadingTurno && !turno) navigate('/caja/abrir-turno', { replace: true })
  }, [turno, loadingTurno, navigate])

  // Al salir de la caja se anula la boleta que hubiera quedado a medias.
  useEffect(() => {
    return () => { cancelarPendiente() }
  }, [])

  const lanzarVuelo = (producto) => {
    const img = producto.imagen_principal ?? producto.primera_foto ?? producto.fotos?.[0]?.imagen
    const fromEl = cameraWrapRef.current
    const toEl = cartRef.current
    if (!img || !fromEl || !toEl) return

    const fr = fromEl.getBoundingClientRect()
    const tr = toEl.getBoundingClientRect()
    const id = `${Date.now()}-${Math.random()}`
    setVoladores(v => [...v, {
      id,
      img,
      from: { x: fr.left + fr.width / 2, y: fr.top + fr.height / 2 },
      to: { x: tr.left + tr.width / 2, y: tr.top + 36 },
    }])
    // El pulso ocurre justo cuando la foto "aterriza" en el carrito
    setTimeout(() => {
      setCartPulse(true)
      setTimeout(() => setCartPulse(false), 450)
    }, VUELO_MS - 200)
  }

  const handleReconocido = (producto) => {
    // Detección en vivo: agrega, lanza la animación y mantiene la cámara abierta
    agregarItem(producto)
    lanzarVuelo(producto)
  }

  // Cierra el drawer cancelando la boleta pendiente en backend
  const handleCerrarCobro = async () => {
    setCobroAbierto(false)
    await cancelarPendiente()
  }

  // Pago completado: el drawer ya vació el carrito y mostró la boleta
  const onPagoExitoso = (pagoData) => {
    setCobroAbierto(false)
    if (pagoData?.estado === 'PENDIENTE') {
      navigate('/caja/historial')
    }
  }

  if (loadingTurno) return <Loader />

  return (
    <div className="flex h-full bg-gray-50">
      {/* Panel principal: escáner IA */}
      <div className="relative flex-1 flex flex-col p-6 overflow-hidden">
        {cobroAbierto && (
          <div
            className="absolute inset-0 z-20 bg-black/30 animate-in fade-in duration-300 cursor-pointer"
            onClick={handleCerrarCobro}
          />
        )}

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> Escáner de productos
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Apunta el producto a la cámara y se agrega solo al carrito
            </p>
          </div>
          <button
            onClick={() => setModoCamera(v => !v)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              modoCamera
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
            }`}
          >
            {modoCamera ? <CameraOff size={16} /> : <Camera size={16} />}
            {modoCamera ? 'Detener escáner' : 'Iniciar escáner'}
          </button>
        </div>

        {/* Área del escáner */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {modoCamera ? (
            <div ref={cameraWrapRef} className="w-full h-full flex items-center">
              <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                <CameraCapture onReconocido={handleReconocido} pausado={cobroAbierto} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center text-center py-20 px-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ScanLine size={30} />
                </div>
                <p className="font-semibold text-gray-800">Escáner inactivo</p>
                <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm">
                  Inicia el escáner para reconocer productos con la cámara y agregarlos al carrito automáticamente.
                </p>
                <button
                  onClick={() => setModoCamera(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <Camera size={16} /> Iniciar escáner
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carrito */}
      <aside
        ref={cartRef}
        className={`w-80 bg-white border-l border-gray-200 flex flex-col ${cartPulse ? 'animate-[cartPulse_450ms_ease]' : ''}`}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={18} /> Carrito
          </h2>
          {items.length > 0 && (
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
            </span>
          )}
        </div>
        <CartList bloqueado={cobroAbierto} />
        <CartSummary bloqueado={cobroAbierto} onCobrar={() => setCobroAbierto(true)} />
      </aside>

      <CobroDrawer
        open={cobroAbierto}
        onClose={handleCerrarCobro}
        onPagoExitoso={onPagoExitoso}
      />

      {/* Clones que vuelan al carrito al detectar un producto */}
      {voladores.map(v => (
        <FlyingImage
          key={v.id}
          img={v.img}
          from={v.from}
          to={v.to}
          onDone={() => setVoladores(s => s.filter(x => x.id !== v.id))}
        />
      ))}
    </div>
  )
}
