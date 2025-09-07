import HomePage from '@/pages/HomePage.vue'
import CustomerSearchPage from '@/pages/CustomerSearchPage.vue'
import CustomerCouponPage from '@/pages/CustomerCouponPage.vue'
import CustomerProfilePage from '@/pages/CustomerProfilePage.vue'
import BusinessCouponPage from '@/pages/business/BusinessCouponPage.vue'
import BusinessGroupBuyPage from '@/pages/business/BusinessGroupBuyPage.vue'
import BusinessHomePage from '@/pages/business/BusinessHomePage.vue'
import BusinessProfilePage from '@/pages/business/BusinessProfilePage.vue'
import BusinessStorePage from '@/pages/business/BusinessStorePage.vue'
import BusinessCouponAnalysis from '@/pages/business/BusinessCouponAnalysis.vue'
import LoginView from '@/pages/LoginView.vue'
import OnboardingView from '@/pages/OnboardingView.vue'
import SignupView from '@/pages/SignupView.vue'
import CustomerSignupView from '@/pages/CustomerSignupView.vue'
import ChatList from '@/pages/ChatList.vue'
import ChatUserListView from '@/pages/ChatUserListView.vue'
import ChatRoomView from '@/pages/ChatRoomView.vue'
import CustomerHomePage from '@/pages/CustomerHomePage.vue'
import ChattingHomePage from '@/pages/ChattingHomePage.vue'

const routes = [
  // 인증 필요 ❌
  { path: '/login', component: LoginView },
  { path: '/signup', component: OnboardingView },
  { path: '/signup/customer', component: CustomerSignupView },
  { path: '/signup/business', component: SignupView },
  { path: '/', name: 'home', component: HomePage },

  // 인증 필요 ⭕
  {
    path: '/customer',
    component: CustomerHomePage,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/customer/search',
    component: CustomerSearchPage,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/customer/coupon',
    component: CustomerCouponPage,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/customer/profile',
    component: CustomerProfilePage,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/business',
    component: BusinessHomePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/chats',
    component: ChattingHomePage,
    meta: { requiresAuth: true, role: 'business' },
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
  {
    path: '/business/profile',
    name: 'business-profile',
    component: BusinessProfilePage,
  },
  {
    path: '/business/coupon/analysis',
    name: 'BusinessCouponAnalysis',
    component: BusinessCouponAnalysis,
  },
]

export default routes
