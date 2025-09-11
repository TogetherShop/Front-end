import api from './api'

export async function signup({
  username,
  email,
  password,
  businessName,
  businessRegistrationNumber,
  businessType,
  businessCategory,
  collaborationCategory,
}) {
  const { data } = await api.post('/api/auth/signup', {
    username,
    email,
    password,
    businessName,
    businessRegistrationNumber,
    businessType,
    businessCategory,
    collaborationCategory,
  })
  return data
}

export async function login(username, password) {
  const { data } = await api.post('/api/auth/login', { username, password })
  localStorage.setItem('access_token', data.accessToken)
  localStorage.setItem('refresh_token', data.refreshToken)
  localStorage.setItem('username', username)
  localStorage.setItem('user_type', 'business')

  localStorage.setItem('businessId', String(data.businessId))
  return data
}

export function logout() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (refreshToken) {
    api.post('/api/auth/logout', { refreshToken }).catch(() => {})
  }
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
  localStorage.removeItem('user_type')
}
