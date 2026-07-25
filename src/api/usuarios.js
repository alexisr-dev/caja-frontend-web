import { crearRecursoCrud } from './crudFactory'

// Antes las pantallas de admin llamaban a `client` directamente; se expone
// aqui para que toda la app hable con el backend por la misma capa.
export const usuariosApi = crearRecursoCrud('/auth/usuarios')

export const getUsuarios = usuariosApi.list
export const crearUsuario = usuariosApi.create
export const actualizarUsuario = usuariosApi.update
