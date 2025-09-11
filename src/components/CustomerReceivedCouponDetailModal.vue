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
        <button class="received-coupon-modal__qr-btn" @click="showQRCode">QR코드</button>
      </div>

      <!-- QR 코드 화면 -->
      <div v-else class="received-coupon-modal__qr-content">
        <!-- QR 코드 카드 -->
        <div class="received-coupon-modal__qr-card">
          <div class="received-coupon-modal__qr-info">
            <h2 class="received-coupon-modal__qr-title">{{ coupon.title }}</h2>
            <div class="received-coupon-modal__qr-code">
              <!-- <img src="@/assets/images/qr.png" alt="QR 코드" /> -->
              <div v-if="qrCodeLoading" class="qr-loading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">QR 코드 생성 중...</span>
                </div>
                <p class="mt-2">QR 코드 생성 중...</p>
              </div>
              <img v-else-if="qrCodeData" :src="qrCodeData" alt="QR 코드" />
              <div v-else class="qr-error">
                <i class="material-symbols-outlined text-danger" style="font-size: 48px">error</i>
                <p class="mt-2 text-danger">QR 코드 생성 실패</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 남은 시간 표시 -->
        <div class="received-coupon-modal__time-display">
          <i class="material-symbols-outlined">access_time</i>
          <span>{{ formattedTime }}</span>
        </div>

        <!-- 사용 완료 버튼 -->
        <button class="received-coupon-modal__use-btn" @click="confirmUse">사용 완료</button>
      </div>
    </div>

    <!-- 사용 완료 확인 알림창 -->
    <div v-if="showConfirmModal" class="use-confirm-modal-overlay" @click="closeConfirmModal">
      <div class="use-confirm-modal" @click.stop>
        <div class="use-confirm-modal__content">
          <h3 class="use-confirm-modal__title">직원 전용 확인 버튼입니다</h3>
          <p class="use-confirm-modal__message">
            확인 버튼 클릭 시 쿠폰이 즉시 사용처리 되며,<br />
            다시 되돌릴 수 없습니다.
          </p>
          <div class="use-confirm-modal__buttons">
            <button class="use-confirm-modal__confirm-btn" @click="handleConfirmUse">확인</button>
            <button class="use-confirm-modal__cancel-btn" @click="closeConfirmModal">취소</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createQRcode } from '@/api/customer-coupon.js'
import togethershopLogo from '@/assets/images/togethershop_logo.png'

export default {
  name: 'ReceivedCouponDetailModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    coupon: {
      type: Object,
      default: () => ({
        id: null,
        storeName: '',
        category: '',
        title: '',
        expiryDate: '',
        storeAvatar: togethershopLogo,
        daysLeft: '',
      }),
    },
  },
  emits: ['close', 'showQR', 'useCoupon'],
  setup(props, { emit }) {
    const showQRView = ref(false)
    const showConfirmModal = ref(false)
    const remainingTime = ref(5 * 60) // 5분을 초 단위로 저장
    const qrCodeData = ref(null)
    const qrCodeLoading = ref(false)
    let timeInterval = null

    // 남은 시간을 포맷된 문자열로 변환 (computed)
    const formattedTime = computed(() => {
      const minutes = Math.floor(remainingTime.value / 60)
      const seconds = remainingTime.value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    // QR 코드 보기
    const showQRCode = async () => {
      showQRView.value = true
      remainingTime.value = 5 * 60 // 5분으로 리셋

      // QR 코드 생성
      await generateQRCode()

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

    // QR 코드 생성
    const generateQRCode = async () => {
      try {
        qrCodeLoading.value = true
        qrCodeData.value = null

        // 쿠폰 ID 사용 (couponId 또는 id)
        const couponId = props.coupon.couponId || props.coupon.id
        const response = await createQRcode(couponId)

        console.log('QR 코드 API 응답:', response)

        // API에서 이미 Base64 data URL로 변환된 데이터 사용
        if (response && response.qrCodeData) {
          qrCodeData.value = response.qrCodeData
        } else {
          console.error('QR 코드 데이터를 찾을 수 없습니다:', response)
        }
      } catch (error) {
        console.error('QR 코드 생성 실패:', error)
        qrCodeData.value = null
      } finally {
        qrCodeLoading.value = false
      }
    }

    // 사용 완료 확인 모달 열기
    const confirmUse = () => {
      showConfirmModal.value = true
    }

    // 확인 모달 닫기
    const closeConfirmModal = () => {
      showConfirmModal.value = false
    }

    // 실제 사용 완료 처리
    const handleConfirmUse = () => {
      emit('useCoupon', props.coupon)
      closeConfirmModal()
      closeModal()
    }

    // 모달 닫기
    const closeModal = () => {
      showQRView.value = false
      qrCodeData.value = null
      qrCodeLoading.value = false
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
      showConfirmModal,
      remainingTime,
      formattedTime,
      qrCodeData,
      qrCodeLoading,
      showQRCode,
      confirmUse,
      closeConfirmModal,
      handleConfirmUse,
      closeModal,
    }
  },
}
</script>

<style>
@import '../styles/customer-received-coupon-detail-modal.css';

/* QR 코드 로딩 및 에러 상태 스타일 */
.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.qr-loading p {
  white-space: nowrap; /* 줄바꿈 금지 */
  margin-top: 0.5rem;
}

.qr-loading .spinner-border {
  width: 3rem;
  height: 3rem;
}

.qr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.qr-error i {
  color: #dc3545;
}

.qr-error p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
