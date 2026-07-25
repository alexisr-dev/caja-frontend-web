/**
 * Unico punto de lectura de `import.meta.env`.
 *
 * Centralizarlo evita que el nombre de una variable quede escrito a mano en
 * media docena de modulos y permite validar en el arranque que la config
 * minima existe, en lugar de fallar con un 404 opaco en tiempo de ejecucion.
 */

const leer = (clave, porDefecto = '') => import.meta.env[clave] ?? porDefecto

export const env = {
  apiUrl: leer('VITE_API_URL', '/api'),

  mercadoPago: {
    publicKey: leer('VITE_MP_PUBLIC_KEY'),
    get esSandbox() {
      return this.publicKey.startsWith('TEST-')
    },
  },

  firebase: {
    apiKey: leer('VITE_FIREBASE_API_KEY'),
    authDomain: leer('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: leer('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: leer('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: leer('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: leer('VITE_FIREBASE_APP_ID'),
    vapidKey: leer('VITE_FIREBASE_VAPID_KEY'),
  },

  esProduccion: import.meta.env.PROD,
}

/** true si la config de Firebase esta completa (si no, se omite el push). */
export const firebaseConfigurado = () =>
  Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.messagingSenderId)
