import BusinessPartnershipPage from '@/pages/BusinessPartnershipPage.vue'
import BusinessHomePage from '@/pages/BusinessHomePage.vue'

export default [
  {
    path: '/business',
    name: 'business',
    redirect: '/business/home'
  },
  {
    path: '/business/home',
    name: 'business-home',
    component: BusinessHomePage,
  },
  {
    path: '/business/partnership',
    name: 'business-partnership',
    component: BusinessPartnershipPage,
  },
]
