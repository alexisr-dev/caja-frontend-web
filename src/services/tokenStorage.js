import { STORAGE_KEYS } from '../utils/constants'

export const getAccessToken = () => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

export const getRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

export const setAccessToken = (token) =>
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

export const getUsuario = () => {
  const crudo = localStorage.getItem(STORAGE_KEYS.USER)
  if (!crudo) return null
  try {
    return JSON.parse(crudo)
  } catch {
    localStorage.removeItem(STORAGE_KEYS.USER)
    return null
  }
}

export const guardarSesion = ({ access, refresh, user }) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export const limpiarSesion = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}
