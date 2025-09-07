<template>
  <div class="position-relative min-vh-100">
    <div class="container d-flex flex-column bg-white min-vh-100 shadow mx-auto app-wrapper p-0">
      <BusinessTopBar />

      <div class="container-fluid px-3 py-3">
        <div class="page-title mb-3">
          <h5 class="mb-0 fw-bold">홈화면</h5>
        </div>

        <div class="text-center py-5">
          <span class="material-symbols-outlined display-1 text-muted mb-3">groups</span>
          <h6 class="text-muted">홈페이지</h6>
          <p class="text-muted small">향후 개발 예정</p>
        </div>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'

export default {
  name: 'Home',
  components: {
    BusinessTopBar,
    BusinessBottomNavigation,
  },
}
</script>

<style scoped>
.app-wrapper {
  max-width: 430px;
}
</style>
