<template>
  <div class="CustomerProfile">
    <!-- 상단바 -->
    <CustomerTopBar />

    <!-- 프로필 정보 섹션 -->
    <div class="CustomerProfile__profile-section px-4 py-4">
      <h2 class="CustomerProfile__section-title mb-2">프로필 정보</h2>
      <div class="CustomerProfile__profile-card rounded-3 p-3 shadow-sm">
        <div class="CustomerProfile__profile-content">
          <div class="CustomerProfile__profile-image">
            <img src="https://via.placeholder.com/60x60/cccccc/ffffff?text=프로필" class="CustomerProfile__profile-avatar rounded-circle">
          </div>
          <div class="CustomerProfile__profile-info">
            <h3 class="CustomerProfile__profile-name mb-2">수상인</h3>
            <p class="CustomerProfile__profile-location mb-0">강남구 삼성동</p>
          </div>
          <div class="CustomerProfile__profile-actions">
            <button class="CustomerProfile__logout-btn btn btn-link p-0 text-danger text-decoration-none d-flex align-items-center">
              <i class="material-symbols-outlined CustomerProfile__logout-icon me-1">logout</i>
              <span class="CustomerProfile__logout-text ">로그아웃</span>
            </button>
            <button class="CustomerProfile__edit-btn btn btn-link p-0 text-dark text-decoration-none d-flex align-items-center">
              <i class="material-symbols-outlined CustomerProfile__edit-icon me-1">edit</i>
              <span class="CustomerProfile__edit-text ">수정</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 내 쿠폰함 섹션 -->
    <div class="CustomerProfile__coupon-section px-4 py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="CustomerProfile__section-title mb-0">내 쿠폰함</h2>
        <a href="#" class="CustomerProfile__view-all-link text-decoration-none text-muted d-flex align-items-center">
          <span class="CustomerProfile__view-all-text me-1">전체 보기</span>
          <i class="material-symbols-outlined CustomerProfile__view-all-icon">chevron_right</i>
        </a>
      </div>
      <div class="CustomerProfile__coupon-list bg-light rounded-3 p-3 shadow-sm">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <!-- 쿠폰 목록 -->
        <div v-else-if="coupons.length > 0">
          <div 
            v-for="coupon in coupons" 
            :key="coupon.id"
            class="CustomerProfile__coupon-card d-flex align-items-center bg-light rounded mb-2 p-3 position-relative"
          >
            <div class="CustomerProfile__coupon-discount fw-bold text-success me-3">
              {{ coupon.discount }}
            </div>
            <div class="CustomerProfile__coupon-info flex-grow-1 me-3">
              <h4 class="CustomerProfile__coupon-title mb-1">
                {{ coupon.title }}
              </h4>
              <p class="CustomerProfile__coupon-store mb-0">
                {{ coupon.storeName }}
              </p>
            </div>
            <div 
              class="CustomerProfile__coupon-expiry position-absolute"
              :class="{
                'text-success': coupon.expiryType === 'today',
                'text-muted': coupon.expiryType === 'days'
              }"
            >
              {{ coupon.expiryStatus }}
            </div>
          </div>
        </div>
        
        <!-- 쿠폰이 없는 경우 -->
        <div v-else class="text-center py-4 text-muted">
          <p class="mb-0">기한이 임박한 쿠폰이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 내가 쓴 리뷰 섹션 -->
    <div class="CustomerProfile__review-section px-4 py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="CustomerProfile__section-title mb-0">내가 쓴 리뷰</h2>
        <a href="#" class="CustomerProfile__view-all-link text-decoration-none text-muted d-flex align-items-center">
          <span class="CustomerProfile__view-all-text me-1">전체 보기</span>
          <i class="material-symbols-outlined CustomerProfile__view-all-icon">chevron_right</i>
        </a>
      </div>
      <div class="CustomerProfile__review-list bg-light rounded-3 p-3 shadow-sm">
        <!-- 로딩 상태 -->
        <div v-if="reviewsLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <!-- 리뷰 목록 -->
        <div v-else-if="reviews.length > 0">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="CustomerProfile__review-card bg-light rounded mb-2 p-3"
          >
            <div class="CustomerProfile__review-header mb-1">
              <h4 class="CustomerProfile__review-store mb-1">
                {{ review.storeName }}
              </h4>
              <p class="CustomerProfile__review-location mb-0 ms-2">
                {{ review.location }}
              </p>
            </div>
            <p class="CustomerProfile__review-content text-dark mb-1">
              {{ review.content }}
            </p>
          </div>
        </div>
        
        <!-- 리뷰가 없는 경우 -->
        <div v-else class="text-center py-4 text-muted">
          <p class="mb-0">작성한 리뷰가 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <CustomerBottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue'
