<template>
  <div class="chat-room">
    <!-- 상단 헤더 -->
    <header class="chat-header">
      <div class="header-left">
        <button class="back-btn">←</button>
        <div class="shop-info">
          <h3 class="shop-name">달콤 베이커리</h3>
          <span class="shop-status">오프라인</span>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn">📞</button>
        <button class="icon-btn">⋮</button>
      </div>
    </header>

    <!-- 상단 지표 -->
    <div class="shop-stats">
      <div class="stat">
        <div class="stat-value green">4.8</div>
        <div class="stat-label">함께지수</div>
      </div>
      <div class="stat">
        <div class="stat-value">0.8km</div>
        <div class="stat-label">거리</div>
      </div>
      <div class="stat">
        <div class="stat-value">베이커리</div>
        <div class="stat-label">강남구 역삼동</div>
      </div>
    </div>

    <!-- 메시지 영역 -->
    <main ref="chatContainer" class="chat-container">
      <div
        v-for="m in messages"
        :key="m.id"
        class="message-wrapper"
        :class="{ mine: m.senderId === currentUserId }"
      >
        <!-- 제휴 제안 카드 -->
        <!-- <div v-if="m.type === 'COUPON_PROPOSAL'" class="proposal-card">
          <div class="proposal-header">✔ 제휴 제안</div>
          <div class="proposal-body">
            <div class="proposal-row">
              <span>아메리카노</span>
              <span class="highlight">10% 할인</span>
              <span>⇔</span>
              <span class="highlight">15% 할인</span>
              <span>크로와상</span>
            </div>
            <div class="proposal-meta">
              <span>발급 수량: 100개</span>
              <span>유효기간: 30일</span>
            </div>
          </div>
          <div class="proposal-actions">
            <button class="accept-btn">수락</button>
            <button class="reject-btn">거절</button>
          </div>
        </div> -->
        <ProposalMessage
          v-if="m.type === 'COUPON_PROPOSAL'"
          :message="m"
          :currentUserId="currentUserId"
        />
        <!-- 일반 메시지 -->
        <div v-else class="chat-bubble">
          <div class="chat-text">{{ m.content }}</div>
          <div class="chat-time">{{ formatTime(m.timestamp) }}</div>
        </div>
      </div>
    </main>

    <!-- 입력창 -->
    <footer class="chat-input">
      <button class="proposal-btn" v-if="roomStatus === 'active'" @click="openPartnershipModal">
        제휴 제안
      </button>
      <div class="input-box">
        <input
          v-model="text"
          type="text"
          placeholder="메시지를 입력하세요..."
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" @click="sendMessage">➤</button>
        <PartnershipModal
          :roomId="roomId"
          :visible="partnershipModalVisible"
          @update:visible="partnershipModalVisible = $event"
          @proposal-sent="handleProposalSent"
        />
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PartnershipModal from '@/components/PartnershipModal.vue'
import ProposalMessage from '@/components/ProposalMessage.vue'
const partnershipModalVisible = ref(false)
const openPartnershipModal = () => {
  partnershipModalVisible.value = true
}

const handleProposalSent = (proposalMsg) => {
  // 1) 채팅 화면에 임시 메시지로 추가
  messages.value = [...messages.value, proposalMsg]
  scrollToBottom()

  // 2) 서버로 제휴 제안 전송 (올바른 함수 사용)
  try {
    proposeBilateralCoupon(proposalMsg) // ✅ 전용 함수 사용
    console.log('✅ 제휴 제안 전송 완료')

    // 임시 메시지를 실제 메시지로 변환 (서버 응답이 오지 않는 경우를 대비)
    setTimeout(() => {
      messages.value = messages.value.map((m) =>
        m.id === proposalMsg.id && m.isTemp ? { ...m, isTemp: false } : m,
      )
    }, 2000) // 2초 후
  } catch (error) {
    console.error('❌ 제휴 제안 전송 실패:', error)
    // 실패시 임시 메시지 제거
    messages.value = messages.value.filter((m) => m.id !== proposalMsg.id)
    alert('제안 전송에 실패했습니다. 다시 시도해주세요.')
  }
}
const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId
const wsConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const currentUser = ref(localStorage.getItem('username') || '')

let unsubscribe = null
let connectionCheckInterval = null
let connectWebSocket = null // 함수를 변수로 선언

