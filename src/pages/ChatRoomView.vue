<template>
  <div class="card">
    <h3>채팅방 #{{ roomId }}</h3>

    <!-- WebSocket 연결 상태 표시 -->
    <div v-if="!wsConnected" class="status-banner disconnected">
      연결 중... ({{ reconnectAttempts }}/{{ maxReconnectAttempts }})
    </div>

    <!-- 상태 배너 -->
    <div v-if="roomStatus === 'waiting'" class="status-banner waiting">대기 중...</div>
    <div v-else-if="roomStatus === 'active'" class="status-banner active">협업 진행 중</div>
    <div v-else-if="roomStatus === 'rejected'" class="status-banner rejected">거절됨</div>

    <!-- 채팅 리스트 -->
    <div ref="chatContainer" class="chat-container">
      <div
        v-for="m in messages"
        :key="m.id"
        class="chat-message-wrapper"
        :class="{
          'my-message': m.senderId === currentUserId,
          'temp-message': m.isTemp,
        }"
      >
        <ProposalMessage
          v-if="m.type === 'COUPON_PROPOSAL'"
          :message="m"
          :currentUserId="currentUserId"
        />
        <div
          v-else
          class="chat-message"
          :class="{
            'my-message': m.senderId === currentUserId,
            'temp-message': m.isTemp,
          }"
        >
          <div class="message-sender">{{ m.senderName || '알 수 없음' }}</div>
          <div class="message-content">{{ m.content }}</div>
          <div class="message-time">{{ formatTime(m.timestamp) }}</div>
          <div v-if="m.isTemp" class="sending-indicator">전송 중...</div>
        </div>
      </div>

      <div v-if="messages.length === 0" class="empty-messages">메시지가 없습니다.</div>

      <!-- 마지막 메시지가 상대방이 보낸 대기중 협업 요청이면 버튼 표시 -->
      <div v-if="lastIncomingRequest" class="request-buttons-container">
        <button @click="acceptRequest(lastIncomingRequest.id)">수락</button>
        <button @click="rejectRequest(lastIncomingRequest.id)">거절</button>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="chat-input" v-if="roomStatus !== 'rejected'">
      <div v-if="roomStatus === 'active'" class="partnership-button-container">
        <button @click="openPartnershipModal">제휴 제안</button>
      </div>
      <input
        v-model="text"
        placeholder="메시지 입력..."
        @keyup.enter="sendMessage"
        :disabled="!wsConnected"
      />
      <button @click="sendMessage" :disabled="!wsConnected || !text.trim()">보내기</button>

      <!-- 모달 연결 -->
      <PartnershipModal
        :roomId="roomId"
        :visible="partnershipModalVisible"
        @update:visible="partnershipModalVisible = $event"
        @proposal-sent="handleProposalSent"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { connectWS, disconnectWS, subscribeRoom, sendText, proposeBilateralCoupon } from '@/api/ws'
import api from '@/api/api'
import PartnershipModal from '../components/PartnershipModal.vue'
import ProposalMessage from '../components/ProposalMessage.vue'
const partnershipModalVisible = ref(false)
const proposalMessages = ref([]) // 모달에서 보낸 메시지 추가용
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
const messages = ref([])
const text = ref('')
const chatContainer = ref(null)
const currentUser = ref(localStorage.getItem('username') || '')
const roomStatus = ref('waiting')
const currentUserId = ref(Number(localStorage.getItem('userId') || 0))

let unsubscribe = null
let connectionCheckInterval = null
let connectWebSocket = null // 함수를 변수로 선언

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

const updateRoomStatus = () => {
  const latest = messages.value.filter((m) => m.type === 'PARTNERSHIP_REQUEST').pop()
  const status = latest?.payload?.status?.toUpperCase() || 'WAITING'
  if (status === 'ACCEPTED' || status === 'IN_NEGOTIATION') roomStatus.value = 'active'
  else if (status === 'REJECTED') roomStatus.value = 'rejected'
  else roomStatus.value = 'waiting'
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}

// 메시지 중복 제거 및 정렬 함수 - 새 메시지가 올 때마다 호출
const removeDuplicateMessages = () => {
  const uniqueMessages = messages.value.reduce((acc, current) => {
    const existing = acc.find((msg) => msg.id === current.id)
    if (!existing) {
      acc.push(current)
    }
    return acc
  }, [])

  // 시간순 정렬
  uniqueMessages.sort((a, b) => a.timestamp - b.timestamp)
  messages.value = uniqueMessages
}

const sendMessage = () => {
  if (!text.value.trim() || !wsConnected.value) return

  const messageContent = text.value.trim()
  const tempId = `temp_${Date.now()}`

  // 임시 메시지를 로컬에 먼저 표시 (낙관적 업데이트)
  const tempMsg = {
    id: tempId,
    senderId: currentUserId.value,
    sender: currentUser.value,
    content: messageContent,
    timestamp: Date.now(),
    type: 'TEXT',
    payload: null,
    isTemp: true, // 임시 메시지 표시
  }

  messages.value = [...messages.value, tempMsg]
  text.value = ''
  scrollToBottom()

  // 서버에 메시지 전송 - Promise 체크 추가
  try {
    const result = sendText(roomId, messageContent)

    // sendText가 Promise를 반환하는 경우
    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          console.log('메시지 전송 완료')
          // 임시 메시지는 서버에서 오는 실제 메시지로 대체됨
        })
        .catch((error) => {
          console.error('메시지 전송 실패:', error)
          // 실패시 임시 메시지 제거
          messages.value = messages.value.filter((m) => m.id !== tempId)
        })
    } else {
      // sendText가 Promise를 반환하지 않는 경우
      console.log('메시지 전송 시도')

      // 일정 시간 후 임시 메시지 정리 (서버 메시지로 대체되지 않은 경우)
      setTimeout(() => {
        const stillExists = messages.value.some((m) => m.id === tempId && m.isTemp)
        if (stillExists) {
          // 실제 서버 메시지가 아직 오지 않았다면 임시 메시지를 실제 메시지로 변환
          messages.value = messages.value.map((m) =>
            m.id === tempId ? { ...m, isTemp: false } : m,
          )
        }
      }, 5000) // 5초 후
    }
  } catch (error) {
    console.error('메시지 전송 중 오류:', error)
    // 오류 발생시 임시 메시지 제거
    messages.value = messages.value.filter((m) => m.id !== tempId)
  }
}

