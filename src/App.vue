<script setup>
import { onMounted } from 'vue'
// import { useAuthStore } from '@/stores/authStore'
// import { useNotificationStore } from '@/stores/notification'
// import BaseToast from './components/BaseToast.vue'

// const authStore = useAuthStore()
// const notificationStore = useNotificationStore()
// onMounted(async () => {
//   await authStore.loadUserInfo()

//   if (authStore.getIsLoggedIn) {
//     notificationStore.fetch()
//     try {

//     } catch {
//       //
//     }
//   }
// })
</script>

<template>
  <div class="position-relative min-vh-100">
    <div class="container d-flex flex-column bg-white min-vh-100 shadow mx-auto app-wrapper p-0">
      <RouterView />
    </div>
    <!-- 알림 토스트 컴포넌트가 있다면 남김 -->
    <!-- <BaseToast /> -->
  </div>
</template>

<style>
.app-wrapper {
  max-width: 430px; /* 원하는 앱 크기로 제한 */
}
</style>
