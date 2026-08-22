import client from './client'

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

export const extraerLista = (data) => {
  if (Array.isArray(data)) return data
  return data?.results ?? []
}
