import { crearRecursoCrud } from './crudFactory'

export const descuentosApi = crearRecursoCrud('/productos/descuentos')

export const getDescuentos = descuentosApi.list
export const crearDescuento = descuentosApi.create
export const actualizarDescuento = descuentosApi.update
export const eliminarDescuento = descuentosApi.remove
