import client from './client'

export const registrarTokenFCM = (token) =>
  client.post('/dispositivos-fcm/', {
    token_fcm: token,
    plataforma: 'WEB',
  }).then((r) => r.data)

export const getNotificaciones = (params) =>
  client.get('/notificaciones/', { params }).then((r) => r.data)

export const marcarLeida = (id) =>
  client.post(`/notificaciones/${id}/marcar-leida/`).then((r) => r.data)

export const marcarTodasLeidas = () =>
  client.post('/notificaciones/marcar-todas/').then((r) => r.data)
