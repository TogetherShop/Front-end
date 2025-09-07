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
        <button class="business-top-bar__action-btn" @click="handleNotificationClick">
          <i class="material-symbols-outlined">notifications</i>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'BusinessTopBar',
  setup() {
    const handleChatClick = () => {
      console.log('채팅 버튼 클릭')
      // 채팅 페이지로 이동 로직
    }

    const handleNotificationClick = () => {
      console.log('알림 버튼 클릭')
      // 알림 페이지로 이동 로직
    }

    return {
      handleChatClick,
      handleNotificationClick,
    }
  },
}
</script>

<style>
@import '../styles/business-top-bar.css';
</style>
