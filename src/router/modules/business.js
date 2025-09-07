import BusinessPartnershipPage from '@/pages/BusinessPartnershipPage.vue'
export default [
  {
    path: '/business',
    name: 'business',
    redirect: '/business/home'
  },
  {
    path: '/business/partnership',
    name: 'business-partnership',
    component: BusinessPartnershipPage,
  },
]
