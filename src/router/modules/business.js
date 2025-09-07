import BusinessHomePage from '@/pages/BusinessHomePage.vue'
import BusinessPartnershipPage from '@/pages/BusinessPartnershipPage.vue'
export default [
  {
    path: '/business/home',
    name: 'business',
    component: BusinessHomePage,
  },
  {
    path: '/business/partnership',
    name: 'business-partnership',
    component: BusinessPartnershipPage,
  },
]
