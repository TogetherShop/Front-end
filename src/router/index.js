import { createRouter, createWebHistory } from 'vue-router'
import routes from './modules/public'
import { jwtDecode } from 'jwt-decode'

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

  if (to.meta.requiresAuth && !accessToken) {
    return next('/login')
  }

  if (to.meta.role && to.meta.role !== userType) {
    // 권한 없는 페이지 접근 시 홈으로 리다이렉트
    return next(userType === 'customer' ? '/customer' : '/business')
  }

  next()
})

export default router
