import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as turnosApi from '../api/turnos'
import { ROLES_CAJA } from '../utils/constants'
import { useAuth } from './AuthContext'

const TurnoContext = createContext(null)

/**
 * Turno de caja abierto por el usuario actual.
 *
 * El backend responde 404 cuando no hay turno activo, asi que ese caso se
 * traduce a `turno = null` en lugar de propagarse como error.
 */
export function TurnoProvider({ children }) {
  const { user } = useAuth()
  const [turno, setTurno] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Solo vendedores y admins tienen turnos: para el resto no se consulta.
    if (!user || !ROLES_CAJA.includes(user.rol)) {
      setTurno(null)
      setLoading(false)
      return
    }

    let vigente = true
    setLoading(true)
    turnosApi.getTurnoActivo()
      .then(data => { if (vigente) setTurno(data) })
      .catch(() => { if (vigente) setTurno(null) })
      .finally(() => { if (vigente) setLoading(false) })

    return () => { vigente = false }
  }, [user])

  const abrirTurno = useCallback(async (montoInicial) => {
    const data = await turnosApi.abrirTurno(montoInicial)
    setTurno(data)
    return data
  }, [])

  const cerrarTurno = useCallback(async (montoContado, observaciones = '') => {
    const data = await turnosApi.cerrarTurno(montoContado, observaciones)
    setTurno(null)
    return data
  }, [])

  const valor = useMemo(
    () => ({ turno, loading, abrirTurno, cerrarTurno }),
    [turno, loading, abrirTurno, cerrarTurno],
  )

  return <TurnoContext.Provider value={valor}>{children}</TurnoContext.Provider>
}

export const useTurno = () => useContext(TurnoContext)
