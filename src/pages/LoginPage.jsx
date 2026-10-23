import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import DemoCredencialesPanel from '../components/auth/DemoCredencialesPanel'
import ScanIllustration from '../components/auth/ScanIllustration'
import { env } from '../config/env'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, verificar2FA } = useAuth()

  const [paso, setPaso] = useState('credenciales')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo2FA, setCodigo2FA] = useState('')
  const [sessionToken, setSessionToken] = useState(null)
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const r = await login(email, password)
      if (r.requiere2FA) {
        setSessionToken(r.sessionToken)
        setPaso('2fa')
        toast.info('Revisa tu email, te enviamos un código')
      } else {
        _redirigirPorRol(r.user)
      }
    } catch {
      toast.error('Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  const handleVerificar2FA = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const user = await verificar2FA(sessionToken, codigo2FA)
      _redirigirPorRol(user)
    } catch {
      toast.error('Código inválido o expirado')
    } finally {
      setCargando(false)
    }
  }

  const _redirigirPorRol = (user) => {
    if (user.rol === 'ADMIN') navigate('/admin')
    else if (user.rol === 'VENDEDOR') navigate('/caja')
    else toast.error('Los clientes deben usar la app móvil')
  }

  const usarCredencialesDemo = (mail, pass) => {
    setEmail(mail)
    setPassword(pass)
    toast.info('Credenciales cargadas, pulsa "Ingresar"')
  }

  const mostrarPanelDemo = env.demo.activo && paso === 'credenciales'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ground">

      <section className="lg:w-[420px] lg:shrink-0 bg-navy text-white px-8 py-8 lg:p-11 flex flex-col">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="w-10 h-10" />
          <h1 className="font-display text-[44px] font-black uppercase leading-none tracking-wide">Caja Smart</h1>
        </div>
        <p className="text-base text-white/75 mt-3">Sistema de caja registradora</p>

        <div className="hidden lg:flex flex-1 flex-col justify-end pt-8">
          <ScanIllustration />
        </div>
      </section>

      <section className="flex-1 min-w-0 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5">
          <div className="panel p-8 w-full max-w-sm lg:w-[380px] shrink-0">
            <div className="mb-6">
              <h2 className="font-display text-[40px] font-black uppercase leading-none tracking-wide">
                {paso === 'credenciales' ? 'Iniciar sesión' : 'Verificación 2FA'}
              </h2>
            </div>

            {paso === 'credenciales' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="field w-full h-12"
                  required
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  aria-label="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="field w-full h-12"
                  required
                />
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-extrabold hover:bg-primary-dark disabled:opacity-45 transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  {cargando ? 'Entrando...' : 'Ingresar'}
                </button>
                <a href="/password-reset" className="block text-sm font-bold text-primary text-center hover:underline">
                  Olvidé mi contraseña
                </a>
              </form>
            ) : (
              <form onSubmit={handleVerificar2FA} className="space-y-4">
                <p className="text-[15px] text-gray-600 leading-relaxed">
                  Ingresa el código de 6 dígitos enviado a <b>{email}</b>
                </p>
                <input
                  type="text"
                  placeholder="000000"
                  aria-label="Código de verificación"
                  value={codigo2FA}
                  onChange={e => setCodigo2FA(e.target.value)}
                  maxLength={6}
                  className="field w-full h-16 text-center font-display text-[40px] font-extrabold tracking-[0.35em] tabular-nums"
                  required
                />
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-extrabold hover:bg-primary-dark disabled:opacity-45 transition-[background-color,transform] duration-150 active:scale-[0.98]"
                >
                  {cargando ? 'Verificando...' : 'Verificar'}
                </button>
                <button
                  type="button"
                  onClick={() => { setPaso('credenciales'); setCodigo2FA('') }}
                  className="block w-full text-sm font-bold text-gray-500 text-center hover:text-gray-900"
                >
                  ← Volver
                </button>
              </form>
            )}
          </div>

          {mostrarPanelDemo && <DemoCredencialesPanel onUsar={usarCredencialesDemo} />}
        </div>
      </section>
    </div>
  )
}
