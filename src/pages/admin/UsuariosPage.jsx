import { useMemo, useState } from 'react'
import { Plus, Pencil, ChevronDown, UserX } from 'lucide-react'
import { usuariosApi } from '../../api/usuarios'
import { useRecursoCrud } from '../../hooks/useRecursoCrud'
import SlideOver from '../../components/common/SlideOver'
import StatCard from '../../components/common/StatCard'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import SearchInput from '../../components/common/SearchInput'
import EmptyState from '../../components/common/EmptyState'
import SkeletonRows from '../../components/common/SkeletonRows'
import IconButton from '../../components/common/IconButton'
import { formatFecha } from '../../utils/formatters'
import { ROLES } from '../../utils/constants'

const LISTA_ROLES = Object.values(ROLES)

const ROL_COLOR = {
  [ROLES.ADMIN]: 'bg-[#E1ECF5] text-navy',
  [ROLES.VENDEDOR]: 'bg-warn-bg text-warn',
  [ROLES.CLIENTE]: 'bg-sunk text-gray-600',
}

const OPCIONES_ROL = [
  { value: '', label: 'Todos los roles' },
  ...LISTA_ROLES.map(r => ({ value: r, label: r })),
]

const OPCIONES_ESTADO = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
]

const OPCIONES_ROL_FORM = LISTA_ROLES.map(r => ({ value: r, label: r }))

const FORM_CREAR_VACIO = {
  email: '', password: '', first_name: '', last_name: '',
  rol: ROLES.VENDEDOR, telefono: '', dni: '',
}

const FORM_EDITAR_VACIO = {
  email: '', first_name: '', last_name: '',
  rol: ROLES.VENDEDOR, telefono: '', dni: '', is_active: true,
}

const MENSAJES = {
  creado: 'Usuario creado correctamente',
  actualizado: 'Usuario actualizado',
  errorGuardar: 'Error al guardar usuario',
}

const iniciales = (u) =>
  `${(u.first_name?.[0] ?? '').toUpperCase()}${(u.last_name?.[0] ?? '').toUpperCase()}` || '?'

const COLUMNAS = [
  { label: 'Usuario', align: 'text-left' },
  { label: 'Rol', align: 'text-center' },
  { label: 'Estado', align: 'text-center' },
  { label: 'Registro', align: 'text-left' },
  { label: 'Acciones', align: 'text-center' },
]

