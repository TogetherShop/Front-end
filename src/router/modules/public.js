import HomePage from '@/pages/HomePage.vue'
import CustomerSearchPage from '@/pages/CustomerSearchPage.vue'
import CustomerCouponPage from '@/pages/CustomerCouponPage.vue'
import CustomerProfilePage from '@/pages/CustomerProfilePage.vue'
import LoginView from '@/pages/LoginView.vue'
import OnboardingView from '@/pages/OnboardingView.vue'
import SignupView from '@/pages/SignupView.vue'
import CustomerSignupView from '@/pages/CustomerSignupView.vue'
import ChatList from '@/pages/ChatList.vue'
import ChatUserListView from '@/pages/ChatUserListView.vue'
import ChatRoomView from '@/pages/ChatRoomView.vue'
import CustomerHomePage from '@/pages/CustomerHomePage.vue'
import BusinessHomePage from '@/pages/BusinessHomePage.vue'
import ChattingHomePage from '@/pages/ChattingHomePage.vue'

const routes = [
  // 인증 필요 ❌
  { path: '/login', component: LoginView },
  { path: '/signup', component: OnboardingView },
  { path: '/signup/customer', component: CustomerSignupView },
  { path: '/signup/business', component: SignupView },

  // 인증 필요 ⭕
  { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  {
    path: '/customer',
    component: CustomerHomePage,
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
]

export default routes
