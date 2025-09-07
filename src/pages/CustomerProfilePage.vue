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
            <img :src="togethershopLogo" class="CustomerProfile__profile-avatar rounded-circle">
          </div>
          <div class="CustomerProfile__profile-info">
            <div v-if="profileLoading" class="text-center py-2">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">로딩 중...</span>
              </div>
            </div>
              <div v-else>
                <h3 class="CustomerProfile__profile-name mb-2">{{ customerProfile.name || '고객' }}</h3>
                <p class="CustomerProfile__profile-location mb-0">{{ customerProfile.address || '주소 정보 없음' }}</p>
                <small v-if="(!customerProfile.name || customerProfile.name === '') && (!customerProfile.address || customerProfile.address === '')" class="text-muted">
                  프로필 정보를 불러올 수 없습니다
                </small>
              </div>
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
            :key="coupon.couponId"
            class="CustomerProfile__coupon-card d-flex align-items-center bg-light rounded mb-2 p-3 position-relative"
          >
            <div class="CustomerProfile__coupon-discount fw-bold text-success me-3">
              {{ formatDiscount(coupon.discountValue) }}
            </div>
            <div class="CustomerProfile__coupon-info flex-grow-1 me-3">
              <h4 class="CustomerProfile__coupon-title mb-1">
                {{ coupon.businessName }} 쿠폰
              </h4>
              <p class="CustomerProfile__coupon-store mb-0">
                {{ coupon.businessCategory }}
              </p>
            </div>
            <div 
              class="CustomerProfile__coupon-expiry position-absolute"
              :class="{
                'text-danger': coupon.daysLeft <= 1,
                'text-warning': coupon.daysLeft <= 3 && coupon.daysLeft > 1,
                'text-muted': coupon.daysLeft > 3
              }"
            >
              {{ formatDaysLeft(coupon.daysLeft) }}
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
            :key="review.reviewId"
            class="CustomerProfile__review-card bg-light rounded mb-2 p-3"
          >
            <div class="CustomerProfile__review-header mb-1">
              <h4 class="CustomerProfile__review-store mb-1">
                {{ review.businessName }}
              </h4>
              <p class="CustomerProfile__review-location mb-0 ms-2">
                {{ review.address }}
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
import { getCustomerProfile } from '@/api/customer-profile.js'
import togethershopLogo from '@/assets/images/togethershop_logo.png'

