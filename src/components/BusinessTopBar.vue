<template>
  <div class="business-top-bar">
    <div class="top-bar-content">
      <!-- 로고 -->
      <div class="logo-section">
        <img src="@/assets/images/togethershop_logo.png" alt="Togethershop" class="logo-image" />
      </div>

      <!-- 우측 액션 버튼들 -->
      <div class="action-buttons">
        <button class="action-button" @click="onMessageClick">
          <span class="material-symbols-outlined">mail</span>
        </button>

        <button v-if="showNotification" class="action-button notification-button" @click="onNotificationClick">
          <span class="material-symbols-outlined">notifications</span>
          <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  showNotification: {
    type: Boolean,
    default: true
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['message', 'notification'])

const onMessageClick = () => {
  emit('message')
  // 메시지 페이지로 이동
  router.push('/business/messages')
}

const onNotificationClick = () => {
  emit('notification')
  // 알림 페이지로 이동
  router.push('/business/notifications')
}
</script>

<style scoped>
@import '@/styles/business-top-bar.css';
</style>
