import HomePage from '@/pages/HomePage.vue'
import CustomerSearchPage from '@/pages/CustomerSearchPage.vue'
import CustomerCouponPage from '@/pages/CustomerCouponPage.vue'
import CustomerProfilePage from '@/pages/CustomerProfilePage.vue'
import BusinessCouponPage from '@/pages/business/BusinessCouponPage.vue'
import BusinessGroupPurchasePage from '@/pages/BusinessGroupPurchasePage.vue'
import BusinessHomePage from '@/pages/business/BusinessHomePage.vue'
import BusinessProfilePage from '@/pages/business/BusinessProfilePage.vue'
import BusinessPartnershipPage from '@/pages/BusinessPartnershipPage.vue'
import BusinessCouponAnalysis from '@/pages/business/BusinessCouponAnalysis.vue'
import LoginView from '@/pages/LoginView.vue'
import OnboardingView from '@/pages/OnboardingView.vue'
import SignupView from '@/pages/SignupView.vue'
import CustomerSignupView from '@/pages/CustomerSignupView.vue'
import ChatList from '@/pages/ChatList.vue'
import ChatUserListView from '@/pages/ChatUserListView.vue'
import ChatRoomView from '@/pages/ChatRoomView.vue'
import CustomerHomePage from '@/pages/CustomerHomePage.vue'
import CustomerNotificationPage from '@/pages/CustomerNotificationPage.vue'
import BusinessNotificationPage from '@/pages/business/BusinessNotificationPage.vue'
import ChattingHomePage from '@/pages/ChattingHomePage.vue'
import StoreDetailPage from '@/pages/StoreDetailPage.vue'

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
    path: '/customer/notifications',
    component: CustomerNotificationPage,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/business',
    component: BusinessHomePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/chats',
    component: ChatList,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/chats/new',
    component: ChatUserListView,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/chats/:roomId',
    component: ChatRoomView,
    meta: { requiresAuth: true, role: 'business' },
    props: true,
  },
  {
    path: '/business/partnership',
    component: BusinessPartnershipPage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/home',
    name: 'business-home',
    component: BusinessHomePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/store',
    name: 'business-store',
    component: BusinessPartnershipPage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/coupon',
    name: 'business-coupon',
    component: BusinessCouponPage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/groupbuy',
    name: 'business-groupbuy',
    component: BusinessGroupPurchasePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/profile',
    name: 'business-profile',
    component: BusinessProfilePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/profile',
    name: 'business-profile',
    component: BusinessProfilePage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/coupon/analysis/:templateId',
    name: 'BusinessCouponAnalysis',
    component: BusinessCouponAnalysis,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/business/notifications',
    component: BusinessNotificationPage,
    meta: { requiresAuth: true, role: 'business' },
  },
  {
    path: '/store/:id',
    name: 'store-detail',
    component: StoreDetailPage,
    meta: { requiresAuth: true, role: 'customer' },
  },
]

export default routes
