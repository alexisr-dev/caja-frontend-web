const STATUS_DETAIL_COMUN = {
  accredited: 'Pago aprobado',
  cc_rejected_bad_filled_other: 'Datos incorrectos',
  cc_rejected_card_disabled: 'Medio de pago desactivado',
  cc_rejected_card_error: 'Error al procesar el medio de pago',
  cc_rejected_duplicated_payment: 'Pago duplicado detectado',
  cc_rejected_max_attempts: 'Máximo de intentos alcanzado — espera unos minutos',
  cc_rejected_other_reason: 'Pago rechazado por el banco',
  pending_contingency: 'Pago en revisión — te notificaremos el resultado',
  pending_review_manual: 'Pago en revisión manual — puede tardar hasta 2 días',
  in_process: 'Pago en proceso',
}

const CODIGO_COMUN = {
  email_pagador_prohibido: 'Email del pagador no permitido por Mercado Pago',
  credenciales_invalidas: 'Credenciales de MP inválidas — contacta al administrador',
  timeout: 'Tiempo de espera agotado — intenta de nuevo',
  mp_server_error: 'Error en servidores de Mercado Pago — intenta en unos minutos',
  app_no_configurada: 'La app de MP no tiene Checkout API habilitado — contacta al administrador',
  pago_duplicado: 'Pago duplicado detectado',
  datos_invalidos: 'Datos de pago inválidos',
  gateway_no_disponible: 'Pasarela de pago no disponible — contacta al administrador',
}

export const MENSAJES_TARJETA = {
  statusDetail: {
    ...STATUS_DETAIL_COMUN,
    cc_rejected_insufficient_amount: 'Fondos insuficientes en la tarjeta',
    cc_rejected_bad_filled_security_code: 'CVV incorrecto',
    cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
    cc_rejected_bad_filled_other: 'Datos de tarjeta incorrectos',
    cc_rejected_call_for_authorize: 'Tarjeta requiere autorización — llama al banco',
    cc_rejected_card_disabled: 'Tarjeta desactivada',
    cc_rejected_card_error: 'Error al procesar la tarjeta',
  },
  codigo: {
    ...CODIGO_COMUN,
    token_invalido: 'Datos de tarjeta inválidos — vuelve a ingresarlos',
  },
  rechazoPorDefecto: 'Pago rechazado',
  errorPorDefecto: 'Error procesando pago',
}

export const MENSAJES_YAPE = {
  statusDetail: {
    ...STATUS_DETAIL_COMUN,
    cc_rejected_insufficient_amount: 'Fondos insuficientes en Yape',
    cc_rejected_bad_filled_security_code: 'OTP incorrecto',
    cc_rejected_call_for_authorize: 'Pago no autorizado — consulta con tu banco',
    cc_rejected_card_disabled: 'Cuenta Yape desactivada',
    cc_rejected_card_type_not_allowed: 'Tipo de cuenta no permitido',
    cc_rejected_other_reason: 'Pago rechazado',
    cc_rejected_form_error: 'Error en los datos ingresados',
    pending_contingency: 'Pago en revisión — recibirás confirmación',
    pending_review_manual: 'Pago en revisión manual',
  },
  codigo: {
    ...CODIGO_COMUN,
    token_invalido: 'Celular u OTP incorrectos',
    pago_rechazado: 'Pago rechazado por Mercado Pago',
  },
  rechazoPorDefecto: 'Pago Yape rechazado',
  errorPorDefecto: 'Error procesando pago Yape',
}

export function extraerErrorDRF(data) {
  if (!data || typeof data !== 'object') return null
  for (const [campo, valor] of Object.entries(data)) {
    if (Array.isArray(valor) && valor.length > 0) return `${campo}: ${valor[0]}`
    if (typeof valor === 'string') return `${campo}: ${valor}`
  }
  return null
}

export function resolverErrorPago(error, mensajes) {
  const estado = error?.response?.status
  const data = error?.response?.data

  if (estado === 429) {
    return 'Demasiados intentos — espera un minuto antes de volver a intentar'
  }

  const porDefecto = estado === 402 ? mensajes.rechazoPorDefecto : mensajes.errorPorDefecto

  return (
    mensajes.codigo[data?.codigo] ??
    mensajes.statusDetail[data?.status_detail] ??
    mensajes.statusDetail[data?.error_code] ??
    data?.detail ??
    extraerErrorDRF(data) ??
    error?.message ??
    porDefecto
  )
}

export function mensajePagoEnProceso(data, mensajes) {
  return (
    mensajes.statusDetail[data?.status_detail] ??
    'Pago en proceso — se confirmará automáticamente'
  )
}
