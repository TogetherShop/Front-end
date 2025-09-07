<template>
  <div class="home-page">
    <!-- 상단바 -->
    <CustomerTopBar />

    <!-- 메인 콘텐츠 -->
    <main class="home-page__content">
      <div class="container-fluid px-4 py-5">
        <div class="row">
          <div class="col-12">
            <h1 class="home-page__title">홈</h1>
            <p class="home-page__description">환영합니다! Togethershop에 오신 것을 환영합니다.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 하단 네비게이션 -->
    <CustomerBottomNavigation />
  </div>
</template>

<script>
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue'
export default {
  name: 'HomePage',
  components: {
    CustomerTopBar,
    CustomerBottomNavigation
  }
}
</script>

<style>
@import '../styles/customer-home-page.css';
</style>