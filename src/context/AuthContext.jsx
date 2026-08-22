import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as authApi from '../api/auth'
import { guardarSesion, limpiarSesion, getUsuario } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(getUsuario())
    setLoading(false)
  }, [])

  const aplicarSesion = useCallback((data) => {
    guardarSesion(data)
    setUser(data.user)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    if (data.requiere_2fa) {
      return { requiere2FA: true, sessionToken: data.session_token }
    }
    aplicarSesion(data)
    return { requiere2FA: false, user: data.user }
  }, [aplicarSesion])

  const verificar2FA = useCallback(async (sessionToken, codigo) => {
    const data = await authApi.login2FA(sessionToken, codigo)
    aplicarSesion(data)
    return data.user
  }, [aplicarSesion])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    limpiarSesion()
    setUser(null)
  }, [])

  const valor = useMemo(
    () => ({ user, loading, login, verificar2FA, logout }),
    [user, loading, login, verificar2FA, logout],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
