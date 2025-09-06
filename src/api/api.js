import axios from 'axios'
import router from '@/router'
import { jwtDecode } from 'jwt-decode'

const api = axios.create({
  baseURL: '/', // Vite proxy 사용
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

// 토큰 만료 여부 체크
function isTokenExpired(token) {
  if (!token) return true
  const decoded = jwtDecode(token)
  return decoded.exp * 1000 < Date.now()
}

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return Promise.reject(err)

    // access token 만료 또는 401
    if (
      (err.response?.status === 401 || isTokenExpired(localStorage.getItem('access_token'))) &&
      !originalRequest._retry
    ) {
      // 사용자 유형: originalRequest.userType에 'customer' 또는 'business' 지정
      const userType = originalRequest.userType || 'business'
      const refreshUrl =
        userType === 'customer' ? '/api/customer/auth/refresh' : '/api/auth/refresh'

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post(refreshUrl, { refreshToken })
        const newAccess = data.accessToken
        const newRefresh = data.refreshToken

        localStorage.setItem('access_token', newAccess)
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh)

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        onRefreshed(newAccess)
        return api(originalRequest)
      } catch (e) {
        // refresh 실패 → 로그아웃
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/login')
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  },
)

export default api
