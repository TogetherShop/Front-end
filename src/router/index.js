import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

import publicRoutes from './modules/public'

const routes = publicRoutes

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// access token 만료 체크
function isTokenExpired(token) {
  if (!token) return true
  const decoded = jwtDecode(token)
  return decoded.exp * 1000 < Date.now()
}

router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('access_token')
  const userType = localStorage.getItem('user_type') // 'customer' or 'business'

  // 인증 필요 페이지 접근 시
  if (to.meta.requiresAuth) {
    // 토큰 없거나 만료된 경우 로그인으로
    if (!accessToken || isTokenExpired(accessToken)) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_type')
      return next('/login')
    }

    // 권한(role) 체크
    if (to.meta.role && to.meta.role !== userType) {
      return next(userType === 'customer' ? '/customer' : '/business')
    }
  }

  next()
})

export default router
