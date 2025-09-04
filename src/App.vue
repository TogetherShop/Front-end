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
  <div class="relative min-h-screen">
    <div class="max-w-md mx-auto bg-white min-h-screen shadow-lg">
      <RouterView />
    </div>
    <!-- 알림 토스트 컴포넌트가 있다면 남김 -->
    <!-- <BaseToast /> -->
  </div>
</template>
