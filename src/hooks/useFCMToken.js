import { useEffect } from 'react'
import { getToken } from 'firebase/messaging'
import { messagingPromise } from '../firebase'
import { registrarTokenFCM } from '../api/notificaciones'
import { env } from '../config/env'

/**
 * Registra el dispositivo para recibir notificaciones push.
 *
 * Todo el flujo es best-effort: si el usuario deniega el permiso, el navegador
 * no soporta FCM o falla el registro, la app sigue funcionando sin push.
 */
export function useFCMToken(user) {
  useEffect(() => {
    if (!user || !('Notification' in window)) return

    let vigente = true

    const registrar = async () => {
      const permiso = await Notification.requestPermission()
      if (!vigente || permiso !== 'granted') return

      const messaging = await messagingPromise
      if (!vigente || !messaging) return

      const token = await getToken(messaging, { vapidKey: env.firebase.vapidKey })
      if (vigente && token) await registrarTokenFCM(token)
    }

    registrar().catch(() => {
      // Silencioso a proposito: el push es opcional y su fallo no debe
      // ensuciar la consola de produccion ni interrumpir al vendedor.
    })

    return () => { vigente = false }
  }, [user])
}
