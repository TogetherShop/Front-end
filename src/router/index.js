import { createRouter, createWebHistory } from 'vue-router'
import publicRoutes from './modules/public'
import businessRoutes from './modules/business'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...publicRoutes, ...businessRoutes],
})

export default router
