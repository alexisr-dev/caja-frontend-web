import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { TurnoProvider } from './context/TurnoContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TurnoProvider>
          <CartProvider>
            <App />
            <ToastContainer position="top-right" autoClose={3000} />
          </CartProvider>
        </TurnoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
