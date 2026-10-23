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

  const btnCls = 'w-full h-[52px] bg-primary text-white rounded-xl text-base font-extrabold hover:bg-primary-dark disabled:opacity-45 transition-[background-color,transform] duration-150 active:scale-[0.98]'

  return (
    <div className="min-h-screen flex items-center justify-center bg-ground px-4">
      <div className="panel p-8 w-full max-w-md space-y-5">
        <h1 className="font-display text-[40px] font-black uppercase leading-none tracking-wide">Recuperar contraseña</h1>

        {paso === 'email' ? (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4">
            <p className="text-[15px] text-gray-600 leading-relaxed">Ingresa tu email para recibir un código de recuperación.</p>
            <input
              type="email"
              placeholder="tu@email.com"
              aria-label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="field w-full h-12"
              required
            />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmar} className="space-y-4">
            <p className="text-[15px] text-gray-600 leading-relaxed">Ingresa el código recibido y tu nueva contraseña.</p>
            <input
              type="text"
              placeholder="Código (6 dígitos)"
              aria-label="Código"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              maxLength={6}
              className="field w-full h-16 text-center font-display text-[36px] font-extrabold tracking-[0.3em] tabular-nums"
              required
            />
            <div>
              <input
                type="password"
                placeholder="Nueva contraseña"
                aria-label="Nueva contraseña"
                value={nuevaPassword}
                onChange={e => { setNuevaPassword(e.target.value); setErrorPassword('') }}
                className={`field w-full h-12 ${errorPassword ? 'field-error' : ''}`}
                required
              />
              {errorPassword && (
                <p className="text-[13px] font-bold text-err mt-1.5">{errorPassword}</p>
              )}
              <p className="text-[12.5px] text-gray-500 mt-1.5">Mínimo 8 caracteres, no puede ser completamente numérica ni una contraseña común.</p>
            </div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              aria-label="Confirmar contraseña"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              className="field w-full h-12"
              required
            />
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}

        <a href="/login" className="block text-sm font-bold text-gray-500 text-center hover:text-gray-900">
          ← Volver al login
        </a>
      </div>
    </div>
  )
}
