<template>
  <div class="profile-page">
    <!-- 상단바 -->
    <TopBar />
    
    <!-- 메인 콘텐츠 -->
    <main class="profile-page__content">
      <div class="container-fluid px-4 py-5">
        <div class="row">
          <div class="col-12">
            <h1 class="profile-page__title">내정보</h1>
            <p class="profile-page__description">내 정보를 확인하고 관리하세요.</p>
          </div>
        </div>
      </div>
    </main>
    
    <!-- 하단 네비게이션 -->
    <BottomNavigation />
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

export default {
  name: 'ProfilePage',
  components: {
    TopBar,
    BottomNavigation
  }
}
</script>

<style>
@import '../styles/profile-page.css';
</style>
