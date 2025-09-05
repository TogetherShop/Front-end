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
        <p class="coupon-page__info-text mb-0">제휴 가게 중에서 한 개의 쿠폰만 발급 및 사용이 가능합니다.</p>
      </div>
    </div>

    <!-- 쿠폰 목록 -->
    <div class="coupon-page__coupon-list">
      <div class="container-fluid px-4 py-3" :class="{ 'py-0': activeTab === 'received' }">
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
          <!-- 검색바 -->
          <div class="coupon-page__search-container px-1 mb-3">
            <div class="coupon-page__search-box">
              <i class="material-symbols-outlined coupon-page__search-icon">search</i>
              <input 
                type="text" 
                placeholder="쿠폰 검색" 
                class="coupon-page__search-input"
                v-model="searchQuery"
              />
            </div>
          </div>
          
          <!-- 받은 쿠폰 목록 -->
          <div class="coupon-page__received-coupons">
            <ReceivedCouponCard 
              v-for="coupon in filteredReceivedCoupons" 
              :key="coupon.id"
              :coupon="coupon"
              @click="handleReceivedCouponClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 바 -->
    <BottomNavigation />

    <!-- 쿠폰 발급 모달 -->
    <CouponModal 
      :is-visible="showModal"
      :coupon="selectedCoupon"
      @close="closeModal"
      @download="handleDownload"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import CouponCard from '@/components/CouponCard.vue'
import ReceivedCouponCard from '@/components/ReceivedCouponCard.vue'
import CouponModal from '@/components/CouponModal.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  getAvailableCoupons, 
  getReceivedCoupons, 
  claimCoupon, 
  getCouponDetail,
  useCoupon,
  checkCouponAvailability,
  getCouponHistory,
  getCouponStats
} from '@/api/coupon.js'

export default {
  name: 'CouponPage',
  components: {
    CouponCard,
    ReceivedCouponCard,
    CouponModal,
    BottomNavigation
  },
  setup() {
    const activeTab = ref('available')
    const loading = ref(false)
    const searchQuery = ref('')
    const showModal = ref(false)
    const selectedCoupon = ref(null)
    
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
        storeName: '피자마루',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        daysLeft: 'D-30',
        isClaimed: true
      },
      {
        id: 6,
        storeName: '언더라인',
        category: '카페',
        title: '20% 할인쿠폰',
        expiryDate: '2025.9.30',
        daysLeft: 'D-26',
        isClaimed: true
      },
      {
        id: 7,
        storeName: '조마루 감자탕',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        daysLeft: 'D-30',
        isClaimed: true
      },
      {
        id: 8,
        storeName: '하이디라오',
        category: '음식점',
        title: '5% 할인쿠폰',
        expiryDate: '2025.10.31',
        daysLeft: 'D-30',
        isClaimed: true
      },
      {
        id: 9,
        storeName: '피자마루',
        category: '음식점',
        title: '10% 할인쿠폰',
        expiryDate: '2025.10.31',
        daysLeft: 'D-30',
        isClaimed: true
      }
    ])

    // API에서 데이터 로드
    const loadCoupons = async () => {
      loading.value = true
      try {
        // 실제 API 호출
        const availableData = await getAvailableCoupons()
        const receivedData = await getReceivedCoupons()
        
        // API 응답 데이터로 업데이트
        if (availableData && availableData.data) {
          availableCoupons.value = availableData.data
        }
        if (receivedData && receivedData.data) {
          receivedCoupons.value = receivedData.data
        }
        
        console.log('쿠폰 데이터 로드 완료')
      } catch (error) {
        console.error('쿠폰 데이터 로드 실패:', error)
        // API 실패 시 예시 데이터 사용 (개발용)
        console.log('API 실패로 인해 예시 데이터 사용')
      } finally {
        loading.value = false
      }
    }

    // 쿠폰 발급 처리 (모달 열기)
    const handleClaimCoupon = (couponId) => {
      const coupon = availableCoupons.value.find(c => c.id === couponId)
      if (coupon && coupon.remainingCount > 0) {
        selectedCoupon.value = {
          ...coupon,
          storeAvatar: 'http://localhost:3845/assets/4f7728b6d02dc64fde3fb8a6f0b1d01507e046a5.svg' // 기본 아바타
        }
        showModal.value = true
      }
    }

    // 모달 닫기
    const closeModal = () => {
      showModal.value = false
      selectedCoupon.value = null
    }

    // 쿠폰 다운로드 처리
    const handleDownload = async (coupon) => {
      try {
        // 실제 API 호출
        await claimCoupon(coupon.id)
        
        // 성공 시 로컬 상태 업데이트
        const couponIndex = availableCoupons.value.findIndex(c => c.id === coupon.id)
        if (couponIndex !== -1) {
          availableCoupons.value[couponIndex].remainingCount--
        }
        
        console.log('쿠폰 다운로드 성공:', coupon.title)
        
        // 모달 닫기
        closeModal()
        
        // 받은 쿠폰 목록 새로고침
        await loadReceivedCoupons()
      } catch (error) {
        console.error('쿠폰 다운로드 실패:', error)
        // 에러 처리 (토스트 메시지 등)
      }
    }

    // 검색 필터링
    const filteredReceivedCoupons = computed(() => {
      if (!searchQuery.value) {
        return receivedCoupons.value
      }
      return receivedCoupons.value.filter(coupon => 
        coupon.storeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        coupon.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    // 받은 쿠폰 목록 로드
    const loadReceivedCoupons = async () => {
      try {
        const params = {
          search: searchQuery.value,
          page: 1,
          limit: 50
        }
        const receivedData = await getReceivedCoupons(params)
        
        if (receivedData && receivedData.data) {
          receivedCoupons.value = receivedData.data
        }
      } catch (error) {
        console.error('받은 쿠폰 목록 로드 실패:', error)
      }
    }

    // 받은 쿠폰 카드 클릭 핸들러
    const handleReceivedCouponClick = async (couponId) => {
      try {
        // 쿠폰 상세 정보 조회
        const couponDetail = await getCouponDetail(couponId)
        console.log('쿠폰 상세 정보:', couponDetail)
        
        // 추후 쿠폰 상세 페이지로 이동하거나 사용 처리
        // router.push(`/coupons/${couponId}`)
      } catch (error) {
        console.error('쿠폰 상세 정보 조회 실패:', error)
      }
    }

    // 검색어 변경 시 받은 쿠폰 목록 새로고침
    watch(searchQuery, () => {
      if (activeTab.value === 'received') {
        loadReceivedCoupons()
      }
    })

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      loadCoupons()
    })

    return {
      activeTab,
      loading,
      searchQuery,
      showModal,
      selectedCoupon,
      availableCoupons,
      receivedCoupons,
      filteredReceivedCoupons,
      handleClaimCoupon,
      handleReceivedCouponClick,
      closeModal,
      handleDownload,
      loadReceivedCoupons,
      loadCoupons
    }
  }
}
</script>

<style>
@import '../styles/coupon.css';
</style>
