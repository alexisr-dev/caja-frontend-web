import client from './client'

// El modo (CAJA/MOVIL) lo deriva el backend del rol del usuario: no se envia.
export const escanearProducto = (imagenBlob) => {
  const fd = new FormData()
  fd.append('imagen', imagenBlob, 'frame.jpg')
  return client.post('/escanear/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const registroVisual = (sku, imagenBlob, sufijo = 'principal') => {
  const fd = new FormData()
  fd.append('sku', sku)
  fd.append('sufijo', sufijo)
  fd.append('imagen', imagenBlob, 'foto.jpg')
  return client.post('/registro-visual/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getLogsEscaneo = (params) =>
  client.get('/logs-escaneos/', { params }).then(r => r.data)

export const getIAHealth = () =>
  client.get('/ia/health/').then(r => r.data)
