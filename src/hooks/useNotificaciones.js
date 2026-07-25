import { useEffect } from 'react'
import { onMessage } from 'firebase/messaging'
import { toast } from 'react-toastify'
import { messagingPromise } from '../firebase'

export function useNotificaciones() {
  useEffect(() => {
    let unsubscribe = null

    messagingPromise.then((messaging) => {
      if (!messaging) return
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'Nueva notificación'
        const body = payload.notification?.body ?? ''
        toast.info(`${title}${body ? `: ${body}` : ''}`, { autoClose: 6000 })
      })
    })

    return () => { if (unsubscribe) unsubscribe() }
  }, [])
}
