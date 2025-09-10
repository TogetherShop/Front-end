<template>
  <header class="top-bar bg-white">
    <div class="container-fluid px-3 py-2">
      <div class="row align-items-center">
        <div class="col-6 d-flex align-items-center">
          <img
            src="@/assets/images/togethershop_logo.png"
            alt="Togethershop Logo"
            class="top-bar__logo"
          />
        </div>
        <div class="col-6 d-flex justify-content-end">
          <div class="notification-container" @click="goToNotifications">
            <i class="material-symbols-outlined fs-2 notification-icon">notifications</i>
            <span v-if="hasUnread" class="notification-badge"></span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter()
    const notificationStore = useNotificationStore()
    
    const goToNotifications = () => {
      router.push('/customer/notifications')
    }
    
    return {
      goToNotifications,
      hasUnread: notificationStore.hasUnread
    }
  }
}
</script>

<style scoped>
@import '../styles/customer-top-bar.css';
</style>
