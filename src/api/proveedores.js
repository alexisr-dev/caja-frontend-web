import { crearRecursoCrud } from './crudFactory'

// El backend identifica al proveedor por su PK numerica, no por el RUC.
export const proveedoresApi = crearRecursoCrud('/productos/proveedores')

export const getProveedores = proveedoresApi.list
export const getProveedor = proveedoresApi.retrieve
export const crearProveedor = proveedoresApi.create
export const actualizarProveedor = proveedoresApi.update
export const eliminarProveedor = proveedoresApi.remove
