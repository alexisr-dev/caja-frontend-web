import axios from 'axios'
import { env } from '../config/env'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  limpiarSesion,
} from '../services/tokenStorage'

const client = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Refresco de token con cola ──────────────────────────────────────────────
// Si varias peticiones reciben 401 a la vez, solo la primera pide un token
// nuevo; las demas esperan en `pendientes` y se reintentan (o se rechazan)
// cuando ese unico refresco termina.

let refrescando = false
let pendientes = []

const resolverPendientes = (error, token) => {
  pendientes.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
      return
    }
    config.headers.Authorization = `Bearer ${token}`
    resolve(client(config))
  })
  pendientes = []
}

/** Cierra la sesion y devuelve al login cuando el refresh ya no es valido. */
const forzarRelogin = () => {
  limpiarSesion()
  window.location.href = '/login'
}

const renovarAccessToken = async () => {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No hay refresh token almacenado')

  // Se usa `axios` plano, no `client`: esta peticion no debe pasar por el
  // interceptor de respuesta y provocar un refresco recursivo.
  const { data } = await axios.post(`${env.apiUrl}/auth/refresh/`, { refresh })
  setAccessToken(data.access)
  return data.access
}

client.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config
    const esNoAutorizado = error.response?.status === 401

    if (!esNoAutorizado || !original || original._reintentada) {
      return Promise.reject(error)
    }

    // Ya hay un refresco en curso: encolar y reintentar cuando termine.
    if (refrescando) {
      return new Promise((resolve, reject) => {
        pendientes.push({ resolve, reject, config: { ...original, _reintentada: true } })
      })
    }

    original._reintentada = true
    refrescando = true
    try {
      const token = await renovarAccessToken()
      client.defaults.headers.Authorization = `Bearer ${token}`
      resolverPendientes(null, token)
      original.headers.Authorization = `Bearer ${token}`
      return client(original)
    } catch (errorRefresco) {
      resolverPendientes(errorRefresco)
      forzarRelogin()
      return Promise.reject(errorRefresco)
    } finally {
      refrescando = false
    }
  },
)

export default client
