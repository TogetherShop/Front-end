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
            <h3 class="store-name">{{ store.name }}</h3>

            <div class="store-info-row">
              <span class="store-category">{{ store.category }}</span>
              <span class="divider">|</span>
              <div class="together-score">
                <span class="material-symbols-outlined star-icon">star</span>
                <span>{{ store.togetherScore }}</span>
              </div>
            </div>

            <div class="store-location-row">
              <span class="material-symbols-outlined">location_on</span>
              <span>{{ formatDistance(store.distance) }} | 경기도 어딘가 진짜구</span>
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

          <div class="coupon-list">
            <div class="coupon-item">
              <span class="coupon-text">월 10% 할인 쿠폰</span>
            </div>
            <div class="coupon-item">
              <span class="coupon-text">월 10% 할인 쿠폰</span>
            </div>
            <div class="coupon-item">
              <span class="coupon-text">월 10% 할인 쿠폰</span>
            </div>
          </div>
        </div>
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

const emit = defineEmits(['close', 'request-partnership'])

const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`
  }
  return `${distance}m`
}

const closeModal = () => {
  emit('close')
}

const requestPartnership = () => {
  emit('request-partnership', props.store)
}
</script>

<style scoped>
@import '@/styles/business-store-detail-modal.css';
</style>
