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
import { Camera, CameraOff, ScanLine } from 'lucide-react'

export default function CajaPage() {
  const { turno, loading: loadingTurno } = useTurno()
  const { items, agregarItem } = useCart()
  const navigate = useNavigate()

  const [modoCamera, setModoCamera] = useState(false)
  const [cobroAbierto, setCobroAbierto] = useState(false)

  const cameraWrapRef = useRef(null)
  const cartRef = useRef(null)
  const [voladores, setVoladores] = useState([])
  const [cartPulse, setCartPulse] = useState(false)

  useEffect(() => {
    if (!loadingTurno && !turno) navigate('/caja/abrir-turno', { replace: true })
  }, [turno, loadingTurno, navigate])

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
    setTimeout(() => {
      setCartPulse(true)
      setTimeout(() => setCartPulse(false), 450)
    }, VUELO_MS - 200)
  }

  const handleReconocido = (producto) => {
    agregarItem(producto)
    lanzarVuelo(producto)
  }

  const handleCerrarCobro = async () => {
    setCobroAbierto(false)
    await cancelarPendiente()
  }

  const onPagoExitoso = (pagoData) => {
    setCobroAbierto(false)
    if (pagoData?.estado === 'PENDIENTE') {
      navigate('/caja/historial')
    }
  }

  if (loadingTurno) return <Loader />

  return (
    <div className="flex h-full bg-ground p-5">
      <div className="relative flex-1 min-w-0 flex flex-col panel p-6 mr-5 overflow-hidden">
        {cobroAbierto && (
          <div
            className="absolute inset-0 z-20 bg-navy/45 animate-fade-in cursor-pointer"
            onClick={handleCerrarCobro}
          />
        )}

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-900">Escáner de productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Apunta el producto a la cámara y se agrega solo al carrito
            </p>
          </div>
          <button
            onClick={() => setModoCamera(v => !v)}
            className={`shrink-0 flex items-center gap-2 h-11 px-5 rounded-xl text-[15px] font-bold transition-[background-color,transform] duration-150 active:scale-[0.97] ${
              modoCamera
                ? 'bg-err-bg text-err hover:bg-[#F7D5CB]'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {modoCamera ? <CameraOff size={18} /> : <Camera size={18} />}
            {modoCamera ? 'Detener escáner' : 'Iniciar escáner'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {modoCamera ? (
            <div ref={cameraWrapRef} className="w-full h-full flex items-center">
              <div className="w-full rounded-2xl bg-sunk p-2.5">
                <CameraCapture onReconocido={handleReconocido} pausado={cobroAbierto} />
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[320px] rounded-2xl bg-sunk flex flex-col items-center justify-center text-center px-6">
              <span className="viewfinder-corner left-9 top-9 border-t-[5px] border-l-[5px] rounded-tl-[10px]" />
              <span className="viewfinder-corner right-9 top-9 border-t-[5px] border-r-[5px] rounded-tr-[10px]" />
              <span className="viewfinder-corner left-9 bottom-9 border-b-[5px] border-l-[5px] rounded-bl-[10px]" />
              <span className="viewfinder-corner right-9 bottom-9 border-b-[5px] border-r-[5px] rounded-br-[10px]" />

              <div className="w-[72px] h-[72px] rounded-[20px] bg-white text-primary flex items-center justify-center mb-4">
                <ScanLine size={34} />
              </div>
              <p className="font-display text-[44px] font-black uppercase leading-none text-gray-900">Escáner inactivo</p>
              <p className="text-[15px] text-gray-500 mt-3 mb-6 max-w-sm leading-relaxed">
                Inicia el escáner para reconocer productos con la cámara y agregarlos al carrito automáticamente.
              </p>
              <button
                onClick={() => setModoCamera(true)}
                className="flex items-center gap-2 h-14 px-7 rounded-xl bg-primary text-white text-[17px] font-bold hover:bg-primary-dark transition-[background-color,transform] duration-150 active:scale-[0.97]"
              >
                <Camera size={20} /> Iniciar escáner
              </button>
            </div>
          )}
        </div>
      </div>

      <aside
        ref={cartRef}
        className={`w-[360px] shrink-0 panel flex flex-col ${cartPulse ? 'animate-[cartPulse_450ms_ease]' : ''}`}
      >
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900">Carrito</h2>
          {items.length > 0 && (
            <span className="text-xs font-extrabold bg-sky-100 text-[#075985] px-2.5 py-1 rounded-full">
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
