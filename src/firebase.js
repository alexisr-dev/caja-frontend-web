import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { env, firebaseConfigurado } from './config/env'

/**
 * Mensajeria push.
 *
 * `messagingPromise` resuelve a `null` (en vez de lanzar) cuando el push no
 * esta disponible: navegador sin soporte de service workers, contexto sin
 * HTTPS, o proyecto Firebase todavia sin configurar. Los consumidores solo
 * tienen que comprobar ese null.
 */
export const messagingPromise = firebaseConfigurado()
  ? isSupported().then(soportado => (soportado ? getMessaging(initializeApp(env.firebase)) : null))
  : Promise.resolve(null)
