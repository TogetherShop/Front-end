<template>
  <div class="partner-stores-page">
    <!-- 상단바 -->
    <CustomerTopBar :title="store?.name || '제휴가게'" :show-back-button="true" />

    <!-- 매장 메인 이미지 -->
    <div v-if="store" class="store-hero">
      <img
        :src="store.images?.[0] || '/images/default-store.jpg'"
        :alt="store.name"
        class="hero-image"
        @error="handleImageError"
      />
    </div>

    <!-- 매장 정보 -->
    <div v-if="store" class="store-info-section">
      <div class="store-header">
        <div class="store-title-row">
          <h1 class="store-name">{{ store.name }}</h1>
          <span class="store-category">{{ getCategoryName(store.type) }}</span>
        </div>

        <div class="store-rating">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
              fill="#F59E0B"
            />
          </svg>
          <span class="rating-text">{{ store.rating }} ({{ store.reviewCount }})</span>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="tab-navigation">
        <router-link :to="`/stores/${store.id}`" class="tab-button"> 매장정보 </router-link>
        <div class="tab-button active">제휴가게</div>
      </div>

      <!-- 제휴가게 콘텐츠 -->
      <div class="partner-content">
        <h2 class="partner-title">제휴가게</h2>

        <!-- 지도 섹션 -->
        <div class="partner-map-section">
          <div class="map-container">
            <!-- 시뮬레이션된 지도 배경 -->
            <div class="map-background">
              <!-- 매장 마커들 -->
              <div
                v-for="partnerStore in partnerStores"
                :key="partnerStore.id"
                class="partner-marker"
                :style="getMarkerPosition(partnerStore)"
                @click="selectPartnerStore(partnerStore)"
              >
                <div class="marker-icon">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <circle cx="15" cy="15" r="14" fill="white" stroke="#017F58" stroke-width="2" />
                    <svg x="7" y="7" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 7L10 16L5 11"
                        stroke="#017F58"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 제휴 혜택 리스트 -->
        <div class="benefits-section">
          <div v-if="store.hasDiscount" class="benefit-cards">
            <div class="benefit-card main-benefit">
              <div class="benefit-header">
                <div class="benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12ZM3 12C3 13.1046 3.89543 14 5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12ZM8 12H16H8Z"
                      stroke="white"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <h3 class="benefit-title">10% 할인쿠폰</h3>
                <button @click="getCoupon" class="get-coupon-btn">받기</button>
              </div>
              <p class="benefit-description">{{ store.discount }}</p>
              <div class="benefit-details">
                <div class="detail-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1C7.30622 1 8.55859 1.51953 9.48047 2.44141C10.4023 3.36328 10.9219 4.61565 10.9219 5.92188C10.9219 8.26562 6 11 6 11S1.07812 8.26562 1.07812 5.92188C1.07812 4.61565 1.59766 3.36328 2.51953 2.44141C3.44141 1.51953 4.69378 1 6 1Z"
                      stroke="#737373"
                      stroke-width="1"
                    />
                    <circle cx="6" cy="6" r="1.5" fill="#737373" />
                  </svg>
                  <span>{{ store.distance }}m • 도보 {{ store.walkTime }}분</span>
                </div>

                <div class="detail-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                      fill="#737373"
                    />
                  </svg>
                  <span>{{ store.rating }} ({{ store.reviewCount }})</span>
                </div>
              </div>
            </div>

            <!-- 추가 제휴 매장들 -->
            <div
              v-for="partnerStore in partnerStores"
              :key="partnerStore.id"
              class="benefit-card partner-benefit"
            >
              <div class="benefit-header">
                <div class="partner-store-info">
                  <h4 class="partner-store-name">{{ partnerStore.name }}</h4>
                  <span class="partner-store-category">{{
                    getCategoryName(partnerStore.type)
                  }}</span>
                </div>
                <button @click="getPartnerCoupon(partnerStore)" class="get-coupon-btn">받기</button>
              </div>

              <p class="benefit-description">{{ partnerStore.discount }}</p>

              <div class="benefit-details">
                <div class="detail-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1C7.30622 1 8.55859 1.51953 9.48047 2.44141C10.4023 3.36328 10.9219 4.61565 10.9219 5.92188C10.9219 8.26562 6 11 6 11S1.07812 8.26562 1.07812 5.92188C1.07812 4.61565 1.59766 3.36328 2.51953 2.44141C3.44141 1.51953 4.69378 1 6 1Z"
                      stroke="#737373"
                      stroke-width="1"
                    />
                    <circle cx="6" cy="6" r="1.5" fill="#737373" />
                  </svg>
                  <span>{{ partnerStore.distance }}m • 도보 {{ partnerStore.walkTime }}분</span>
                </div>

                <div class="detail-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                      fill="#737373"
                    />
                  </svg>
                  <span>{{ partnerStore.rating }} ({{ partnerStore.reviewCount }})</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-benefits">
            <div class="no-benefits-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#E5E7EB" stroke-width="2" />
                <path
                  d="M16 24L20 28L32 16"
                  stroke="#E5E7EB"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3>현재 진행 중인 제휴 혜택이 없습니다</h3>
            <p>곧 새로운 혜택을 준비하고 있으니 조금만 기다려주세요!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="isLoading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>매장 정보를 불러오는 중...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else class="error-section">
      <p>매장 정보를 찾을 수 없습니다.</p>
      <button @click="router.back()" class="back-button">돌아가기</button>
    </div>

    <!-- 하단 네비게이션 -->
    <CustomerBottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import CustomerTopBar from '@/components/common/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/common/CustomerBottomNavigation.vue'
