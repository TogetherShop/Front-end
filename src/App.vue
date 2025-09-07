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
  <div class="app-container position-relative">
    <div class="container d-flex flex-column bg-white shadow mx-auto app-wrapper p-0">
      <div class="content-wrapper flex-grow-1 overflow-auto">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style>
.app-container {
  width: 100%;
  height: 100vh;
}

.app-wrapper {
  max-width: 430px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 내부 내용만 스크롤, 스크롤바 숨김 */
.content-wrapper {
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
}

.content-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

@supports (-webkit-touch-callout: none) {
  .app-container {
    height: -webkit-fill-available;
  }
}
</style>
