<template>
  <div class="business-store-card" @click="onViewDetail">
    <div class="store-card-content">
      <!-- 매장 이미지 -->
      <div class="store-image">
        <img v-if="store.image" :src="store.image" :alt="store.name" class="store-img" />
        <div v-else class="store-img-placeholder">
          <span class="material-symbols-outlined">store</span>
        </div>
      </div>

      <!-- 매장 정보 -->
      <div class="store-info">
        <div class="store-header">
          <div class="store-name-category">
            <h3 class="store-name">{{ BusinessnameText(store.businessName) }}</h3>
            <span class="store-category">{{ store.businessCategory }}</span>
          </div>
        </div>

        <div class="store-details">
          <!-- 거리 정보 -->
          <div class="detail-item">
            <span class="material-symbols-outlined">location_on</span>
            <span class="detail-text">
              {{ store.distanceText || formatAddressDistance() }}
            </span>
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
          <span v-if="latestCoupon" class="coupon-text">{{
            truncateCouponText(latestCoupon.description)
          }}</span>
          <!-- 쿠폰 없음 -->
          <span v-else class="coupon-text no-coupon">쿠폰 정보 없음</span>
        </div>
      </div>

      <!-- 요청 버튼 -->
      <div class="action-section">
        <button class="request-button" :disabled="store.partnershipExists" @click="handleRequest">
          <span class="material-symbols-outlined request-icon">handshake</span>
          {{ store.partnershipExists ? '요청됨' : '요청' }}
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
    required: true,
  },
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

// 거리 포맷팅 (실제 거리가 없을 경우 주소로 대체)
const formatAddressDistance = () => {
  if (!props.store?.address) return '거리 정보 없음'

  const address = props.store.address
  if (address.length > 15) {
    return address.slice(0, 12) + '...'
  }
  return address
}

const BusinessnameText = (text) => {
  if (!text) return ''
  // 최대 길이 설정 (카드 크기에 맞게 조정)
  const maxLength = 9
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, 7) + '...'
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

const handleRequest = async () => {
  if (props.store.partnershipExists) return
  loading.value = true
  try {
    // 부모에게 이벤트 emit → 모달 사용 여부 결정 가능
    emit('request-partnership', props.store)
  } finally {
    loading.value = false
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
