<template>
  <nav class="business-bottom-navigation fixed-bottom bg-white border-top">
    <div class="container-fluid px-0">
      <div class="row g-0">
        <div
          v-for="item in navigationItems"
          :key="item.name"
          class="business-bottom-navigation__item col d-flex flex-column align-items-center justify-content-center py-2"
          :class="{ 'business-bottom-navigation__item--active': isActive(item.route) }"
          @click="navigateTo(item.route)"
          role="button"
          tabindex="0"
        >
          <div class="business-bottom-navigation__icon">
            <i class="material-symbols-outlined">{{ item.icon }}</i>
          </div>
          <span class="business-bottom-navigation__label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'BusinessBottomNavigation',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const navigationItems = [
      {
        name: 'Home',
        route: '/business/home',
        icon: 'home',
        label: '홈',
      },
      {
        name: 'StoreList',
        route: '/business/store',
        icon: 'handshake',
        label: '제휴',
      },
      {
        name: 'BusinessCouponPage',
        route: '/business/coupon',
        icon: 'redeem',
        label: '쿠폰',
      },
      {
        name: 'GroupBuy',
        route: '/business/groupbuy',
        icon: 'groups',
        label: '공동구매',
      },
      {
        name: 'Profile',
        route: '/business/profile',
        icon: 'person',
        label: '내정보',
      },
    ]

    const currentRoute = computed(() => route.path)

    const isActive = (routePath) => {
      // 정확한 경로 일치 또는 하위 경로 포함 체크
      return (
        route.path === routePath ||
        (routePath !== '/business' && route.path.startsWith(routePath + '/'))
      )
    }

    const navigateTo = (routePath) => {
      if (routePath !== route.path) {
        router.push(routePath)
      }
    }

    return {
      navigationItems,
      currentRoute,
      isActive,
      navigateTo,
    }
  },
}
</script>

<style>
@import '../styles/business-bottom-navigation.css';
</style>