import { useStoresStore } from '@/stores/stores'

const route = useRoute()
const router = useRouter()
const storesStore = useStoresStore()

// 반응형 상태
const isLoading = ref(true)
const selectedPartnerStore = ref(null)

// 더미 제휴 매장 데이터
const partnerStores = ref([
  {
    id: 101,
    name: '커피빈 강남점',
    type: 'cafe',
    distance: 200,
    walkTime: 3,
    rating: 4.7,
    reviewCount: 234,
    discount: '아메리카노 15% 할인',
    lat: 37.5175,
    lng: 127.0475,
  },
  {
    id: 102,
    name: '롯데리아 역삼점',
    type: 'restaurant',
    distance: 350,
    walkTime: 5,
    rating: 4.2,
    reviewCount: 89,
    discount: '세트메뉴 20% 할인',
    lat: 37.517,
    lng: 127.048,
  },
  {
    id: 103,
    name: '파리바게뜨 테헤란점',
    type: 'cafe',
    distance: 180,
    walkTime: 2,
    rating: 4.5,
    reviewCount: 156,
    discount: '베이커리 10% 할인',
    lat: 37.518,
    lng: 127.047,
  },
])

// 스토어에서 상태 가져오기 - storeToRefs 사용
const { selectedStore } = storeToRefs(storesStore)
const store = computed(() => selectedStore.value)

// 카테고리 이름 변환
const getCategoryName = (type) => {
  const categories = {
    restaurant: '음식점',
    cafe: '카페',
    retail: '소매점',
  }
  return categories[type] || '매장'
}

// 마커 위치 계산 (시뮬레이션)
const getMarkerPosition = (partnerStore) => {
  // 간단한 시뮬레이션용 위치 계산
  const positions = {
    101: { left: '130px', top: '137px' },
    102: { left: '204px', top: '91px' },
    103: { left: '304px', top: '263px' },
  }

  return {
    position: 'absolute',
    ...positions[partnerStore.id],
    transform: 'translate(-50%, -50%)',
  }
}

// 제휴 매장 선택
const selectPartnerStore = (partnerStore) => {
  selectedPartnerStore.value = partnerStore
  console.log('선택된 제휴 매장:', partnerStore.name)
}

