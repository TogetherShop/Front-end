<template>
  <div v-if="visible" class="bottom-modal-overlay" @click.self="close">
    <div class="bottom-modal">
      <h3 class="modal-title">제휴 조건 설정</h3>
      <p class="modal-desc">1:1 쿠폰 교환 원칙에 따라 조건을 설정해주세요</p>

      <!-- 쿠폰 입력 -->
      <div class="row">
        <div class="col">
          <label class="input-label">내 쿠폰</label>
          <input type="text" v-model="myItem" placeholder="품목 입력" class="input-box" />
        </div>
        <div class="col">
          <label class="input-label">상대 쿠폰</label>
          <input type="text" v-model="partnerItem" placeholder="품목 입력" class="input-box" />
        </div>
      </div>

      <!-- 할인율 슬라이더 -->
      <div class="row">
        <div class="col">
          <label class="input-label">내 할인율: {{ myDiscount }}%</label>
          <input type="range" v-model.number="myDiscount" min="1" max="100" class="slider" />
        </div>
        <div class="col">
          <label class="input-label">상대 할인율: {{ partnerDiscount }}%</label>
          <input type="range" v-model.number="partnerDiscount" min="1" max="100" class="slider" />
        </div>
      </div>

      <!-- 발급 수량 + 유효기간 -->
      <div class="row">
        <div class="col">
          <label class="input-label">발급 수량</label>
          <input type="number" v-model.number="quantity" min="1" class="input-box" />
        </div>
        <div class="col">
          <label class="input-label">유효기간 (일)</label>
          <input type="number" v-model.number="validDays" min="1" class="input-box" />
        </div>
      </div>

      <!-- 버튼 -->
      <div class="modal-actions">
        <button @click="submitProposal" class="submit-btn" :disabled="!canSubmit">제안 전송</button>
        <button @click="close" class="cancel-btn">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { isConnected, proposeBilateralCoupon } from '@/api/ws'

const props = defineProps({
  roomId: { type: String, required: true },
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'proposal-sent'])

const myItem = ref('')
const partnerItem = ref('')
const myDiscount = ref(10)
const partnerDiscount = ref(15)
const quantity = ref(100)
const validDays = ref(30)

const canSubmit = computed(() => {
  return (
    myItem.value.trim() && partnerItem.value.trim() && quantity.value > 0 && validDays.value > 0
  )
})

const close = () => {
  emit('update:visible', false)
}

const submitProposal = () => {
  if (!canSubmit.value) return

  if (!isConnected()) {
    alert('연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
    return
  }

  const today = new Date()
  const endDateObj = new Date()
  endDateObj.setDate(today.getDate() + validDays.value)
  const formatDate = (d) => d.toISOString().slice(0, 10)

  const currentUserId = Number(localStorage.getItem('userId') || 0)
  const currentUserName = localStorage.getItem('username') || '익명'

  // 1️⃣ 백엔드 전송용 DTO 구조
  const backendProposalData = {
    roomId: props.roomId,
    proposerId: currentUserId,
    proposerCoupon: {
      itemName: myItem.value.trim(),
      discountPercent: myDiscount.value,
      totalQuantity: quantity.value,
      startDate: formatDate(today),
      endDate: formatDate(endDateObj),
    },
    recipientCoupon: {
      itemName: partnerItem.value.trim(),
      discountPercent: partnerDiscount.value,
      totalQuantity: quantity.value,
      startDate: formatDate(today),
      endDate: formatDate(endDateObj),
    },
    status: 'WAITING',
  }

  // 2️⃣ UI용 임시 메시지
  const uiMessage = {
    id: `temp_${Date.now()}`,
    senderId: currentUserId,
    senderName: currentUserName,
    content: '', // 필요 시 요약 텍스트
    timestamp: today.getTime(),
    type: 'COUPON_PROPOSAL',
    payload: backendProposalData,
    isTemp: true,
  }

  // 3️⃣ STOMP 전송
  try {
    proposeBilateralCoupon(backendProposalData)
  } catch (err) {
    console.error('제안 전송 실패', err)
    alert('제안 전송에 실패했습니다.')
    return
  }

  // 4️⃣ UI 반영
  emit('proposal-sent', uiMessage)
  close()
}
</script>

<style scoped>
.bottom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.bottom-modal {
  background: #fff;
  width: 100%;
  max-width: 500px;
  border-radius: 16px 16px 0 0;
  padding: 24px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.modal-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 16px;
}

.row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.col {
  flex: 1;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
}

.input-box {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.slider {
  width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.submit-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.submit-btn:disabled {
  background: #9ca3af;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}
</style>
