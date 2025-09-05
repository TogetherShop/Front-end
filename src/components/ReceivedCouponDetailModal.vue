<template>
  <div v-if="isVisible" class="received-coupon-modal-overlay" @click="closeModal">
    <div class="received-coupon-modal" @click.stop>
      <!-- 모달 헤더 -->
      <div class="received-coupon-modal__header">
        <div class="received-coupon-modal__store-info">
          <div class="received-coupon-modal__store-avatar">
            <img :src="coupon.storeAvatar" alt="매장 로고" />
          </div>
          <div class="received-coupon-modal__store-details">
            <h3 class="received-coupon-modal__store-name">{{ coupon.storeName }}</h3>
            <p class="received-coupon-modal__store-category">{{ coupon.category }}</p>
          </div>
        </div>
        <button class="received-coupon-modal__close-btn" @click="closeModal">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>

      <!-- 쿠폰 상세 정보 화면 -->
      <div v-if="!showQRView" class="received-coupon-modal__content">
        <!-- 쿠폰 정보 카드 -->
        <div class="received-coupon-modal__coupon-card">
          <div class="received-coupon-modal__coupon-info">
            <h2 class="received-coupon-modal__coupon-title">{{ coupon.title }}</h2>
            <div class="received-coupon-modal__coupon-expiry">
              <i class="material-symbols-outlined">access_time</i>
              <span>{{ coupon.expiryDate }}</span>
            </div>
          </div>
        </div>

        <!-- 이용 안내 -->
        <div class="received-coupon-modal__notice">
          <h4 class="received-coupon-modal__notice-title">이용 안내</h4>
          <div class="received-coupon-modal__notice-content">
            <p>· 매장에서 결제 시 쿠폰을 제시해주세요</p>
            <p>· 다른 할인과 중복 사용 불가</p>
            <p>· 1인 1회 사용 가능</p>
            <p>· 유효기간 내에만 사용 가능</p>
          </div>
        </div>

        <!-- QR 코드 버튼 -->
        <button class="received-coupon-modal__qr-btn" @click="showQRCode">
          QR코드
        </button>
      </div>

      <!-- QR 코드 화면 -->
      <div v-else class="received-coupon-modal__qr-content">
        <!-- QR 코드 카드 -->
        <div class="received-coupon-modal__qr-card">
          <div class="received-coupon-modal__qr-info">
            <h2 class="received-coupon-modal__qr-title">{{ coupon.title }}</h2>
            <div class="received-coupon-modal__qr-code">
              <img src="@/assets/images/qr.png" alt="QR 코드" />
            </div>
          </div>
        </div>

        <!-- 남은 시간 표시 -->
        <div class="received-coupon-modal__time-display">
          <i class="material-symbols-outlined">access_time</i>
          <span>{{ formattedTime }}</span>
        </div>

        <!-- 사용 완료 버튼 -->
        <button class="received-coupon-modal__use-btn" @click="confirmUse">
          사용 완료
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ReceivedCouponDetailModal',
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
        storeAvatar: '',
        daysLeft: ''
      })
    }
  },
  emits: ['close', 'showQR', 'useCoupon'],
  setup(props, { emit }) {
    const showQRView = ref(false)
    const remainingTime = ref(5 * 60) // 5분을 초 단위로 저장
    let timeInterval = null

    // 남은 시간을 포맷된 문자열로 변환 (computed)
    const formattedTime = computed(() => {
      const minutes = Math.floor(remainingTime.value / 60)
      const seconds = remainingTime.value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    // QR 코드 보기
    const showQRCode = () => {
      showQRView.value = true
      remainingTime.value = 5 * 60 // 5분으로 리셋
      // 1초마다 시간 업데이트
      timeInterval = setInterval(() => {
        if (remainingTime.value > 0) {
          remainingTime.value--
        } else {
          clearInterval(timeInterval)
          timeInterval = null
        }
      }, 1000)
    }

    // 사용 완료 확인
    const confirmUse = () => {
      if (confirm('정말로 쿠폰을 사용하시겠습니까?')) {
        emit('useCoupon', props.coupon)
        closeModal()
      }
    }

    // 모달 닫기
    const closeModal = () => {
      showQRView.value = false
      if (timeInterval) {
        clearInterval(timeInterval)
        timeInterval = null
      }
      emit('close')
    }

    // 컴포넌트 언마운트 시 인터벌 정리
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      showQRView,
      remainingTime,
      formattedTime,
      showQRCode,
      confirmUse,
      closeModal
    }
  }
}
</script>

<style>
@import '../styles/received-coupon-detail-modal.css';
</style>