// 메인 매장 쿠폰 받기
const getCoupon = () => {
  if (store.value) {
    console.log('쿠폰 받기:', store.value.name)
    alert(`${store.value.name}의 쿠폰을 받았습니다!`)
  }
}

// 제휴 매장 쿠폰 받기
const getPartnerCoupon = (partnerStore) => {
  console.log('제휴 매장 쿠폰 받기:', partnerStore.name)
  alert(`${partnerStore.name}의 쿠폰을 받았습니다!`)
}

// 이미지 에러 처리
const handleImageError = (event) => {
  event.target.src = '/images/default-store.jpg'
}

// 컴포넌트 마운트시 데이터 로드
onMounted(async () => {
  const storeId = parseInt(route.params.id)

  try {
    // 매장 상세 정보 로드
    await storesStore.fetchStoreDetail(storeId)
  } catch (error) {
    console.error('매장 정보 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.partner-stores-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 57px; /* 상단바 높이 */
  padding-bottom: 72px; /* 하단 네비게이션 높이 */
}

.store-hero {
  height: 200px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-info-section {
  flex: 1;
  padding: 16px;
}

.store-header {
  margin-bottom: 24px;
}

.store-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.store-name {
  color: #0a0a0a;
  font-family: 'Pretendard-Bold', Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  margin: 0;
}

.store-category {
  color: #666;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  background-color: #f4f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-text {
  color: #666;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.tab-navigation {
  background-color: #f1f1f1;
  border-radius: 8px;
  height: 36px;
  display: flex;
  margin-bottom: 24px;
  padding: 2px;
}

.tab-button {
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  color: #3a3a3a;
  border-radius: 6px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
}

.tab-button.active {
  background-color: #ffffff;
  box-shadow:
    0px 1px 2px -1px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1);
}

.partner-content {
  flex: 1;
}

.partner-title {
  color: #0a0a0a;
  font-family: 'Noto Sans KR-Bold', Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  margin: 0 0 24px 0;
}

.partner-map-section {
  background-image: url('/images/map-bg.png');
  background-position: 50% 50%;
  background-size: cover;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 32px;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-background {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #e8f5f1 0%, #d1e7dd 100%);
}

.partner-marker {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease;
}

.partner-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.marker-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.benefits-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-card {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  box-shadow:
    0px 1px 2px -1px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.main-benefit {
  border-color: #017f58;
  border-width: 2px;
}

.benefit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.benefit-icon {
  background-color: #017f58;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-title {
  color: #0a0a0a;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
  flex: 1;
  margin-left: 12px;
  margin-right: 12px;
}

.partner-store-info {
  flex: 1;
  margin-right: 12px;
}

.partner-store-name {
  color: #0a0a0a;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 4px 0;
}

.partner-store-category {
  color: #666;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  background-color: #f4f4f6;
  padding: 2px 6px;
  border-radius: 3px;
}

.get-coupon-btn {
  background-color: #017f58;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  padding: 8px 16px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.get-coupon-btn:hover {
  background-color: #016a4a;
}

.benefit-description {
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  line-height: 20px;
  margin: 0 0 16px 0;
}

.benefit-details {
  display: flex;
  gap: 16px;
  align-items: center;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #737373;
  font-family: 'Geist-Regular', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.no-benefits {
  text-align: center;
  padding: 60px 20px;
  background-color: #f9fafb;
  border-radius: 12px;
}

.no-benefits-icon {
  margin: 0 auto 16px;
  width: 48px;
  height: 48px;
}

.no-benefits h3 {
  color: #374151;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 8px 0;
}

.no-benefits p {
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  line-height: 20px;
  margin: 0;
}

.loading-section,
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 16px;
  flex: 1;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #017f58;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.back-button {
  background-color: #017f58;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  padding: 12px 24px;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #016a4a;
}
</style>
