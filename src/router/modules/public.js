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

export default [
  {
    path: '/',
    name: 'home',
    component: HomePage,
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
  { path: '/login', component: LoginView },
  { path: '/signup', component: OnboardingView }, // 온보딩
  { path: '/signup/customer', component: CustomerSignupView }, // 고객 회원가입
  { path: '/signup/business', component: SignupView }, // 사업자 회원가입
  { path: '/chats', component: ChatList },
  { path: '/chats/new', component: ChatUserListView },
  { path: '/chats/:roomId', component: ChatRoomView, props: true },
  { path: '/customer', component: CustomerHomePage },
  { path: '/business', component: BusinessHomePage },
]
