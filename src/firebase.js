import { initializeApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { env, firebaseConfigurado } from './config/env'


export const messagingPromise = firebaseConfigurado()
  ? isSupported().then(soportado => (soportado ? getMessaging(initializeApp(env.firebase)) : null))
  : Promise.resolve(null)
