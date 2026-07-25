import client from './client'

export const getTurnoActivo = () =>
  client.get('/turnos/activo/').then(r => r.data)

export const getTurnos = (params) =>
  client.get('/turnos/', { params }).then(r => r.data)

export const getTurno = (id) =>
  client.get(`/turnos/${id}/`).then(r => r.data)

export const abrirTurno = (montoInicial) =>
  client.post('/turnos/abrir/', { monto_inicial: montoInicial }).then(r => r.data)

// El backend cierra el turno abierto del usuario autenticado: no recibe id en la URL.
export const cerrarTurno = (montoContado, observaciones = '') =>
  client.post('/turnos/cerrar/', {
    monto_contado_cierre: montoContado,
    observaciones,
  }).then(r => r.data)
