<template>
  <div class="store-detail-page">
    <!-- 상단바 -->
    <CustomerTopBar :title="store?.name || '매장 정보'" :show-back-button="true" />

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

      <!-- 매장 상세 정보 -->
      <div class="store-details">
        <div class="detail-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="detail-icon">
            <path
              d="M10 2C11.3063 2 12.5586 2.5195 13.4805 3.4414C14.4023 4.3633 14.9219 5.6156 14.9219 6.9219C14.9219 10.2656 10 17 10 17S5.0781 10.2656 5.0781 6.9219C5.0781 5.6156 5.5976 4.3633 6.5195 3.4414C7.4414 2.5195 8.6937 2 10 2Z"
              stroke="#555555"
              stroke-width="1.5"
            />
            <circle cx="10" cy="7" r="2" fill="#555555" />
          </svg>
          <p class="detail-text">{{ store.address }}</p>
        </div>

        <div class="detail-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="detail-icon">
            <circle cx="10" cy="10" r="8" stroke="#555555" stroke-width="1.5" />
            <path d="M10 6V10L13 13" stroke="#555555" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <p class="detail-text">
            <span class="status" :class="{ open: store.isOpen, closed: !store.isOpen }">
              {{ store.isOpen ? '영업중' : '영업종료' }}
            </span>
            · {{ store.hours }}
          </p>
        </div>

        <div class="detail-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="detail-icon">
            <path
              d="M18 15.5C18 16.88 16.88 18 15.5 18C14.12 18 13 16.88 13 15.5C13 14.12 14.12 13 15.5 13C16.88 13 18 14.12 18 15.5Z"
              stroke="#555555"
              stroke-width="1.5"
            />
            <path
              d="M2 3H4L6 13H16"
              stroke="#555555"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="detail-text">{{ store.phone }}</p>
        </div>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="tab-navigation">
        <button
          :class="{ active: activeTab === 'info' }"
          @click="setActiveTab('info')"
          class="tab-button"
        >
          매장정보
        </button>
        <button
          :class="{ active: activeTab === 'partner' }"
          @click="setActiveTab('partner')"
          class="tab-button"
        >
          제휴가게
        </button>
      </div>

      <!-- 탭 콘텐츠 -->
      <div class="tab-content">
        <!-- 매장정보 탭 -->
        <div v-if="activeTab === 'info'" class="info-tab">
          <!-- 리뷰 섹션 -->
          <div class="reviews-section">
            <div class="reviews-header">
              <div class="reviews-title-row">
                <h3 class="reviews-title">리뷰</h3>
                <span class="reviews-count">{{ reviews.length }}</span>
              </div>
              <button @click="openReviewModal" class="write-review-button">리뷰 작성</button>
            </div>

            <!-- 리뷰 리스트 -->
            <div v-if="reviews.length > 0" class="reviews-list">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <div class="reviewer-avatar">
                      {{ review.userInitial }}
                    </div>
                    <span class="reviewer-name">{{ review.userName }}</span>
                  </div>

                  <div class="review-meta">
                    <div class="review-rating">
                      <svg
                        v-for="star in 5"
                        :key="star"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                          :fill="star <= review.rating ? '#F59E0B' : '#E5E7EB'"
                        />
                      </svg>
                    </div>
                    <span class="review-date">{{ review.createdAt }}</span>
                  </div>
                </div>

                <p class="review-comment">{{ review.comment }}</p>
              </div>
            </div>

            <div v-else class="empty-reviews">
              <p>아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!</p>
            </div>
          </div>
        </div>

        <!-- 제휴가게 탭 -->
        <div v-if="activeTab === 'partner'" class="partner-tab">
          <div class="partner-info">
            <h3>제휴 혜택</h3>
            <div v-if="store.hasDiscount" class="discount-card">
              <div class="discount-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12ZM3 12C3 13.1046 3.89543 14 5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12ZM8 12H16H8Z"
                    stroke="#017F58"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <div class="discount-content">
                <h4>할인 쿠폰</h4>
                <p>{{ store.discount }}</p>
                <button @click="getCoupon" class="get-coupon-button">쿠폰 받기</button>
              </div>
            </div>

            <div v-else class="no-discount">
              <p>현재 진행 중인 제휴 혜택이 없습니다.</p>
            </div>
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
      <button @click="$router.back()" class="back-button">돌아가기</button>
    </div>

    <!-- 하단 네비게이션 -->
    <CustomerBottomNavigation />

    <!-- 리뷰 모달 -->
    <ReviewModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import CustomerTopBar from '@/components/common/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/common/CustomerBottomNavigation.vue'
