import { crearRecursoCrud } from './crudFactory'

export const categoriasApi = crearRecursoCrud('/productos/categorias')

export const getCategorias = categoriasApi.list
export const crearCategoria = categoriasApi.create
export const actualizarCategoria = categoriasApi.update
export const eliminarCategoria = categoriasApi.remove
