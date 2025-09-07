<template>
  <div class="proposal-message">
    <div class="proposal-header">
      <h4>제휴 제안</h4>
      <span class="proposal-time">{{ formatTime(message.timestamp) }}</span>
    </div>

    <div class="proposal-content">
      <!-- 쿠폰 비교 섹션 -->
      <div class="coupon-comparison">
        <div class="coupon-item my-coupon">
          <div class="coupon-header">
            <span class="item-name">{{ payload.proposerCoupon.itemName || '아메리카노' }}</span>
            <div class="discount-badge">{{ payload.proposerCoupon.discountPercent }}% 할인</div>
          </div>
          <div class="shop-label">내 매장</div>
        </div>

        <div class="exchange-arrow">↔</div>

        <div class="coupon-item partner-coupon">
          <div class="coupon-header">
            <span class="item-name">{{ payload.recipientCoupon.itemName || '크로와상' }}</span>
            <div class="discount-badge">{{ payload.recipientCoupon.discountPercent }}% 할인</div>
          </div>
          <div class="shop-label">상대 매장</div>
        </div>
      </div>

      <div class="proposal-divider"></div>

      <!-- 상세 정보 -->
      <div class="proposal-details">
        <div class="detail-row">
          <span class="label">발급 수량:</span>
          <span class="value">{{ payload.proposerCoupon.totalQuantity }}개</span>
        </div>
        <div class="detail-row">
          <span class="label">유효기간:</span>
          <span class="value">{{
            formatDateRange(payload.proposerCoupon.startDate, payload.proposerCoupon.endDate)
          }}</span>
        </div>
      </div>

      <!-- 액션 버튼 (받는 사람만 보이도록) -->
      <div v-if="!isMyProposal" class="proposal-actions">
        <button @click="acceptProposal" class="accept-btn">수락</button>
        <button @click="showRejectModal = true" class="reject-btn">거절</button>
      </div>

      <!-- 제안자에게는 상태만 표시 -->
      <div v-else class="proposal-status">
        <span class="status-text">제안 전송됨 (응답 대기중)</span>
      </div>
    </div>

    <!-- 거절 사유 입력 모달 -->
    <div v-if="showRejectModal" class="reject-modal-overlay" @click.self="showRejectModal = false">
      <div class="reject-modal">
        <h3>거절 사유</h3>
        <textarea
          v-model="rejectReason"
          placeholder="거절 사유를 입력해주세요 (선택사항)"
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button @click="rejectProposal" class="confirm-reject-btn">거절</button>
          <button @click="showRejectModal = false" class="cancel-btn">취소</button>
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

const isMyProposal = computed(() => {
  return payload.value.proposerId === props.currentUserId
})

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
    console.log('제안 수락')
  } catch (error) {
    console.error('제안 수락 실패:', error)
    alert('제안 수락에 실패했습니다.')
  }
}

const rejectProposal = () => {
  try {
    rejectBilateralCoupon(payload.value.roomId, rejectReason.value || '사유 없음')
    showRejectModal.value = false
    rejectReason.value = ''
    console.log('제안 거절')
  } catch (error) {
    console.error('제안 거절 실패:', error)
    alert('제안 거절에 실패했습니다.')
  }
}
</script>

<style scoped>
.proposal-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 12px 0;
  color: white;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.proposal-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.proposal-time {
  font-size: 12px;
  opacity: 0.8;
}

.coupon-comparison {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.coupon-item {
  flex: 1;
  text-align: center;
}

.coupon-header {
  margin-bottom: 8px;
}

.item-name {
  display: block;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.discount-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.shop-label {
  font-size: 11px;
  opacity: 0.8;
}

.exchange-arrow {
  font-size: 20px;
  font-weight: bold;
  margin: 0 16px;
}

.proposal-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px 0;
}

.proposal-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  font-size: 13px;
  opacity: 0.9;
}

.value {
  font-size: 13px;
  font-weight: bold;
}

.proposal-actions {
  display: flex;
  gap: 8px;
}

.accept-btn,
.reject-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-btn {
  background: #10b981;
  color: white;
}

.accept-btn:hover {
  background: #059669;
}

.reject-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.reject-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.proposal-status {
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.status-text {
  font-size: 13px;
  opacity: 0.9;
}

.reject-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.reject-modal {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  color: #1f2937;
}

.reject-modal h3 {
  margin: 0 0 16px 0;
  color: #1f2937;
}

.reject-modal textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.confirm-reject-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
</style>
