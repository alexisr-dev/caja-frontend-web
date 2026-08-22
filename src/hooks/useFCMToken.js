import { useEffect } from 'react'
import { getToken } from 'firebase/messaging'
import { messagingPromise } from '../firebase'
import { registrarTokenFCM } from '../api/notificaciones'
import { env } from '../config/env'

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
    })

    return () => { vigente = false }
  }, [user])
}
