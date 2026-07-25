import client from './client'

export const pagarEfectivo = (boletaId, montoRecibido) =>
  client.post('/pagos/efectivo/', {
    boleta_id: boletaId,
    monto_recibido: montoRecibido,
  }).then(r => r.data)

export const pagarMPTarjeta = (data) =>
  client.post('/pagos/mp-tarjeta/', data).then(r => r.data)

export const pagarMPYape = (data) =>
  client.post('/pagos/mp-yape/', data).then(r => r.data)

export const getPago = (boletaId) =>
  client.get(`/pagos/${boletaId}/`).then(r => r.data)
