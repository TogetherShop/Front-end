import CustomerHomePage from '@/pages/CustomerHomePage.vue'
import CustomerSearchPage from '@/pages/CustomerSearchPage.vue'
import CustomerCouponPage from '@/pages/CustomerCouponPage.vue'
import CustomerProfilePage from '@/pages/CustomerProfilePage.vue'
import BusinessCouponPage from '@/pages/business/BusinessCouponPage.vue'
import BusinessGroupBuyPage from '@/pages/business/BusinessGroupBuyPage.vue'
import BusinessHomePage from '@/pages/business/BusinessHomePage.vue'
import BusinessProfilePage from '@/pages/business/BusinessProfilePage.vue'
import BusinessStorePage from '@/pages/business/BusinessStorePage.vue'

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
  {
    path: '/business',
    name: 'business-home',
    component: BusinessHomePage,
  },
  {
    path: '/business/store',
    name: 'business-store',
    component: BusinessStorePage,
  },
  {
    path: '/business/coupon',
    name: 'business-coupon',
    component: BusinessCouponPage,
  },
  {
    path: '/business/groupbuy',
    name: 'business-groupbuy',
    component: BusinessGroupBuyPage,
  },
  {
    path: '/business/profile',
    name: 'business-profile',
    component: BusinessProfilePage,
  },
]
