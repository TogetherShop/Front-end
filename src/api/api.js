import axios from 'axios'

const token = localStorage.getItem('access_token')
const api = axios.create({
  baseURL: '/', // Vite proxy 사용
  withCredentials: true,
  headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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

// 요청 인터셉터
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('access_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return Promise.reject(err)

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
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  },
)

export default api
