import client from './client'

export const getTurnoActivo = () =>
  client.get('/turnos/activo/').then(r => r.data || null)

export const getTurnos = (params) =>
  client.get('/turnos/', { params }).then(r => r.data)

export const getTurno = (id) =>
  client.get(`/turnos/${id}/`).then(r => r.data)

export const abrirTurno = (montoInicial) =>
  client.post('/turnos/abrir/', { monto_inicial: montoInicial }).then(r => r.data)

export const cerrarTurno = (montoContado, observaciones = '') =>
  client.post('/turnos/cerrar/', {
    monto_contado_cierre: montoContado,
    observaciones,
  }).then(r => r.data)
