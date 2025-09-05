import HomePage from '@/pages/HomePage.vue'
import SearchPage from '@/pages/SearchPage.vue'
import CouponPage from '@/pages/CouponPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
  },
  {
    path: '/coupon',
    name: 'coupon',
    component: CouponPage,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
  },
]
