import api from './api'

export const signup = async (payload) => {
  try {
    const response = await api.post('/api/customer/auth/signup', payload)
    return response.data
  } catch (err) {
    throw err.response?.data?.error || '회원가입에 실패했습니다.'
  }
}

export const customerLogin = async (username, password) => {
  try {
    const response = await api.post(
      '/api/customer/auth/login',
      { username, password },
      { userType: 'customer' },
    )
    localStorage.setItem('access_token', response.data.accessToken)
    localStorage.setItem('refresh_token', response.data.refreshToken)
    return response.data
  } catch (err) {
    throw err.response?.data?.error || '로그인 실패'
  }
}

export const refreshToken = async (refresh) => {
  try {
    const response = await api.post('/api/customer/auth/refresh', { refreshToken: refresh })
    localStorage.setItem('access_token', response.data.accessToken)
    if (response.data.refreshToken)
      localStorage.setItem('refresh_token', response.data.refreshToken)
    return response.data
  } catch (err) {
    throw err.response?.data?.error || '토큰 갱신 실패'
  }
}

export const logout = async (refresh) => {
  try {
    await api.post('/api/customer/auth/logout', { refreshToken: refresh })
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  } catch (err) {
    console.error(err)
  }
}