const messages = ref([
  {
    id: 1,
    senderId: 2,
    content: '안녕하세요! 제휴 제안 감사합니다. 조건을 검토해보겠습니다.',
    timestamp: Date.now() - 60000,
    type: 'CHAT',
  },
  {
    id: 2,
    senderId: 1,
    content: '네, 감사합니다. 1:1 쿠폰 교환으로 진행하면 좋을 것 같습니다.',
    timestamp: Date.now() - 30000,
    type: 'CHAT',
  },
  {
    id: 3,
    senderId: 1,
    type: 'COUPON_PROPOSAL',
    timestamp: Date.now() - 20000,
    payload: {
      proposerCoupon: {
        itemName: '아메리카노',
        discountPercent: 10,
        totalQuantity: 100,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
      recipientCoupon: {
        itemName: '크로와상',
        discountPercent: 15,
        totalQuantity: 100,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      },
      status: 'WAITING',
    },
  },

  {
    id: 4,
    senderId: 2,
    content: '제안 검토했습니다. 15% 할인으로 조정 가능할까요?',
    timestamp: Date.now() - 10000,
    type: 'CHAT',
  },
])

const fetchHistory = async () => {
  try {
    const { data } = await api.get(`/api/partnership/rooms/${roomId}/history`)
    const fetchedMessages = (data.messages || []).map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.senderName || '알 수 없음',
      content: m.content || '',
      timestamp: new Date(m.createdAt).getTime(),
      type: m.type || 'CHAT',
      payload: m.payload || null,
    }))

    messages.value = fetchedMessages
    removeDuplicateMessages() // 중복 제거

    // 서버에서 받아온 roomInfo 기반으로 currentUserId 설정
    if (!currentUserId.value && data.roomInfo?.currentUserId) {
      currentUserId.value = data.roomInfo.currentUserId
    }
    updateRoomStatus()
    scrollToBottom()
  } catch {
    messages.value = []
  }
}

const currentUserId = 1
const text = ref('')
const roomStatus = ref('active')
const chatContainer = ref(null)

const sendMessage = () => {
  if (!text.value.trim()) return
  messages.value.push({
    id: Date.now(),
    senderId: currentUserId,
    content: text.value,
    timestamp: Date.now(),
    type: 'CHAT',
  })
  text.value = ''
  nextTick(() => {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

/* 헤더 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.shop-info {
  display: flex;
  flex-direction: column;
}
.shop-name {
  font-size: 16px;
  margin: 0;
}
.shop-status {
  font-size: 12px;
  color: #888;
}
.icon-btn,
.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* 상단 지표 */
.shop-stats {
  display: flex;
  justify-content: space-around;
  background: #f0fdf4;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-value {
  font-weight: bold;
}
.green {
  color: #017f58;
}
.stat-label {
  font-size: 12px;
  color: #666;
}

/* 메시지 영역 */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  align-items: flex-start;
}
.message-wrapper.mine {
  align-items: flex-end;
}

/* 일반 메시지 */
.chat-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #e5e7eb;
  font-size: 14px;
}
.message-wrapper.mine .chat-bubble {
  background: #017f58;
  color: #fff;
}
.chat-time {
  font-size: 10px;
  color: #888;
  margin-top: 4px;
}

/* 제휴 제안 카드 */
.proposal-card {
  width: 80%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.proposal-header {
  font-weight: bold;
  margin-bottom: 8px;
  color: #017f58;
}
.proposal-body {
  font-size: 14px;
  margin-bottom: 8px;
}
.proposal-row {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  font-weight: bold;
}
.highlight {
  color: #059669;
}
.proposal-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
}
.proposal-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.accept-btn {
  flex: 1;
  background: #017f58;
  color: white;
  border: none;
  padding: 6px 0;
  border-radius: 8px;
}
.reject-btn {
  flex: 1;
  background: #e5e7eb;
  border: none;
  padding: 6px 0;
  border-radius: 8px;
}

/* 입력창 */
.chat-input {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  gap: 8px; /* 버튼과 input 사이 간격 */
  border-top: 1px solid #eee;
  padding: 8px;
}
.proposal-btn {
  background: #017f58;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.input-box {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  background: #fff;
}
.input-box input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px;
}
.send-btn {
  background: #017f58;
  color: white;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}
</style>
