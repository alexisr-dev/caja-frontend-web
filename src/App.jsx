import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import CajaLayout from './components/layout/CajaLayout'

import LoginPage from './pages/LoginPage'
import PasswordResetPage from './pages/PasswordResetPage'

import DashboardPage from './pages/admin/DashboardPage'
import ProductosPage from './pages/admin/ProductosPage'
import RegistroVisualPage from './pages/admin/RegistroVisualPage'
import CategoriasPage from './pages/admin/CategoriasPage'
import ProveedoresPage from './pages/admin/ProveedoresPage'
import DescuentosPage from './pages/admin/DescuentosPage'
import UsuariosPage from './pages/admin/UsuariosPage'
import BoletasPage from './pages/admin/BoletasPage'
import TurnosPage from './pages/admin/TurnosPage'
import ReportesPage from './pages/admin/ReportesPage'
import AlertasPage from './pages/admin/AlertasPage'
import LogsEscaneoPage from './pages/admin/LogsEscaneoPage'

import AbrirTurnoPage from './pages/vendedor/AbrirTurnoPage'
import CajaPage from './pages/vendedor/CajaPage'
import HistorialBoletasPage from './pages/vendedor/HistorialBoletasPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />

      <Route path="/admin" element={
        <ProtectedRoute rolesPermitidos={['ADMIN']}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="registro-ia" element={<RegistroVisualPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route path="descuentos" element={<DescuentosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="boletas" element={<BoletasPage />} />
        <Route path="turnos" element={<TurnosPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="alertas" element={<AlertasPage />} />
        <Route path="logs-ia" element={<LogsEscaneoPage />} />
      </Route>

      <Route path="/caja" element={
        <ProtectedRoute rolesPermitidos={['VENDEDOR', 'ADMIN']}><CajaLayout /></ProtectedRoute>
      }>
        <Route index element={<CajaPage />} />
        <Route path="abrir-turno" element={<AbrirTurnoPage />} />
        <Route path="historial" element={<HistorialBoletasPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
