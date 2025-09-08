<template>
  <div class="proposal-card">
    <!-- 헤더 -->
    <div class="header">
      <span class="check-icon">✔</span>
      <span class="title">제휴 제안</span>
    </div>

    <!-- 쿠폰 비교 -->
    <div class="coupon-comparison">
      <div class="coupon-item">
        <div class="item-name">{{ payload.proposerCoupon.itemName || '아메리카노' }}</div>
        <div class="discount my-discount">{{ payload.proposerCoupon.discountPercent }}% 할인</div>
        <div class="shop-label">내 매장</div>
      </div>

      <div class="exchange-arrow">⇔</div>

      <div class="coupon-item">
        <div class="item-name">{{ payload.recipientCoupon.itemName || '크로와상' }}</div>
        <div class="discount partner-discount">
          {{ payload.recipientCoupon.discountPercent }}% 할인
        </div>
        <div class="shop-label">상대 매장</div>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div class="details">
      <div class="detail-row">
        <span class="label">발급 수량:</span>
        <span class="value">{{ payload.proposerCoupon.totalQuantity }}개</span>
      </div>
      <div class="detail-row">
        <span class="label">유효기간:</span>
        <span class="value">
          {{ payload.proposerCoupon.duration || '30일' }}
        </span>
      </div>
    </div>

    <!-- 버튼 -->
    <div class="actions" v-if="!isMyProposal">
      <button class="accept" @click="acceptProposal">수락</button>
      <button class="reject" @click="showRejectModal = true">거절</button>
    </div>
    <div class="status" v-else>제안 전송됨 (응답 대기중)</div>

    <!-- 거절 모달 -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal">
        <h3>거절 사유</h3>
        <textarea
          v-model="rejectReason"
          placeholder="거절 사유를 입력해주세요 (선택사항)"
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button class="confirm" @click="rejectProposal">거절</button>
          <button class="cancel" @click="showRejectModal = false">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { acceptBilateralCoupon, rejectBilateralCoupon } from '@/api/ws'

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: Number, required: true },
})

const showRejectModal = ref(false)
const rejectReason = ref('')

const payload = computed(() => props.message.payload || {})

const isMyProposal = computed(() => payload.value.proposerId === props.currentUserId)

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('ko-KR')
  const end = new Date(endDate).toLocaleDateString('ko-KR')
  return `${start} ~ ${end}`
}
const acceptProposal = () => {
  try {
    acceptBilateralCoupon(payload.value.roomId)
  } catch (error) {
    alert('제안 수락에 실패했습니다.')
  }
}

const rejectProposal = () => {
  try {
    rejectBilateralCoupon(payload.value.roomId, rejectReason.value || '사유 없음')
    showRejectModal.value = false
    rejectReason.value = ''
  } catch (error) {
    alert('제안 거절에 실패했습니다.')
  }
}
</script>

<style scoped>
.proposal-card {
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 12px;
  padding: 16px;
  width: 280px;
  font-family: sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.check-icon {
  color: #22c55e;
  margin-right: 6px;
  font-size: 14px;
}
.title {
  font-weight: bold;
  color: #064e3b;
}

/* 쿠폰 비교 */
.coupon-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}
.coupon-item {
  text-align: center;
  flex: 1;
}
.item-name {
  font-size: 14px;
  margin-bottom: 4px;
}
.discount {
  font-weight: bold;
  font-size: 16px;
}
.my-discount {
  color: #16a34a;
}
.partner-discount {
  color: #2563eb;
}
.shop-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.exchange-arrow {
  font-size: 18px;
  margin: 0 8px;
}

/* 상세 정보 */
.details {
  font-size: 13px;
  margin: 12px 0;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.label {
  color: #374151;
}
.value {
  font-weight: bold;
}

/* 버튼 */
.actions {
  display: flex;
  gap: 8px;
}
.accept,
.reject {
  flex: 1;
  padding: 8px 0;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}
.accept {
  background: #059669;
  color: white;
}
.reject {
  background: #f3f4f6;
  color: #374151;
}
.status {
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  padding: 6px;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  border-radius: 12px;
  padding: 16px;
  width: 90%;
  max-width: 320px;
}
.modal h3 {
  margin-bottom: 8px;
}
.modal textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
}
.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.confirm {
  flex: 1;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
}
.cancel {
  flex: 1;
  background: #e5e7eb;
  border: none;
  border-radius: 6px;
  padding: 8px;
}
</style>
