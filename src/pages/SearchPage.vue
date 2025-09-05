<template>
  <div class="search-page">
    <!-- 상단바 -->
    <TopBar />
    
    <!-- 메인 콘텐츠 -->
    <main class="search-page__content">
      <div class="container-fluid px-4 py-5">
        <div class="row">
          <div class="col-12">
            <h1 class="search-page__title">매장찾기</h1>
            <p class="search-page__description">주변 매장을 찾아보세요.</p>
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
  name: 'SearchPage',
  components: {
    TopBar,
    BottomNavigation
  }
}
</script>

<style>
@import '../styles/search-page.css';
</style>
