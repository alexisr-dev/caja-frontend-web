import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Backend Django local; en produccion se sirve todo tras el mismo dominio. */
const BACKEND_LOCAL = 'http://localhost:8000'

const proxyBackend = { target: BACKEND_LOCAL, changeOrigin: true }

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': proxyBackend,
      '/media': proxyBackend,
    },
  },

  build: {
    // Sin sourcemaps en el bundle publicado: no exponen el codigo original.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Separar las dependencias pesadas de nuestro codigo permite que el
        // navegador las cachee entre despliegues: al publicar un cambio de la
        // app, el usuario no vuelve a descargar React, Firebase ni Recharts.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-firebase': ['firebase/app', 'firebase/messaging'],
          'vendor-pagos': ['@mercadopago/sdk-react'],
        },
      },
    },
  },
})
