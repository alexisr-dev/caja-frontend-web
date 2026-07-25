import client from './client'

/**
 * Factory de clientes REST.
 *
 * Categorias, proveedores y descuentos exponen exactamente el mismo contrato
 * (`list / retrieve / create / update / remove` sobre una ruta base). En lugar
 * de repetir las cinco funciones en cada modulo, se generan desde aqui.
 *
 * @param {string} rutaBase  Ruta del recurso, p. ej. '/productos/categorias'.
 * @returns {{list, retrieve, create, update, remove}} Cliente del recurso.
 */
export function crearRecursoCrud(rutaBase) {
  const base = rutaBase.replace(/\/$/, '')
  const detalle = (id) => `${base}/${id}/`

  return {
    list: (params) => client.get(`${base}/`, { params }).then(r => r.data),
    retrieve: (id) => client.get(detalle(id)).then(r => r.data),
    create: (data) => client.post(`${base}/`, data).then(r => r.data),
    update: (id, data) => client.patch(detalle(id), data).then(r => r.data),
    remove: (id) => client.delete(detalle(id)),
  }
}

/**
 * Normaliza la respuesta de una lista: el backend pagina por defecto
 * (`{ results: [...] }`) pero algunos endpoints devuelven el array directo.
 */
export const extraerLista = (data) => {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}
