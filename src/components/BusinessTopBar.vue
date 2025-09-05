<template>
  <div class="header-container sticky-top bg-white shadow-sm">
    <div class="container-fluid px-3 py-2">
      <div class="d-flex align-items-center justify-content-between">
        <!-- 로고 -->
        <div class="logo d-flex align-items-center">
          <img
            src="@/assets/images/togethershop_logo.png"
            alt="함께가게 로고"
            style="height: 40px"
          />
        </div>

        <!-- 우측 버튼들 -->
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-link p-1" style="text-decoration: none">
            <span class="material-symbols-outlined" style="font-size: 24px; color: #6f797a"
              >chat</span
            >
          </button>
          <button class="btn btn-link p-1" style="text-decoration: none">
            <span class="material-symbols-outlined" style="font-size: 24px; color: #6f797a"
              >notifications</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BusinessTopBar',
}
</script>
