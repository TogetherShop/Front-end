<template>
  <div class="business-store-card" @click="onViewDetail">
    <div class="store-card-content">
      <!-- 매장 이미지 -->
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

      <!-- 매장 정보 -->
      <div class="store-info">
        <div class="store-header">
          <div class="store-name-category">
            <h3 class="store-name">{{ store.businessName }}</h3>
            <span class="store-category">{{ store.businessCategory }}</span>
          </div>
        </div>

        <div class="store-details">
          <!-- 거리 정보 -->
          <div class="detail-item">
            <span class="material-symbols-outlined">location_on</span>
            <span class="detail-text">{{ formatDistance(store.address).slice(0, 6) + '...'}}</span>
          </div>

          <!-- 함께지수 정보 -->
          <div class="detail-item">
            <span class="material-symbols-outlined star-icon">star</span>
            <span class="detail-text">{{ store.togetherScore }}</span>
          </div>
        </div>

        <!-- 쿠폰 정보 -->
        <div class="coupon-info">
          <span class="material-symbols-outlined coupon-icon">bolt</span>
          <!-- 쿠폰 있음 (축약 표시) -->
          <span v-if="latestCoupon" class="coupon-text">{{ truncateCouponText(latestCoupon.description) }}</span>
          <!-- 쿠폰 없음 -->
          <span v-else class="coupon-text no-coupon">쿠폰 정보 없음</span>
        </div>
      </div>

      <!-- 요청 버튼 -->
      <div class="action-section">
        <button
          class="request-button"
          :disabled="!store.isPartnershipAvailable"
          @click.stop="onRequestPartnership"
        >
          <span class="material-symbols-outlined request-icon">handshake</span>
          {{ store.isPartnershipAvailable ? '요청' : '요청됨' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { getLatestBusinessCoupon } from '@/api/business-coupon'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['request-partnership', 'view-detail'])

// 쿠폰 관련 상태 (로딩 상태 제거)
const latestCoupon = ref(null)

// 최신 쿠폰 조회 (로딩 상태 없이 백그라운드에서 처리)
const loadLatestCoupon = async () => {
  if (!props.store?.businessId && !props.store?.id) {
    console.warn('BusinessId가 없어서 쿠폰을 조회할 수 없습니다:', props.store)
    return
  }

  try {
    const businessId = props.store.businessId || props.store.id

    console.log('🔍 매장 카드 쿠폰 조회:', businessId)
    const coupon = await getLatestBusinessCoupon(businessId)

    latestCoupon.value = coupon
    console.log('✅ 매장 카드 쿠폰 조회 완료:', coupon)
  } catch (error) {
    console.error('❌ 매장 카드 쿠폰 조회 실패:', error)
    latestCoupon.value = null
  }
}

// 거리 포맷팅
const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`
  }
  return `${distance}m`
}

// 쿠폰 텍스트 축약 함수
const truncateCouponText = (text) => {
  if (!text) return ''

  // 최대 길이 설정 (카드 크기에 맞게 조정)
  const maxLength = 12

  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}

const onRequestPartnership = () => {
  if (props.store.isPartnershipAvailable) {
    emit('request-partnership', props.store)
  }
}

const onViewDetail = () => {
  emit('view-detail', props.store)
}

// store prop이 변경될 때마다 쿠폰 다시 로드
watchEffect(() => {
  if (props.store?.businessId || props.store?.id) {
    loadLatestCoupon()
  }
})

onMounted(() => {
  loadLatestCoupon()
})
</script>

<style scoped>
@import '@/styles/business-store-card.css';

/* 쿠폰 상태별 스타일 */
.coupon-text.no-coupon {
  color: #9ca3af;
}
</style>
