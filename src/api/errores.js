const aTexto = (valor) =>
  Array.isArray(valor) ? valor.join(' ') : String(valor)

export function extraerCampos(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return {}

  const campos = data.campos ?? (data.detail ? null : data)
  if (!campos || typeof campos !== 'object') return {}

  return Object.fromEntries(
    Object.entries(campos).map(([campo, valor]) => [campo, aTexto(valor)]),
  )
}

export function mensajeError(error, porDefecto) {
  const data = error?.response?.data
  const campos = extraerCampos(error)
  const primerCampo = Object.values(campos)[0]
  if (primerCampo) return primerCampo

  if (data?.detail) return aTexto(data.detail)
  return porDefecto
}
