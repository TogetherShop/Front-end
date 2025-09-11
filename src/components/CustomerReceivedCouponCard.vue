<template>
  <div class="received-coupon-card mb-3" @click="handleCardClick">
    <div class="received-coupon-card__container">
      <div class="received-coupon-card__body">
        <div class="row g-0">
          <div class="col-12 p-3">
            <div class="received-coupon-card__header d-flex align-items-center mb-0">
              <h6 class="received-coupon-card__store-name mb-0 ">{{ coupon.storeName }}</h6>
              <span class="received-coupon-card__category-badge ms-2">{{ coupon.category }}</span>
            </div>

            <div class="received-coupon-card__coupon-info d-flex align-items-center justify-content-between mb-2">
              <div class="d-flex align-items-center">
                <i class="material-symbols-outlined me-2 received-coupon-card__coupon-icon" style="font-size: 16px">local_play</i>
                <span class="received-coupon-card__coupon-title ">{{ coupon.title }}</span>
              </div>
              <div class="received-coupon-card__days-left">
                <span class="received-coupon-card__days-text">{{ coupon.daysLeft }}</span>
              </div>
            </div>

            <div class="received-coupon-card__expiry-right">
              <i class="material-symbols-outlined me-1" style="font-size: 16px">access_time</i>
              <small class="received-coupon-card__expiry-date">{{ coupon.expiryDate }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReceivedCouponCard',
  props: {
    coupon: {
      type: Object,
      required: true,
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleCardClick = () => {
      emit('click', props.coupon.id)
    }

    return {
      handleCardClick,
    }
  },
}
</script>

<style scoped>
/* ���� ���� ī�� ��Ÿ���� coupon.css���� ���� */
</style>