export default {
  name: 'CustomerProfilePage',
  components: {
    CustomerTopBar,
    CustomerBottomNavigation
  },
  setup() {
    // 프로필 데이터
    const customerProfile = ref({
      name: '',
      address: ''
    })
    const profileLoading = ref(false)
    
    // 쿠폰 데이터
    const coupons = ref([])
    const loading = ref(false)
    
    // 리뷰 데이터
    const reviews = ref([])
    const reviewsLoading = ref(false)

    // 더미 쿠폰 데이터 (기한이 임박한 2개) - ExpiringCouponDTO 형식
    const dummyCoupons = [
      {
        couponId: 1,
        couponCode: 'COUPON001',
        expireDate: '2024-01-20T23:59:59',
        templateId: 101,
        discountValue: 1500,
        businessName: '신마루 감자탕',
        businessCategory: '한식',
        daysLeft: 1
      },
      {
        couponId: 2,
        couponCode: 'COUPON002',
        expireDate: '2024-01-25T23:59:59',
        templateId: 102,
        discountValue: 2000,
        businessName: '달콤카페',
        businessCategory: '카페',
        daysLeft: 5
      }
    ]

    // 더미 리뷰 데이터 (최근 2개) - ReviewResponseDTO 형식
    const dummyReviews = [
      {
        reviewId: 1,
        businessId: 101,
        businessName: '옥희',
        address: '서울 관악구 남현동',
        content: '짝꿍의 최애 식당이에요!! 오늘 비가 오는데 퇴근하고 맛난 훠궈 먹으며 회포푸니 너무 좋습니다~~ 무엇보다...~~~~~~~~~~~~~~~~',
        rating: 5.0,
        createdAt: '2024-01-15T10:30:00',
        status: 'ACTIVE'
      },
      {
        reviewId: 2,
        businessId: 102,
        businessName: '동삼화',
        address: '경기 고양시 덕양구',
        content: '짝꿍의 최애 식당이에요!! 오늘 비가 오는데 퇴근하고 맛난 훠궈 먹으며 회포푸니 너무 좋습니다~~ 무엇보다...~~~~~~~~~~~~~~~~',
        rating: 4.0,
        createdAt: '2024-01-10T14:20:00',
        status: 'ACTIVE'
      }
    ]

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 할인 금액 포맷팅 함수
    const formatDiscount = (discountValue) => {
      if (!discountValue) return '할인'
      return `${discountValue.toLocaleString()}%`
    }

    // 남은 일수 포맷팅 함수
    const formatDaysLeft = (daysLeft) => {
      if (daysLeft <= 0) return '만료됨'
      if (daysLeft === 1) return '오늘만료'
      return `D-${daysLeft}`
    }

    // 프로필 데이터 로드
    const loadProfile = async () => {
      profileLoading.value = true
      
      // 토큰 상태 확인
      const token = localStorage.getItem('access_token')
      const userType = localStorage.getItem('user_type')


      
      try {
        const response = await getCustomerProfile()
        
        // CustomerProfileDTO는 직접 반환되므로 response가 바로 DTO 객체
        if (response) {
          customerProfile.value = {
            name: response.name || '',
            address: response.address || ''
          }
        }
      } catch (error) {
        console.error('프로필 데이터 로드 실패:', error)
              } finally {
        profileLoading.value = false
      }
    }

    // 쿠폰 데이터 로드
    const loadCoupons = async () => {
      loading.value = true
      try {
        console.log('기한 임박 쿠폰 API 호출 시작...')
        const response = await getExpiringCoupons(2)
        console.log('기한 임박 쿠폰 API 응답:', response)
        
        if (response && Array.isArray(response)) {
          // ExpiringCouponDTO 배열을 직접 받는 경우 - 최대 2개로 제한
          coupons.value = response.slice(0, 2).map(coupon => ({
            couponId: coupon.couponId,
            couponCode: coupon.couponCode,
            expireDate: coupon.expireDate,
            templateId: coupon.templateId,
            discountValue: coupon.discountValue,
            businessName: coupon.businessName,
            businessCategory: coupon.businessCategory,
            daysLeft: coupon.daysLeft
          }))
        } else if (response && response.data && Array.isArray(response.data)) {
          // 응답이 { data: [...] } 형태인 경우 - 최대 2개로 제한
          coupons.value = response.data.slice(0, 2).map(coupon => ({
            couponId: coupon.couponId,
            couponCode: coupon.couponCode,
            expireDate: coupon.expireDate,
            templateId: coupon.templateId,
            discountValue: coupon.discountValue,
            businessName: coupon.businessName,
            businessCategory: coupon.businessCategory,
            daysLeft: coupon.daysLeft
          }))
        } else {
          console.warn('기한 임박 쿠폰 API 응답 형식이 예상과 다릅니다:', response)
          coupons.value = []
        }
        
        console.log('기한 임박 쿠폰 데이터 설정 완료:', coupons.value)
      } catch (error) {
        console.error('기한 임박 쿠폰 데이터 로드 실패:', error)
        
        // 403 오류인 경우 특별 처리
        if (error.response?.status === 403) {
          console.warn('403 Forbidden - 기한 임박 쿠폰 API 권한이 없거나 구현되지 않았을 수 있습니다.')
          coupons.value = []
        } else {
          // 다른 에러의 경우 더미 데이터로 fallback
          coupons.value = dummyCoupons
        }
      } finally {
        loading.value = false
      }
    }

    // 리뷰 데이터 로드
    const loadReviews = async () => {
      reviewsLoading.value = true
      try {
        console.log('리뷰 API 호출 시작...')
        const response = await getRecentReviews(2)
        console.log('리뷰 API 응답:', response)
        
        if (response && Array.isArray(response)) {
          // ReviewResponseDTO 배열을 직접 받는 경우 - 최대 2개로 제한
          reviews.value = response.slice(0, 2).map(review => ({
            reviewId: review.reviewId,
            businessId: review.businessId,
            businessName: review.businessName,
            address: review.address,
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
            status: review.status
          }))
        } else if (response && response.data && Array.isArray(response.data)) {
          // 응답이 { data: [...] } 형태인 경우 - 최대 2개로 제한
          reviews.value = response.data.slice(0, 2).map(review => ({
            reviewId: review.reviewId,
            businessId: review.businessId,
            businessName: review.businessName,
            address: review.address,
            content: review.content,
            rating: review.rating,
            createdAt: review.createdAt,
            status: review.status
          }))
        } else {
          console.warn('리뷰 API 응답 형식이 예상과 다릅니다:', response)
          reviews.value = []
        }
        
        console.log('리뷰 데이터 설정 완료:', reviews.value)
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
        
        // 403 오류인 경우 특별 처리
        if (error.response?.status === 403) {
          console.warn('403 Forbidden - 리뷰 API 권한이 없거나 구현되지 않았을 수 있습니다.')
          reviews.value = []
        } else {
          // 다른 에러의 경우 더미 데이터로 fallback
          reviews.value = dummyReviews
        }
      } finally {
        reviewsLoading.value = false
      }
    }

    onMounted(async () => {
      // 다른 API가 작동하는지 먼저 테스트
      try {
        console.log('다른 API 테스트 시작...')
        const couponResponse = await getExpiringCoupons(1)
        console.log('쿠폰 API 테스트 성공:', couponResponse)
      } catch (error) {
        console.error('쿠폰 API 테스트 실패:', error)
      }
      
      loadProfile()
      loadCoupons()
      loadReviews()
    })

    return {
      customerProfile,
      profileLoading,
      coupons,
      loading,
      reviews,
      reviewsLoading,
      formatDate,
      formatDiscount,
      formatDaysLeft,
      togethershopLogo
    }
  }
}
</script>

<style scoped>
@import '@/styles/customer-profile-page.css';
</style>