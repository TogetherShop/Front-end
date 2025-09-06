<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h3>제휴 쿠폰 제안</h3>
      <p>1:1 쿠폰 교환 원칙에 따라 조건을 설정해주세요</p>

      <div class="coupon-section">
        <div class="coupon-item">
          <label>내 쿠폰</label>
          <input type="text" v-model="myItem" placeholder="품목 입력" class="item-input" />
        </div>
        <div class="coupon-item">
          <label>상대 쿠폰</label>
          <input type="text" v-model="partnerItem" placeholder="품목 입력" class="item-input" />
        </div>
      </div>

      <div class="discount-section">
        <div class="discount-item">
          <label>내 할인율: {{ myDiscount }}%</label>
          <input type="range" v-model.number="myDiscount" min="1" max="100" class="slider" />
        </div>
        <div class="discount-item">
          <label>상대 할인율: {{ partnerDiscount }}%</label>
          <input type="range" v-model.number="partnerDiscount" min="1" max="100" class="slider" />
        </div>
      </div>

      <div class="quantity-section">
        <div class="quantity-item">
          <label>발급 수량</label>
          <input type="number" v-model.number="quantity" min="1" class="number-input" />
        </div>
        <div class="quantity-item">
          <label>유효기간(일)</label>
          <input type="number" v-model.number="validDays" min="1" class="number-input" />
        </div>
      </div>

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

// form state
const myItem = ref('')
const partnerItem = ref('')
const myDiscount = ref(10)
const partnerDiscount = ref(10)
const quantity = ref(1)
const validDays = ref(7)

// 제안 전송 가능 여부 확인
const canSubmit = computed(() => {
  return (
    myItem.value.trim() && partnerItem.value.trim() && quantity.value > 0 && validDays.value > 0
  )
})

const close = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  myItem.value = ''
  partnerItem.value = ''
  myDiscount.value = 10
  partnerDiscount.value = 10
  quantity.value = 1
  validDays.value = 7
}
// const submitProposal = () => {
//   if (!canSubmit.value) return;

//   const today = new Date();
//   const endDateObj = new Date();
//   endDateObj.setDate(today.getDate() + validDays.value);

//   const formatDate = (date) => date.toISOString().slice(0, 10);

//   // 실제 로그인 사용자 정보 사용
//   const currentUserId = Number(localStorage.getItem('userId') || 0);
//   const currentUserName = localStorage.getItem('username') || '익명';

//   // 서버/클라이언트 공용 ProposalMessage 구조
//   const proposalMessage = {
//     id: `temp_${Date.now()}`, // 임시 ID
//     senderId: currentUserId, // ✅ 실제 사용자 ID 사용
//     senderName: currentUserName, // ✅ 실제 사용자 이름 사용
//     content: '',
//     timestamp: today.getTime(),
//     type: 'COUPON_PROPOSAL', // ✅ 올바른 타입으로 변경
//     payload: {
//       roomId: props.roomId,
//       proposerId: currentUserId, // ✅ 실제 사용자 ID 사용
//       proposerCoupon: {
//         itemName: myItem.value.trim(),
//         discountPercent: myDiscount.value,
//         totalQuantity: quantity.value,
//         startDate: formatDate(today),
//         endDate: formatDate(endDateObj),
//       },
//       recipientCoupon: {
//         itemName: partnerItem.value.trim(),
//         discountPercent: partnerDiscount.value,
//         totalQuantity: quantity.value,
//         startDate: formatDate(today),
//         endDate: formatDate(endDateObj),
//       },
//       status: 'WAITING',
//     },
//     isTemp: true,
//   };

//   try {
//     // 부모 컴포넌트에 이벤트 전달 (같은 구조)
//     emit('proposal-sent', proposalMessage);
//     close();
//   } catch (error) {
//     console.error('제휴 제안 전송 실패:', error);
//     alert('제안 전송에 실패했습니다. 다시 시도해주세요.');
//   }
// };
// const submitProposal = () => {
//   if (!canSubmit.value) return;

//   const today = new Date();
//   const endDateObj = new Date();
//   endDateObj.setDate(today.getDate() + validDays.value);

//   const formatDate = (date) => date.toISOString().slice(0, 10);

//   // 실제 로그인 사용자 정보 사용
//   const currentUserId = Number(localStorage.getItem('userId') || 0);
//   const currentUserName = localStorage.getItem('username') || '익명';

//   // === 백엔드 전송용 데이터 구조 ===
//   const backendProposalData = {
//     roomId: props.roomId, // ✅ roomId를 최상위로 이동
//     payload: {
//       proposerCoupon: {
//         itemName: myItem.value.trim(),
//         discountPercent: myDiscount.value,
//         totalQuantity: quantity.value,
//         startDate: formatDate(today),
//         endDate: formatDate(endDateObj),
//       },
//       recipientCoupon: {
//         itemName: partnerItem.value.trim(),
//         discountPercent: partnerDiscount.value,
//         totalQuantity: quantity.value,
//         startDate: formatDate(today),
//         endDate: formatDate(endDateObj),
//       },
//     },
//   };

