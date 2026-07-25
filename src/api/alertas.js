import client from './client'

export const getAlertas = (params) =>
  client.get('/alertas/', { params }).then(r => r.data)

export const marcarAlertaLeida = (id) =>
  client.post(`/alertas/${id}/marcar-leida/`).then(r => r.data)

export const marcarTodasLeidas = () =>
  client.post('/alertas/marcar-todas/').then(r => r.data)