export default function UsuariosPage() {
  const { items: usuarios, loading, saving, errores, setErrores, guardar } =
    useRecursoCrud(usuariosApi, { mensajes: MENSAJES })

  const [modal, setModal] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [formCrear, setFormCrear] = useState(FORM_CREAR_VACIO)
  const [formEditar, setFormEditar] = useState(FORM_EDITAR_VACIO)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarNuevaPassword, setConfirmarNuevaPassword] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  const abrirCrear = () => {
    setFormCrear(FORM_CREAR_VACIO)
    setConfirmPassword('')
    setErrores({})
    setModal('crear')
  }

  const abrirEditar = (usuario) => {
    setSeleccionado(usuario)
    setFormEditar({
      email: usuario.email,
      first_name: usuario.first_name,
      last_name: usuario.last_name,
      rol: usuario.rol,
      telefono: usuario.telefono ?? '',
      dni: usuario.dni ?? '',
      is_active: usuario.is_active,
    })
    setErrores({})
    setMostrarCambioPassword(false)
    setNuevaPassword('')
    setConfirmarNuevaPassword('')
    setModal('editar')
  }

  const setC = (campo) => (e) => setFormCrear(f => ({ ...f, [campo]: e.target.value }))
  const setE = (campo) => (e) => setFormEditar(f => ({ ...f, [campo]: e.target.value }))

  const handleCrear = async (e) => {
    e.preventDefault()
    if (formCrear.password !== confirmPassword) {
      setErrores({ password: 'Las contraseñas no coinciden' })
      return
    }
    if (await guardar(formCrear)) setModal(null)
  }

  const handleEditar = async (e) => {
    e.preventDefault()
    if (mostrarCambioPassword && nuevaPassword !== confirmarNuevaPassword) {
      setErrores({ nueva_password: 'Las contraseñas no coinciden' })
      return
    }
    const payload = { ...formEditar }
    if (mostrarCambioPassword && nuevaPassword) payload.password = nuevaPassword
    if (await guardar(payload, seleccionado.id)) setModal(null)
  }

  const kpis = useMemo(() => ({
    total: usuarios.length,
    activos: usuarios.filter(u => u.is_active).length,
    admins: usuarios.filter(u => u.rol === ROLES.ADMIN).length,
    vendedores: usuarios.filter(u => u.rol === ROLES.VENDEDOR).length,
  }), [usuarios])

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return usuarios.filter(u => {
      const coincideTexto = !q ||
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      const coincideRol = !filtroRol || u.rol === filtroRol
      const coincideEstado = !filtroEstado ||
        (filtroEstado === 'activo' ? u.is_active : !u.is_active)
      return coincideTexto && coincideRol && coincideEstado
    })
  }, [usuarios, busqueda, filtroRol, filtroEstado])

  const botonNuevo = (
    <Button variant="primary" size="lg" onClick={abrirCrear}>
      <Plus size={18} className="mr-1.5" /> Nuevo usuario
    </Button>
  )

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="text-[15px] text-gray-500 mt-2">Administra cuentas, roles y accesos</p>
        </div>
        {botonNuevo}
      </div>

      <div className="panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 overflow-hidden mb-6">
        <StatCard label="Total usuarios" value={kpis.total} />
        <StatCard label="Activos" value={kpis.activos} tone="success" />
        <StatCard label="Administradores" value={kpis.admins} />
        <StatCard label="Vendedores" value={kpis.vendedores} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre o email..."
          className="flex-1 min-w-[220px]"
        />
        <Select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} options={OPCIONES_ROL} />
        <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} options={OPCIONES_ESTADO} />
      </div>

      <p className="text-sm text-gray-500 mb-3">
        {loading
          ? 'Cargando…'
          : `${usuariosFiltrados.length} ${usuariosFiltrados.length === 1 ? 'usuario' : 'usuarios'}`}
      </p>

      {loading ? (
        <SkeletonRows avatar />
      ) : usuariosFiltrados.length === 0 ? (
        <EmptyState
          icon={UserX}
          titulo="No se encontraron usuarios"
          descripcion="Ajusta los filtros o crea un nuevo usuario."
          accion={botonNuevo}
        />
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLUMNAS.map(c => (
                  <th key={c.label} className={`th-cell ${c.align}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0 ${ROL_COLOR[usuario.rol] ?? 'bg-sunk text-gray-600'}`}>
                        {iniciales(usuario)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-extrabold text-gray-900 truncate">
                          {usuario.first_name} {usuario.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{usuario.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-extrabold ${ROL_COLOR[usuario.rol]}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-extrabold ${
                      usuario.is_active ? 'bg-ok-bg text-ok' : 'bg-err-bg text-err'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {usuario.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[13px] tabular-nums">
                    {formatFecha(usuario.fecha_registro)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <IconButton icon={Pencil} title="Editar" onClick={() => abrirEditar(usuario)} size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SlideOver
        open={modal === 'crear'}
        onClose={() => setModal(null)}
        title="Nuevo usuario"
        subtitle="Crea una cuenta y asigna su rol"
      >
        <form onSubmit={handleCrear} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={formCrear.first_name} onChange={setC('first_name')} error={errores.first_name} required />
            <Input label="Apellido" value={formCrear.last_name} onChange={setC('last_name')} error={errores.last_name} />
          </div>

          <Input label="Email" type="email" value={formCrear.email} onChange={setC('email')} error={errores.email} required />

          <Input label="Contraseña" type="password" value={formCrear.password} onChange={setC('password')} error={errores.password} placeholder="Mínimo 8 caracteres" required />

          <Input label="Confirmar contraseña" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" required />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Rol" value={formCrear.rol} onChange={setC('rol')} options={OPCIONES_ROL_FORM} />
            <Input label="Teléfono" value={formCrear.telefono} onChange={setC('telefono')} error={errores.telefono} placeholder="9XXXXXXXX" maxLength={9} />
          </div>

          <Input label="DNI" value={formCrear.dni} onChange={setC('dni')} error={errores.dni} placeholder="12345678" maxLength={8} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </SlideOver>

      <SlideOver
        open={modal === 'editar'}
        onClose={() => setModal(null)}
        title="Editar usuario"
        subtitle={seleccionado?.email}
      >
        <form onSubmit={handleEditar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={formEditar.first_name} onChange={setE('first_name')} error={errores.first_name} />
            <Input label="Apellido" value={formEditar.last_name} onChange={setE('last_name')} error={errores.last_name} />
          </div>

          <Input label="Email" type="email" value={formEditar.email} onChange={setE('email')} error={errores.email} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Teléfono" value={formEditar.telefono} onChange={setE('telefono')} error={errores.telefono} placeholder="9XXXXXXXX" maxLength={9} />
            <Input label="DNI" value={formEditar.dni} onChange={setE('dni')} error={errores.dni} placeholder="12345678" maxLength={8} />
          </div>

          <Select label="Rol" value={formEditar.rol} onChange={setE('rol')} options={OPCIONES_ROL_FORM} />

          <label className="flex items-center gap-2.5 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={formEditar.is_active}
              onChange={e => setFormEditar(f => ({ ...f, is_active: e.target.checked }))}
              className="w-[18px] h-[18px] rounded accent-[#0A4A78]"
            />
            Usuario activo
          </label>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMostrarCambioPassword(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Cambiar contraseña
              <ChevronDown size={16} className={`transition-transform duration-150 ${mostrarCambioPassword ? 'rotate-180' : ''}`} />
            </button>
            {mostrarCambioPassword && (
              <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-200">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                  error={errores.nueva_password}
                  placeholder="Mínimo 8 caracteres"
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmarNuevaPassword}
                  onChange={e => setConfirmarNuevaPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
