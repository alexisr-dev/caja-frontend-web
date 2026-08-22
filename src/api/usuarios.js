import { crearRecursoCrud } from './crudFactory'

export const usuariosApi = crearRecursoCrud('/auth/usuarios')

export const getUsuarios = usuariosApi.list
export const crearUsuario = usuariosApi.create
export const actualizarUsuario = usuariosApi.update
