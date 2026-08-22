import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import DemoCredencialesPanel from '../components/auth/DemoCredencialesPanel'
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-4xl px-4 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm lg:w-96 shrink-0">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Caja Smart</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de caja registradora</p>
          </div>

          {paso === 'credenciales' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-xl font-semibold">Iniciar sesión</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {cargando ? 'Entrando...' : 'Ingresar'}
              </button>
              <a href="/password-reset" className="block text-sm text-primary text-center hover:underline">
                Olvidé mi contraseña
              </a>
            </form>
          ) : (
            <form onSubmit={handleVerificar2FA} className="space-y-4">
              <h2 className="text-xl font-semibold">Verificación 2FA</h2>
              <p className="text-sm text-gray-600">
                Ingresa el código de 6 dígitos enviado a <b>{email}</b>
              </p>
              <input
                type="text"
                placeholder="000000"
                value={codigo2FA}
                onChange={e => setCodigo2FA(e.target.value)}
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
              >
                {cargando ? 'Verificando...' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => { setPaso('credenciales'); setCodigo2FA('') }}
                className="block w-full text-sm text-gray-500 text-center hover:text-gray-700"
              >
                ← Volver
              </button>
            </form>
          )}
        </div>

        {mostrarPanelDemo && <DemoCredencialesPanel onUsar={usarCredencialesDemo} />}
      </div>
    </div>
  )
}