// WebSocket 연결 함수
connectWebSocket = () => {
  connectWS(
    () => {
      console.log('WebSocket 연결됨')
      wsConnected.value = true
      reconnectAttempts.value = 0

      unsubscribe = subscribeRoom(roomId, (parsedMsg) => {
        // parsedMsg: 이미 JSON.parse 완료된 객체
        // msg.body로 다시 파싱하면 안 됨
        messages.value = messages.value.filter(
          (m) =>
            !(m.isTemp && m.content === parsedMsg.content && m.senderId === parsedMsg.senderId),
        )

        const existing = messages.value.find((m) => m.id === parsedMsg.id)
        if (!existing) {
          messages.value = [...messages.value, parsedMsg]
          removeDuplicateMessages()
          nextTick(() => {
            updateRoomStatus()
            scrollToBottom()
          })
        }
      })
    },
    (error) => {
      // WebSocket 연결 실패 시 재연결 시도
      console.error('WebSocket 연결 오류:', error)
      wsConnected.value = false

      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        console.log(`재연결 시도 ${reconnectAttempts.value}/${maxReconnectAttempts}`)
        setTimeout(() => {
          connectWebSocket()
        }, 3000 * reconnectAttempts.value) // 지수 백오프
      }
    },
  )
}

const checkConnection = () => {
  if (!wsConnected.value) {
    console.log('연결이 끊어진 것을 감지, 재연결 시도...')
    connectWebSocket()
  }
}

onMounted(async () => {
  if (!currentUser.value) return router.push('/login')

  await fetchHistory()
  connectWebSocket()

  // 주기적으로 연결 상태 체크
  connectionCheckInterval = setInterval(checkConnection, 30000) // 30초마다 체크

  // 페이지 가시성 API를 이용한 포커스 시 재연결
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !wsConnected.value) {
      console.log('페이지 포커스 시 재연결 시도')
      connectWebSocket()
    }
  })
})

onUnmounted(() => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
  }
  if (unsubscribe) unsubscribe()
  disconnectWS()

  // 이벤트 리스너 정리
  document.removeEventListener('visibilitychange', () => {})
})

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })

// 마지막으로 온 상대방 협업 요청 메시지 (대기중)
const lastIncomingRequest = computed(() => {
  // 내 메시지 제외 + PARTNERSHIP_REQUEST + WAITING 상태
  return [...messages.value]
    .reverse()
    .find(
      (m) =>
        m.senderId !== currentUserId.value &&
        m.type === 'PARTNERSHIP_REQUEST' &&
        m.payload?.status === 'WAITING',
    )
})

const acceptRequest = (messageId) => {
  const msg = messages.value.find((m) => m.id === messageId)
  if (!msg) return

  // 서버로 수락 요청 보내기
  // 예: sendAccept(msg.id)
  msg.payload.status = 'ACCEPTED'
  updateRoomStatus()
}

const rejectRequest = (messageId) => {
  const msg = messages.value.find((m) => m.id === messageId)
  if (!msg) return

  // 서버로 거절 요청 보내기
  // 예: sendReject(msg.id)
  msg.payload.status = 'REJECTED'
  updateRoomStatus()
}
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
}
.chat-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #f8fafc;
}
.chat-message {
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  max-width: 70%;
  background: #e5e7eb;
  position: relative;
}
.chat-message.my-message {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  margin-left: auto;
}
.chat-message.temp-message {
  opacity: 0.7;
}
.message-sender {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.8;
}
.message-content {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}
.message-time {
  font-size: 10px;
  opacity: 0.7;
  text-align: right;
}
.sending-indicator {
  font-size: 10px;
  opacity: 0.6;
  font-style: italic;
  text-align: right;
  margin-top: 2px;
}
.chat-input {
  display: flex;
  gap: 8px;
}
.chat-input input {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}
.chat-input input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
.chat-input button {
  padding: 12px 20px;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
}
.chat-input button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.status-banner {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: bold;
}
.status-banner.waiting {
  background: #fef3c7;
  color: #d97706;
}
.status-banner.active {
  background: #d1fae5;
  color: #059669;
}
.status-banner.rejected {
  background: #fee2e2;
  color: #dc2626;
}
.status-banner.disconnected {
  background: #fef2f2;
  color: #991b1b;
}
.empty-messages {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  margin-top: 150px;
}

.request-buttons-container {
  display: flex;
  gap: 8px;
  justify-content: flex-start; /* 왼쪽 정렬, 상대방 메시지 기준 */
  margin-top: 8px;
  margin-bottom: 16px;
}
.request-buttons-container button {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.request-buttons-container button:first-child {
  background-color: #3b82f6;
  color: white;
}
.request-buttons-container button:last-child {
  background-color: #e5e7eb;
  color: #374151;
}
.partnership-button-container {
  margin-bottom: 16px;
  text-align: left; /* 왼쪽 정렬 */
}
.partnership-button-container button {
  padding: 6px 14px;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
</style>
