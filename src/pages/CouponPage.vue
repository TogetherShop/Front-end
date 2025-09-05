<template>
  <div class="coupon-page">
    <!-- 상단바 -->
    <header class="coupon-page__top-bar bg-white">
      <div class="container-fluid px-3 py-2">
        <div class="row align-items-center">
          <div class="col-6 d-flex align-items-center">
            <img 
              src="http://localhost:3845/assets/5889b11eee82de89d5c2367880c047acbf719b0c.png" 
              alt="Togethershop Logo" 
              class="coupon-page__logo"
            />
          </div>
          <div class="col-6 d-flex justify-content-end">
            <i class="material-symbols-outlined fs-2">notifications</i>
          </div>
        </div>
      </div>
    </header>

    <!-- 탭 리스트 -->
      <div class="container-fluid px-5 py-3">
        <div class="coupon-page__tab-container">
          <button 
            class="coupon-page__tab-button" 
            :class="{ 'coupon-page__tab-button--active': activeTab === 'available' }"
            @click="activeTab = 'available'"
            type="button"
          >
            발급 가능한 쿠폰
          </button>
          <button 
            class="coupon-page__tab-button" 
            :class="{ 'coupon-page__tab-button--active': activeTab === 'received' }"
            @click="activeTab = 'received'"
            type="button"
          >
            받은 쿠폰
          </button>
        </div>
      </div>

    <!-- 안내 메시지 박스 -->
    <div v-if="activeTab === 'available'" class="container-fluid px-4 pb-3">
      <div class="coupon-page__info-box">
        <p class="coupon-page__info-text mb-0">결제한 내역에 따라 쿠폰이 발행됩니다.</p>
        <p class="coupon-page__info-text">제휴 가게 중에서 한 개의 쿠폰만 발급 및 사용이 가능합니다.</p>
      </div>
    </div>

    <!-- 쿠폰 목록 -->
    <div class="coupon-page__coupon-list">
      <div class="container-fluid px-4 py-3">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-2">쿠폰을 불러오는 중...</p>
        </div>
        
        <div v-else-if="activeTab === 'available'">
          <!-- 백소정 모란점 -->
          <h4 class="coupon-page__section-title fw-bold mb-3">백소정 모란점</h4>
          <CouponCard 
            v-for="coupon in availableCoupons.filter(c => c.storeGroup === '백소정 모란점')" 
            :key="coupon.id"
            :coupon="coupon"
            @claim="handleClaimCoupon"
          />
          
          <!-- 훠궈야 고양 스타필드점 -->
          <h4 class="coupon-page__section-title fw-bold mb-3 mt-4">훠궈야 고양 스타필드점</h4>
          <CouponCard 
            v-for="coupon in availableCoupons.filter(c => c.storeGroup === '훠궈야 고양 스타필드점')" 
            :key="coupon.id"
            :coupon="coupon"
            @claim="handleClaimCoupon"
          />
        </div>
        
        <div v-else>
          <h4 class="coupon-page__section-title fw-bold mb-3">받은 쿠폰</h4>
          <CouponCard 
            v-for="coupon in receivedCoupons" 
            :key="coupon.id"
            :coupon="coupon"
            :is-received="true"
          />
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 바 -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import CouponCard from '@/components/CouponCard.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { getAvailableCoupons, getReceivedCoupons, claimCoupon } from '@/api/coupon.js'

export default {
  name: 'CouponPage',
  components: {
    CouponCard,
    BottomNavigation
  },
  setup() {
    const activeTab = ref('available')
    const loading = ref(false)
    
    const availableCoupons = ref([
      {
        id: 1,
        storeName: '피자마루',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        remainingCount: 40,
        isClaimed: false,
        storeGroup: '백소정 모란점'
      },
      {
        id: 2,
        storeName: '언더라인',
        category: '카페',
        title: '20% 할인쿠폰',
        expiryDate: '2025.10.31',
        remainingCount: 20,
        isClaimed: false,
        storeGroup: '백소정 모란점'
      },
      {
        id: 3,
        storeName: '조마루 감자탕',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        remainingCount: 4,
        isClaimed: false,
        storeGroup: '백소정 모란점'
      },
      {
        id: 4,
        storeName: '피자마루',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        remainingCount: 40,
        isClaimed: false,
        storeGroup: '훠궈야 고양 스타필드점'
      },

    ])

    const receivedCoupons = ref([
      {
        id: 5,
        storeName: '스타벅스 강남점',
        category: '카페',
        title: '아메리카노 20% 할인',
        expiryDate: '2025.12.31',
        remainingCount: 0,
        isClaimed: true
      }
    ])

    // API에서 데이터 로드
    const loadCoupons = async () => {
      loading.value = true
      try {
        // 추후 실제 API 호출로 대체
        // const availableData = await getAvailableCoupons()
        // const receivedData = await getReceivedCoupons()
        // availableCoupons.value = availableData
        // receivedCoupons.value = receivedData
        
        // 현재는 예시 데이터 사용
        console.log('API 통신 준비 완료 - 추후 실제 API 호출로 대체')
      } catch (error) {
        console.error('쿠폰 데이터 로드 실패:', error)
      } finally {
        loading.value = false
      }
    }

    // 쿠폰 발급 처리
    const handleClaimCoupon = async (couponId) => {
      const coupon = availableCoupons.value.find(c => c.id === couponId)
      if (coupon && coupon.remainingCount > 0) {
        try {
          // 추후 실제 API 호출로 대체
          // await claimCoupon(couponId)
          
          // 현재는 로컬 상태만 업데이트
          coupon.remainingCount--
          console.log('쿠폰 발급:', coupon.title)
        } catch (error) {
          console.error('쿠폰 발급 실패:', error)
        }
      }
    }

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      loadCoupons()
    })

    return {
      activeTab,
      loading,
      availableCoupons,
      receivedCoupons,
      handleClaimCoupon
    }
  }
}
</script>

<style>
@import '../styles/coupon.css';
</style>
