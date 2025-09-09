<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="store-detail-modal" @click.stop>
      <div class="modal-content">
        <!-- 닫기 버튼 -->
        <button class="close-button" @click="closeModal">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- 매장 정보 -->
        <div class="store-info-section">
          <div class="store-image">
            <img
              v-if="store.image"
              :src="store.image"
              :alt="store.name"
              class="store-img"
            />
            <div v-else class="store-img-placeholder">
              <span class="material-symbols-outlined">store</span>
            </div>
          </div>

          <div class="store-details">
            <h3 class="store-name">{{ store.businessName || store.name }}</h3>

            <div class="store-info-row">
              <span class="store-category">{{ store.businessCategory || store.category }}</span>
              <span class="divider">|</span>
              <div class="together-score">
                <span class="material-symbols-outlined star-icon">star</span>
                <span>{{ store.togetherScore }}</span>
              </div>
            </div>

            <div class="store-address">
              <span class="material-symbols-outlined">location_on</span>
              <span>{{ store.address}}</span>
            </div>
          </div>
        </div>

        <!-- 제휴 요청 버튼 -->
        <button class="partnership-request-btn" @click="requestPartnership">
          <span class="material-symbols-outlined">handshake</span>
          제휴 요청
        </button>

        <!-- 이 가게의 제휴 쿠폰 -->
        <div class="coupon-section">
          <div class="coupon-header">
            <span class="material-symbols-outlined">redeem</span>
            <span class="coupon-title">이 가게의 제휴 쿠폰</span>
          </div>

          <!-- 쿠폰 리스트 (로딩 스피너 제거됨) -->
          <div v-if="recentCoupons.length > 0" class="coupon-list">
            <div
              v-for="coupon in recentCoupons"
              :key="coupon.templateId"
              class="coupon-item"
            >
              <div class="coupon-content">
                <span class="coupon-text">{{ truncateCouponText(coupon.description) }}</span>
                <div class="coupon-meta">
                  <span class="coupon-quantity">{{ coupon.currentQuantity }}/{{ coupon.totalQuantity }}개 남음</span>
                  <span v-if="coupon.endDate" class="coupon-expire">{{ formatDate(coupon.endDate) }}까지</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 쿠폰 없음 -->
          <div v-else class="coupon-empty">
            <span class="material-symbols-outlined empty-icon">inventory_2</span>
            <p>현재 제공 중인 쿠폰이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { getRecentBusinessCoupons } from '@/api/business-coupon'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'request-partnership'])

// 쿠폰 관련 상태 (로딩 상태 제거)
const recentCoupons = ref([])

// 최근 쿠폰 조회 (로딩 상태 없이 백그라운드에서 처리)
const loadRecentCoupons = async () => {
  if (!props.store?.businessId && !props.store?.id) {
    console.warn('BusinessId가 없어서 쿠폰을 조회할 수 없습니다:', props.store)
    return
  }

  try {
    const businessId = props.store.businessId || props.store.id

    console.log('🔍 상세 모달 쿠폰 조회:', businessId)
    const coupons = await getRecentBusinessCoupons(businessId)

    recentCoupons.value = coupons || []
    console.log('✅ 상세 모달 쿠폰 조회 완료:', coupons)
  } catch (error) {
    console.error('❌ 상세 모달 쿠폰 조회 실패:', error)
    recentCoupons.value = []
  }
}

// 쿠폰 텍스트 축약 함수 (모달용 - 조금 더 길게)
const truncateCouponText = (text) => {
  if (!text) return ''

  // 모달에서는 조금 더 길게 표시
  const maxLength = 20

  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}


// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}.${day}`
  } catch (error) {
    return ''
  }
}

const closeModal = () => {
  emit('close')
}

const requestPartnership = () => {
  emit('request-partnership', props.store)
}

// store prop이 변경될 때마다 쿠폰 다시 로드
watchEffect(() => {
  if (props.store?.businessId || props.store?.id) {
    loadRecentCoupons()
  }
})

onMounted(() => {
  loadRecentCoupons()
})
</script>

<style scoped>
@import '@/styles/business-store-detail-modal.css';

/* 쿠폰 빈 상태 */
.coupon-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.coupon-empty p {
  font-size: 0.875rem;
  margin: 0;
}

/* 쿠폰 아이템 개선 */
.coupon-content {
  width: 100%;
}

.coupon-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.coupon-quantity {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.coupon-expire {
  font-weight: 500;
}
</style>
