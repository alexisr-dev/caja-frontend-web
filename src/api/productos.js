import client from './client'

export const getProductos = (params) =>
  client.get('/productos/', { params }).then(r => r.data)

export const getProducto = (sku) =>
  client.get(`/productos/${sku}/`).then(r => r.data)

export const crearProducto = (data) =>
  client.post('/productos/', data).then(r => r.data)

export const actualizarProducto = (sku, data) =>
  client.patch(`/productos/${sku}/`, data).then(r => r.data)

export const eliminarProducto = (sku) =>
  client.delete(`/productos/${sku}/`)

export const getHistorialPrecios = (sku) =>
  client.get(`/productos/${sku}/historial-precios/`).then(r => r.data)

export const ajustarStock = (sku, data) =>
  client.post(`/productos/${sku}/ajuste-stock/`, data).then(r => r.data)

export const agregarFoto = (sku, formData) =>
  client.post(`/productos/${sku}/fotos/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const eliminarFoto = (id) =>
  client.delete(`/productos/fotos/${id}/`)
