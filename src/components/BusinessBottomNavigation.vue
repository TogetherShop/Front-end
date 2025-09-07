<template>
  <div class="business-bottom-navigation">
    <div class="nav-container">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    name: 'home',
    path: '/business/home',
    icon: 'home',
    label: '홈'
  },
  {
    name: 'partnership',
    path: '/business/partnership',
    icon: 'handshake',
    label: '제휴'
  },
  {
    name: 'coupon',
    path: '/business/coupon',
    icon: 'redeem',
    label: '쿠폰'
  },
  {
    name: 'group-purchase',
    path: '/business/group-purchase',
    icon: 'groups',
    label: '공구'
  },
  {
    name: 'profile',
    path: '/business/profile',
    icon: 'person',
    label: '내정보'
  }
]

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
@import '@/styles/business-bottom-navigation.css';
</style>