import { getExpiringCoupons, getRecentReviews } from '@/api/customer-coupon.js'

export default {
  name: 'CustomerProfilePage',
  components: {
    CustomerTopBar,
    CustomerBottomNavigation
  },
  setup() {
    // 쿠폰 데이터
    const coupons = ref([])
    const loading = ref(false)
    
    // 리뷰 데이터
    const reviews = ref([])
    const reviewsLoading = ref(false)

    // 더미 쿠폰 데이터 (기한이 임박한 2개)
    const dummyCoupons = [
      {
        id: 1,
        discount: '15%',
        title: '15% 할인 쿠폰',
        storeName: '신마루 감자탕',
        expiryStatus: '오늘만료',
        expiryType: 'today',
        category: '할인'
      },
      {
        id: 2,
        discount: '10%',
        title: '10% 음료 할인 쿠폰',
        storeName: '달콤카페',
        expiryStatus: '5일남음',
        expiryType: 'days',
        category: '할인'
      }
    ]

    // 더미 리뷰 데이터 (최근 2개)
    const dummyReviews = [
      {
        id: 1,
        storeName: '옥희',
        location: '서울 관악구 남현동',
        content: '짝꿍의 최애 식당이에요!! 오늘 비가 오는데 퇴근하고 맛난 훠궈 먹으며 회포푸니 너무 좋습니다~~ 무엇보다...~~~~~~~~~~~~~~~~',
        rating: 5,
        date: '2024-01-15'
      },
      {
        id: 2,
        storeName: '동삼화',
        location: '경기 고양시 덕양구',
        content: '짝꿍의 최애 식당이에요!! 오늘 비가 오는데 퇴근하고 맛난 훠궈 먹으며 회포푸니 너무 좋습니다~~ 무엇보다...~~~~~~~~~~~~~~~~',
        rating: 4,
        date: '2024-01-10'
      }
    ]

    // 쿠폰 데이터 로드
    const loadCoupons = async () => {
      loading.value = true
      try {
        // 실제 API 호출 (현재는 주석 처리)
        // const response = await getExpiringCoupons(2)
        // coupons.value = response.data
        
        // 현재는 더미 데이터 사용 (API 준비되면 위 주석 해제)
        coupons.value = dummyCoupons
      } catch (error) {
        console.error('쿠폰 데이터 로드 실패:', error)
        // 에러 발생 시 더미 데이터로 fallback
        coupons.value = dummyCoupons
      } finally {
        loading.value = false
      }
    }

    // 리뷰 데이터 로드
    const loadReviews = async () => {
      reviewsLoading.value = true
      try {
        // 실제 API 호출 (현재는 주석 처리)
        // const response = await getRecentReviews(2)
        // reviews.value = response.data
        
        // 현재는 더미 데이터 사용 (API 준비되면 위 주석 해제)
        reviews.value = dummyReviews
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
        // 에러 발생 시 더미 데이터로 fallback
        reviews.value = dummyReviews
      } finally {
        reviewsLoading.value = false
      }
    }

    onMounted(() => {
      loadCoupons()
      loadReviews()
    })

    return {
      coupons,
      loading,
      reviews,
      reviewsLoading
    }
  }
}
</script>

<style scoped>
@import '@/styles/customer-profile-page.css';
</style>