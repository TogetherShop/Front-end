<template>
  <div class="coupon-card mb-3">
    <div class="coupon-card__container">
      <div class="coupon-card__body">
        <div class="row g-0">
          <!-- 쿠폰 정보 영역 -->
          <div class="col-8 p-3">
            <div class="coupon-card__header d-flex align-items-center mb-2">
              <h6 class="coupon-card__store-name mb-0 fw-bold">{{ coupon.storeName }}</h6>
              <span class="coupon-card__category-badge ms-1">{{ coupon.category }}</span>
            </div>

            <div class="coupon-card__coupon-info d-flex align-items-center mb-2">
              <i class="material-symbols-outlined me-2 coupon-card__coupon-icon" style="font-size: 16px">local_play</i>
              <span class="coupon-card__coupon-title fw-semibold">{{ coupon.title }}</span>
            </div>

            <div class="coupon-card__expiry d-flex align-items-center">
              <i class="material-symbols-outlined me-1" style="font-size: 14px">access_time</i>
              <small class="coupon-card__expiry-date">{{ coupon.expiryDate }}</small>
            </div>
          </div>

          <!-- 쿠폰 액션 영역 -->
          <div class="col-4 p-0">
            <div
              class="coupon-card__action-area h-100 d-flex flex-column justify-content-between align-items-center position-relative"
              @click="handleClaim"
              :class="{ 'coupon-card__action-area--clickable': !isReceived && coupon.remainingCount > 0 }"
            >
              <!-- 남은 수량 아이콘 (중심) -->
              <div
                v-if="!isReceived && coupon.remainingCount > 0"
                class="coupon-card__remaining-icon"
              >
                <i class="material-symbols-outlined" style="font-size: 30px"
                  >vertical_align_bottom</i
                >
              </div>
              
              <!-- 남은 수량 라벨 (하단) -->
              <div
                v-if="!isReceived && coupon.remainingCount > 0"
                class="coupon-card__remaining-label-container"
              >
                <small class="coupon-card__remaining-label d-block">남은 수량 {{ coupon.remainingCount }}개</small>
              </div>

              <!-- 발급 완료 표시 -->
              <div v-else-if="isReceived" class="coupon-card__claimed-status">
                <i class="material-symbols-outlined text-success mb-1" style="font-size: 24px"
                  >check_circle</i
                >
                <div class="text-center">
                  <small class="coupon-card__claimed-text text-success fw-semibold"
                    >발급 완료</small
                  >
                </div>
              </div>

              <!-- 수량 부족 표시 -->
              <div v-else class="coupon-card__out-of-stock">
                <i class="material-symbols-outlined text-muted mb-1" style="font-size: 24px"
                  >block</i
                >
                <div class="text-center">
                  <small class="coupon-card__out-of-stock-text text-muted">수량 부족</small>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'CouponCard',
  props: {
    coupon: {
      type: Object,
      required: true,
    },
    isReceived: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['claim'],
  setup(props, { emit }) {
    const isClaiming = ref(false)

    const handleClaim = async () => {
      if (props.coupon.remainingCount <= 0) return

      isClaiming.value = true

      try {
        // 실제로는 API 호출
        await new Promise((resolve) => setTimeout(resolve, 1000))
        emit('claim', props.coupon.id)
      } catch (error) {
        console.error('쿠폰 발급 실패:', error)
      } finally {
        isClaiming.value = false
      }
    }

    return {
      isClaiming,
      handleClaim,
    }
  },
}
</script>

<style scoped>
/* 쿠폰 카드 스타일은 coupon.css에서 관리 */
</style>
