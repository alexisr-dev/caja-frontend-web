import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordResetRequest, passwordResetConfirm } from '../api/auth'
import { toast } from 'react-toastify'

export default function PasswordResetPage() {
  const navigate = useNavigate()
  const [paso, setPaso] = useState('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorPassword, setErrorPassword] = useState('')

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await passwordResetRequest(email)
      toast.info('Si el email existe, recibirás un código')
      setPaso('codigo')
    } catch {
      toast.error('Error al solicitar código')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmar = async (e) => {
    e.preventDefault()
    if (nuevaPassword !== confirmar) return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    setErrorPassword('')
    try {
      await passwordResetConfirm(codigo, nuevaPassword)
      toast.success('Contraseña actualizada correctamente')
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      if (data?.nueva_password) {
        const msgs = Array.isArray(data.nueva_password) ? data.nueva_password : [data.nueva_password]
        setErrorPassword(msgs.join(' '))
      } else if (data?.detail) {
        toast.error(data.detail)
      } else if (data?.codigo) {
        const msgs = Array.isArray(data.codigo) ? data.codigo : [data.codigo]
        toast.error(msgs.join(' '))
      } else {
        toast.error('Código inválido o expirado')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h1 className="text-xl font-bold">Recuperar contraseña</h1>

        {paso === 'email' ? (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4">
            <p className="text-sm text-gray-600">Ingresa tu email para recibir un código de recuperación.</p>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmar} className="space-y-4">
            <p className="text-sm text-gray-600">Ingresa el código recibido y tu nueva contraseña.</p>
            <input
              type="text"
              placeholder="Código (6 dígitos)"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <div>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaPassword}
                onChange={e => { setNuevaPassword(e.target.value); setErrorPassword('') }}
                className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errorPassword ? 'border-red-400' : 'border-gray-300'}`}
                required
              />
              {errorPassword && (
                <p className="text-xs text-red-500 mt-1">{errorPassword}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, no puede ser completamente numérica ni una contraseña común.</p>
            </div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}

        <a href="/login" className="block text-sm text-gray-500 text-center hover:text-gray-700">
          ← Volver al login
        </a>
      </div>
    </div>
  )
}
