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

        <!-- 쿠폰 설명 -->
        <div class="coupon-info">
          <span class="material-symbols-outlined coupon-icon">bolt</span>
          <span class="coupon-text">{{ store.couponDescription || '쿠폰 정보 없음' }}</span>
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
const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['request-partnership', 'view-detail'])

const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`
  }
  return `${distance}m`
}

const onRequestPartnership = () => {
  if (props.store.isPartnershipAvailable) {
    emit('request-partnership', props.store)
  }
}

const onViewDetail = () => {
  emit('view-detail', props.store)
}
</script>

<style scoped>
@import '@/styles/business-store-card.css';
</style>
