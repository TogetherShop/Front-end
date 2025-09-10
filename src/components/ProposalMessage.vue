<template>
  <div class="proposal-card" v-if="payload">
    <!-- 헤더 -->
    <div class="header">
      <span class="check-icon">✔</span>
      <span class="title">제휴 제안</span>
    </div>

    <!-- 쿠폰 비교 -->
    <div class="coupon-comparison">
      <div class="coupon-item">
        <div class="item-name">{{ payload.proposerCoupon?.itemName || '아메리카노' }}</div>
        <div class="discount my-discount">
          {{ payload.proposerCoupon?.discountPercent || 0 }}% 할인
        </div>
        <div class="shop-label">내 매장</div>
      </div>

      <div class="exchange-arrow">⇔</div>

      <div class="coupon-item">
        <div class="item-name">{{ payload.recipientCoupon?.itemName || '크로와상' }}</div>
        <div class="discount partner-discount">
          {{ payload.recipientCoupon?.discountPercent || 0 }}% 할인
        </div>
        <div class="shop-label">상대 매장</div>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div class="details">
      <div class="detail-row">
        <span class="label">발급 수량:</span>
        <span class="value">{{ payload.proposerCoupon?.totalQuantity || 0 }}개</span>
      </div>
      <div class="detail-row">
        <span class="label">유효기간:</span>
        <span class="value">{{ payload.proposerCoupon?.duration || '30일' }}</span>
      </div>
    </div>

    <!-- 버튼 -->
    <div
      class="actions"
      v-if="
        message.type === 'COUPON_PROPOSAL' &&
        payload?.status === 'REQUESTED' &&
        message.senderId !== currentUserId
      "
    >
      <button class="accept" @click="acceptProposal">수락</button>
      <button class="reject" @click="rejectProposal">거절</button>
    </div>
    <div class="status" v-else>{{ statusLabel }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { acceptBilateralCoupon, rejectBilateralCoupon } from '@/api/ws'

const props = defineProps({
  message: { type: Object, required: true },
  currentUserId: { type: Number, required: true },
})
const emit = defineEmits(['reject-click'])
const showRejectModal = ref(false)
const payload = computed(() => props.message?.payload || null)

const localRejected = ref(false)
const acceptProposal = async () => {
  try {
    await acceptBilateralCoupon(props.message.id) // WS 전송
    payload.value.status = 'COMPLETED' // 로컬 업데이트
  } catch (err) {
    console.error('수락 실패', err)
  }
}
const rejectProposal = async () => {
  try {
    await rejectBilateralCoupon(props.message.id, '사용자가 거절함')

    // 메시지 카드 전용 상태만 변경
    payload.value.status = 'REJECTED'
  } catch (err) {
    alert('이 메시지 제안 거절 실패')
    console.error(err)
  }
}
const statusLabel = computed(() => {
  const status = payload.value?.status
  switch (status) {
    case 'ACCEPTED':
      return '협의 완료됨'
    case 'REJECTED':
      return '협의 거절됨'
    case 'REQUESTED':
    default:
      return '제안 전송됨 (응답 대기중)'
  }
})
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
.accept:hover {
  background: #047857;
}
.reject {
  background: #f3f4f6;
  color: #374151;
}
.reject:hover {
  background: #e5e7eb;
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
  z-index: 9999;
}
.modal {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 320px;
  min-height: 120px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal h3 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}
.modal textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}
.modal textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  cursor: pointer;
  font-weight: bold;
}
.confirm:hover {
  background: #b91c1c;
}
.cancel {
  flex: 1;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  font-weight: bold;
}
.cancel:hover {
  background: #d1d5db;
}
</style>