//   // === UI용 메시지 구조 (기존 유지) ===
//   const uiMessage = {
//     id: `temp_${Date.now()}`,
//     senderId: currentUserId,
//     senderName: currentUserName,
//     content: '',
//     timestamp: today.getTime(),
//     type: 'COUPON_PROPOSAL',
//     payload: {
//       roomId: props.roomId,
//       proposerId: currentUserId,
//       proposerCoupon: backendProposalData.payload.proposerCoupon,
//       recipientCoupon: backendProposalData.payload.recipientCoupon,
//       status: 'WAITING',
//     },
//     isTemp: true,
//   };

//   try {
//     console.log('=== 제안 전송 디버깅 ===');
//     console.log('roomId:', props.roomId);
//     console.log(
//       '백엔드 전송 데이터:',
//       JSON.stringify(backendProposalData, null, 2)
//     );
//     console.log('UI 표시 데이터:', JSON.stringify(uiMessage, null, 2));

//     // 1. 백엔드로 WebSocket 전송 (실제 제안 처리)
//     if (window.stompClient && window.stompClient.connected) {
//       window.stompClient.send(
//         '/app/chat.propose',
//         {},
//         JSON.stringify(backendProposalData)
//       );
//       console.log('✅ WebSocket으로 제안 전송 완료');
//     } else {
//       console.error('❌ WebSocket 연결이 없습니다');
//       alert('연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
//       return;
//     }

//     // 2. UI 업데이트를 위한 부모 컴포넌트 이벤트 전달
//     emit('proposal-sent', uiMessage);

//     // 3. 모달 닫기
//     close();
//   } catch (error) {
//     console.error('제휴 제안 전송 실패:', error);
//     alert('제안 전송에 실패했습니다. 다시 시도해주세요.');
//   }
// };
const submitProposal = () => {
  if (!canSubmit.value) return

  // WebSocket 연결 상태 확인 (서비스 함수 사용)
  if (!isConnected()) {
    console.error('❌ WebSocket 연결이 없습니다')
    alert('연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
    return
  }

  const today = new Date()
  const endDateObj = new Date()
  endDateObj.setDate(today.getDate() + validDays.value)

  const formatDate = (date) => date.toISOString().slice(0, 10)

  // 실제 로그인 사용자 정보 사용
  const currentUserId = Number(localStorage.getItem('userId') || 0)
  const currentUserName = localStorage.getItem('username') || '익명'

  // 백엔드 전송용 데이터 구조 (서비스 파일의 proposeBilateralCoupon에 맞게)
  const backendProposalData = {
    roomId: props.roomId,
    payload: {
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
    },
  }

  // UI용 메시지 구조
  const uiMessage = {
    id: `temp_${Date.now()}`,
    senderId: currentUserId,
    senderName: currentUserName,
    content: '',
    timestamp: today.getTime(),
    type: 'COUPON_PROPOSAL',
    payload: {
      roomId: props.roomId,
      proposerId: currentUserId,
      proposerCoupon: backendProposalData.payload.proposerCoupon,
      recipientCoupon: backendProposalData.payload.recipientCoupon,
      status: 'WAITING',
    },
    isTemp: true,
  }

  try {
    console.log('=== 제안 전송 디버깅 ===')
    console.log('roomId:', props.roomId)
    console.log('백엔드 전송 데이터:', JSON.stringify(backendProposalData, null, 2))

    // 서비스 함수를 사용하여 WebSocket 전송
    proposeBilateralCoupon(backendProposalData)
    console.log('✅ WebSocket으로 제안 전송 완료')

    // UI 업데이트를 위한 부모 컴포넌트 이벤트 전달
    emit('proposal-sent', uiMessage)

    // 모달 닫기
    close()
  } catch (error) {
    console.error('제휴 제안 전송 실패:', error)
    alert('제안 전송에 실패했습니다. 다시 시도해주세요.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 999;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px 16px 0 0;
  padding: 24px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: bold;
}

.modal-content p {
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 14px;
}

.coupon-section {
  margin-bottom: 20px;
}

.coupon-item {
  margin-bottom: 16px;
}

.coupon-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.item-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.item-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.discount-section {
  margin-bottom: 20px;
}

.discount-item {
  margin-bottom: 16px;
}

.discount-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.quantity-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.quantity-item {
  flex: 1;
}

.quantity-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.number-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.number-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.submit-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: #d1d5db;
}
</style>
