<template>
  <nav class="bottom-navigation fixed-bottom bg-white border-top">
    <div class="container-fluid px-0">
      <div class="row g-0">
        <div 
          v-for="item in navigationItems" 
          :key="item.name"
          class="bottom-navigation__item col-3 d-flex flex-column align-items-center justify-content-center py-2"
          :class="{ 'bottom-navigation__item--active': currentRoute === item.route }"
          @click="navigateTo(item.route)"
        >
          <div class="bottom-navigation__icon mb-1">
            <i class="material-symbols-outlined" :class="item.iconClass">{{ item.icon }}</i>
          </div>
          <span class="bottom-navigation__label small" :class="item.textClass">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'BottomNavigation',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const navigationItems = [
      {
        name: '홈',
        icon: 'home',
        route: '/',
        iconClass: 'text-muted',
        textClass: 'text-muted'
      },
      {
        name: '매장찾기',
        icon: 'search',
        route: '/search',
        iconClass: 'text-muted',
        textClass: 'text-muted'
      },
      {
        name: '쿠폰',
        icon: 'redeem',
        route: '/coupon',
        iconClass: 'text-primary',
        textClass: 'text-primary'
      },
      {
        name: '내정보',
        icon: 'person_outline',
        route: '/profile',
        iconClass: 'text-muted',
        textClass: 'text-muted'
      }
    ]
    
    const currentRoute = computed(() => route.path)
    
    const navigateTo = (routePath) => {
      if (routePath !== route.path) {
        router.push(routePath)
      }
    }
    
    return {
      navigationItems,
      currentRoute,
      navigateTo
    }
  }
}
</script>

<style>
@import '../styles/bottom-navigation.css';
</style>
