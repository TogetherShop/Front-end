<template>
  <header class="business-top-bar bg-white">
    <div class="business-top-bar__container">
      <div class="business-top-bar__logo-section">
        <img
          src="@/assets/images/togethershop_logo.png"
          alt="Togethershop Logo"
          class="business-top-bar__logo"
        />
      </div>
      <div class="business-top-bar__actions">
        <button class="business-top-bar__action-btn" @click="handleChatClick">
          <i class="material-symbols-outlined">chat</i>
        </button>
        <button
          class="business-top-bar__action-btn notification-container"
          @click="handleNotificationClick"
        >
          <i class="material-symbols-outlined">notifications</i>
          <span v-if="hasUnread" class="notification-badge"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'

export default {
  name: 'BusinessTopBar',
  setup() {
    const router = useRouter()
    const notificationStore = useNotificationStore()

    const handleChatClick = () => {
      console.log('채팅 버튼 클릭')
      router.push('/business/chats') // 채팅 페이지로 이동
    }

    const handleNotificationClick = () => {
      console.log('알림 버튼 클릭')
      router.push('/business/notifications')
    }

    return {
      handleChatClick,
      handleNotificationClick,
      hasUnread: notificationStore.hasUnread,
    }
  },
}
</script>

<style>
@import '../styles/business-top-bar.css';
</style>
