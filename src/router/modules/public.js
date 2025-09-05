import CustomerHomePage from '@/pages/CustomerHomePage.vue'
import CustomerSearchPage from '@/pages/CustomerSearchPage.vue'
import CustomerCouponPage from '@/pages/CustomerCouponPage.vue'
import CustomerProfilePage from '@/pages/CustomerProfilePage.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: CustomerHomePage,
  },
  {
    path: '/search',
    name: 'search',
    component: CustomerSearchPage,
  },
  {
    path: '/coupon',
    name: 'coupon',
    component: CustomerCouponPage,
  },
  {
    path: '/profile',
    name: 'profile',
    component: CustomerProfilePage,
  },
]
