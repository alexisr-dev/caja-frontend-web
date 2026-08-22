const leer = (clave, porDefecto = '') => import.meta.env[clave] ?? porDefecto

export const env = {
  apiUrl: leer('VITE_API_URL', '/api'),

  mercadoPago: {
    publicKey: leer('VITE_MP_PUBLIC_KEY'),
    get esSandbox() {
      return this.publicKey.startsWith('TEST-')
    },
  },

  demo: {
    activo: leer('VITE_DEMO_MODE') === 'true',
    admin: {
      email: leer('VITE_DEMO_ADMIN_EMAIL', 'demo.admin@cajasmart.dev'),
      password: leer('VITE_DEMO_ADMIN_PASSWORD', 'DemoAdmin2025!'),
    },
    vendedor: {
      email: leer('VITE_DEMO_VENDEDOR_EMAIL', 'demo.vendedor@cajasmart.dev'),
      password: leer('VITE_DEMO_VENDEDOR_PASSWORD', 'DemoVendedor2025!'),
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

export const firebaseConfigurado = () =>
  Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.messagingSenderId)
