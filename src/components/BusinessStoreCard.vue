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
            <h3 class="store-name">{{ store.name }}</h3>
            <span class="store-category">{{ store.category }}</span>
          </div>
        </div>

        <div class="store-details">
          <!-- 거리 정보 -->
          <div class="detail-item">
            <span class="material-symbols-outlined">location_on</span>
            <span class="detail-text">{{ formatDistance(store.distance) }}</span>
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
        <button class="request-button" :disabled="store.partnershipExists" @click="handleRequest">
          <span class="material-symbols-outlined request-icon">handshake</span>
          {{ store.partnershipExists ? '요청됨' : '요청' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const loading = ref(false)
const props = defineProps({
  store: {
    type: Object,
    required: true,
  },
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
</script>

<style scoped>
@import '@/styles/business-store-card.css';
</style>
