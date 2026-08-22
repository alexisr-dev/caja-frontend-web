import { crearRecursoCrud } from './crudFactory'

export const proveedoresApi = crearRecursoCrud('/productos/proveedores')

export const getProveedores = proveedoresApi.list
export const getProveedor = proveedoresApi.retrieve
export const crearProveedor = proveedoresApi.create
export const actualizarProveedor = proveedoresApi.update
export const eliminarProveedor = proveedoresApi.remove