import ReviewModal from '@/components/store/ReviewModal.vue'
import { useStoresStore } from '@/stores/stores'
import { useReviewsStore } from '@/stores/reviews'

const route = useRoute()
const router = useRouter()
const storesStore = useStoresStore()
const reviewsStore = useReviewsStore()

// 반응형 상태
const activeTab = ref('info')
const isLoading = ref(true)

// 스토어에서 상태 가져오기 - storeToRefs 사용
const { selectedStore } = storeToRefs(storesStore)
const store = computed(() => selectedStore.value)

// 리뷰 상태
const reviews = computed(() => {
  return reviewsStore.reviewsByStore(parseInt(route.params.id))
})

// 카테고리 이름 변환
const getCategoryName = (type) => {
  const categories = {
    restaurant: '음식점',
    cafe: '카페',
    retail: '소매점',
  }
  return categories[type] || '매장'
}

// 탭 변경
const setActiveTab = (tab) => {
  activeTab.value = tab
}

// 리뷰 모달 열기
const openReviewModal = () => {
  if (store.value) {
    reviewsStore.openReviewModal(store.value.id, store.value.name)
  }
}

// 쿠폰 받기
const getCoupon = () => {
  if (store.value) {
    console.log('쿠폰 받기:', store.value.name)
    alert(`${store.value.name}의 쿠폰을 받았습니다!`)
  }
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

    // 리뷰 정보 로드
    await reviewsStore.fetchReviews(storeId)
  } catch (error) {
    console.error('매장 정보 로드 실패:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.store-detail-page {
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

.store-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-text {
  color: #374151;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  margin: 0;
}

.status {
  font-weight: 500;
}

.status.open {
  color: #059669;
}

.status.closed {
  color: #dc2626;
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
  transition: all 0.2s ease;
}

.tab-button.active {
  background-color: #ffffff;
  box-shadow:
    0px 1px 2px -1px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-content {
  flex: 1;
}

.reviews-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reviews-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviews-title {
  color: #0a0a0a;
  font-family: 'Pretendard-Bold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
  margin: 0;
}

.reviews-count {
  color: #666;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
}

.write-review-button {
  color: #017f58;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  box-shadow:
    0px 1px 2px -1px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  background-color: #f4f4f4;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0a;
  font-family: 'Geist-Regular', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.reviewer-name {
  color: #0a0a0a;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-date {
  color: #99a1ae;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.review-comment {
  color: #495565;
  font-family: 'Pretendard-Light', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  margin: 0;
  white-space: pre-line;
}

.empty-reviews {
  text-align: center;
  padding: 40px 16px;
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
}

.partner-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.partner-info h3 {
  color: #0a0a0a;
  font-family: 'Noto Sans KR-Bold', Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  margin: 0 0 16px 0;
}

.discount-card {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.discount-icon {
  flex-shrink: 0;
  background-color: #d0fae4;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.discount-content {
  flex: 1;
}

.discount-content h4 {
  color: #0a0a0a;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0 0 8px 0;
}

.discount-content p {
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  line-height: 20px;
  margin: 0 0 16px 0;
}

.get-coupon-button {
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
}

.get-coupon-button:hover {
  background-color: #016a4a;
}

.no-discount {
  text-align: center;
  padding: 40px 16px;
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
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
