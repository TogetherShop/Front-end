import HomePage from '@/pages/HomePage.vue'
import CouponPage from '@/pages/CouponPage.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/coupon',
    name: 'coupon',
    component: CouponPage,
  },
]
