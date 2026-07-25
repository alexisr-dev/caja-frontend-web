import client from './client'

export const login = (email, password) =>
  client.post('/auth/login/', { email, password }).then(r => r.data)

export const login2FA = (session_token, codigo) =>
  client.post('/auth/login-2fa/', { session_token, codigo }).then(r => r.data)

export const logout = () => {
  const refresh = localStorage.getItem('refresh_token')
  return client.post('/auth/logout/', { refresh })
}

export const getPerfil = () =>
  client.get('/auth/perfil/').then(r => r.data)

export const updatePerfil = (data) =>
  client.patch('/auth/perfil/', data).then(r => r.data)

export const passwordResetRequest = (email) =>
  client.post('/auth/password-reset-request/', { email })

export const passwordResetConfirm = (codigo, nuevaPassword) =>
  client.post('/auth/password-reset-confirm/', {
    codigo, nueva_password: nuevaPassword,
  })
