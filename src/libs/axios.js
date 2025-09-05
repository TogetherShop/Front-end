import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const noAuthUrls = ['/api/auth/signup']

  if (!noAuthUrls.some((url) => config.url.includes(url))) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } else {
    delete config.headers.Authorization
  }

  return config
})

export default api
