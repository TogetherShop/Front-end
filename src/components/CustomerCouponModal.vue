<template>
  <div v-if="isVisible" class="coupon-modal-overlay" @click="closeModal">
    <div class="coupon-modal" @click.stop>
      <!-- 모달 헤더 -->
      <div class="coupon-modal__header">
        <div class="coupon-modal__store-info">
          <div class="coupon-modal__store-avatar">
            <img :src="coupon.storeAvatar || togethershopLogo" :alt="coupon.storeName" />
            <!-- 디버깅용 -->
            <div v-if="!coupon.storeAvatar && !togethershopLogo" style="color: red; font-size: 12px;">No Avatar</div>
          </div>
          <div class="coupon-modal__store-details">
            <h3 class="coupon-modal__store-name">{{ coupon.storeName }}</h3>
            <p class="coupon-modal__store-category">{{ coupon.category }}</p>
          </div>
        </div>
        <button class="coupon-modal__close-btn" @click="closeModal">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>

      <!-- 쿠폰 정보 카드 -->
      <div class="coupon-modal__coupon-card">
        <div class="coupon-modal__coupon-info">
          <h2 class="coupon-modal__coupon-title">{{ coupon.title }}</h2>
          <div class="coupon-modal__coupon-expiry">
            <i class="material-symbols-outlined">access_time</i>
            <span>{{ coupon.expiryDate }}</span>
          </div>
        </div>
      </div>

      <!-- 이용 안내 -->
      <div class="coupon-modal__notice">
        <h4 class="coupon-modal__notice-title">이용 안내</h4>
        <p class="coupon-modal__notice-text">· 제휴 가게 중 하나의 쿠폰만 다운로드 가능합니다.</p>
      </div>

      <!-- 다운로드 버튼 -->
      <button class="coupon-modal__download-btn" @click="handleDownload">
        쿠폰 다운로드
      </button>
    </div>
  </div>
</template>

<script>
import togethershopLogo from '@/assets/images/togethershop_logo.png'

export default {
  name: 'CouponModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    coupon: {
      type: Object,
      default: () => ({
        id: null,
        storeName: '',
        category: '',
        title: '',
        expiryDate: '',
        storeAvatar: togethershopLogo
      })
    }
  },
  emits: ['close', 'download'],
  data() {
    return {
      togethershopLogo
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    handleDownload() {
      this.$emit('download', this.coupon)
    }
  }
}
</script>

<style>
@import '../styles/customer-couponmodal.css';
</style>
