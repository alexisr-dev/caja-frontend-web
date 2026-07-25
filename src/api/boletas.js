import client from './client'

export const getBoletas = (params) =>
  client.get('/boletas/', { params }).then(r => r.data)

export const getBoleta = (id) =>
  client.get(`/boletas/${id}/`).then(r => r.data)

export const crearBoleta = (data) =>
  client.post('/boletas/', data).then(r => r.data)

export const cancelarBoleta = (id) =>
  client.post(`/boletas/${id}/cancelar/`).then(r => r.data)

export const anularBoleta = (id, motivo) =>
  client.post(`/boletas/${id}/anular/`, { motivo }).then(r => r.data)

export const getMisBoletas = (params) =>
  client.get('/mis-boletas/', { params }).then(r => r.data)
