import BusinessHomePage from '@/pages/BusinessHomePage.vue'
import BusinessPartnershipPage from '@/pages/BusinessPartnershipPage.vue'
import BusinessHomePage from '@/pages/BusinessHomePage.vue'
import BusinessGroupPurchasePage from '@/pages/BusinessGroupPurchasePage.vue'

export default [
  {
    path: '/business/home',
    name: 'business',
    component: BusinessHomePage,
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
  {
    path: '/business/group-purchase',
    name: 'business-group-purchase',
    component: BusinessGroupPurchasePage,
  },
]
