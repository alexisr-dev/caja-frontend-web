import client from './client'

export const getDashboard = () =>
  client.get('/reportes/dashboard/').then(r => r.data)

export const getReporteVentas = (params) =>
  client.get('/reportes/ventas/', { params }).then(r => r.data)

export const getTopProductos = () =>
  client.get('/reportes/top-productos/').then(r => r.data)

export const getStockBajo = () =>
  client.get('/reportes/stock-bajo/').then(r => r.data)

export const getTasaIA = () =>
  client.get('/reportes/tasa-ia/').then(r => r.data)
