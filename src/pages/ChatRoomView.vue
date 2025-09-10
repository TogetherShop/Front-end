<template>
  <div class="chat-room">
    <!-- 상단 헤더 -->
    <header class="chat-header">
      <div class="header-left">
        <div class="back-icon" @click="handleBack">
          <i class="fa-regular fa-less-than"></i>
        </div>
        <div class="shop-info">
          <h3 class="shop-name">{{ businessName }}</h3>
          <span class="shop-status">{{ partnershipStatusLabel }}</span>
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
        <div class="stat-value green">{{ togetherScore }}</div>
        <div class="stat-label">함께지수</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ distance }}km</div>
        <div class="stat-label">거리</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ category }}</div>
        <div class="stat-label">{{ address }}</div>
      </div>
    </div>

    <!-- 메시지 영역 -->
    <!-- 메시지 영역 -->
    <main ref="chatContainer" class="chat-container">
      <div
        v-for="m in messages"
        :key="m.id"
        :class="['message-wrapper', { mine: m.senderId === currentUserId }]"
      >
        <!-- 제휴 제안 메시지 -->
        <ProposalMessage
          v-if="m.type === 'COUPON_PROPOSAL'"
          :message="m"
          :currentUserId="currentUserId"
        />

        <!-- 파트너십 요청 메시지 -->
        <div v-else-if="m.type === 'PARTNERSHIP_REQUEST'" class="chat-bubble system-message">
          {{ m.content }}
          <div class="chat-time">{{ formatTime(m.createdAt) }}</div>
        </div>

        <!-- 일반 텍스트 메시지 -->
        <div v-else-if="m.type === 'TEXT'" class="chat-bubble">
          {{ m.content }}
          <div class="chat-time">{{ formatTime(m.createdAt) }}</div>
        </div>
      </div>
    </main>

    <!-- 입력창 / 버튼 -->
    <footer class="chat-footer">
      <!-- 요청 받은 상태 -->
      <template v-if="partnershipStatus === 'REQUESTED'">
        <!-- 오직 내가 받은 사람(recipient)일 때만 수락 버튼 표시 -->
        <div v-if="role === 'RECIPIENT'">
          <div class="request-box">
            <p class="request-text">요청을 수락하시겠습니까?</p>
            <div class="request-actions">
              <button class="accept-btn" @click="accept">예</button>
              <button class="reject-btn" @click="reject">아니오</button>
            </div>
          </div>
          <div class="input-row">
            <button class="proposal-btn" disabled>제휴 제안</button>
            <div class="input-box disabled">
              <input type="text" placeholder="메시지를 입력하세요..." disabled />
              <button class="send-btn" disabled>➤</button>
            </div>
          </div>
        </div>

        <!-- 보낸 사람은 입력창 비활성화 -->
        <div v-else class="input-row">
          <button class="proposal-btn" disabled>제휴 제안</button>
          <div class="input-box disabled">
            <input type="text" placeholder="메시지를 입력하세요..." disabled />
            <button class="send-btn" disabled>➤</button>
          </div>
        </div>
      </template>

      <!-- 제휴 가능 상태 -->
      <template v-else-if="partnershipStatus === 'ACCEPTED' || partnershipStatus === 'COMPLETED'">
        <div class="input-row">
          <button class="proposal-btn" @click="openPartnershipModal">제휴 제안</button>
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
        </div>
      </template>

      <!-- 완료 / 거절 -->
      <template v-else-if="partnershipStatus === 'REJECTED'">
        <div class="input-box">
          <input type="text" placeholder="채팅이 종료되었습니다" disabled />
        </div>
      </template>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  connectWS,
  disconnectWS,
  subscribeRoom,
  sendText,
  fetchChatHistory,
  acceptRequest, // <-- match ws.js
  rejectRequest, // <--
  getRoomInfo,
} from '@/api/ws'
import PartnershipModal from '@/components/PartnershipModal.vue'
import ProposalMessage from '@/components/ProposalMessage.vue'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const route = useRoute()
const roomId = route.params.roomId

const me = ref({ id: null, username: '', shopName: '' })
const otherUser = ref({ id: null, username: '', shopName: '' })
const requesterId = ref(null)
const recipientId = ref(null)
const partnershipStatus = ref(null)
const currentUserId = ref(me.value.id) // me.value.id와 동일

const chatContainer = ref(null)
const text = ref('')
const messages = ref([])
const partnershipModalVisible = ref(false)
const role = ref(null)
let unsubscribe = null
// JWT에서 현재 사용자 ID 가져오기

try {
  const token = localStorage.getItem('access_token')
  const decoded = token ? jwtDecode(token) : null
  currentUserId.value = decoded?.sub ? Number(decoded.sub) : null
} catch (e) {
  console.error('JWT 디코딩 실패', e)
}

// 샵 정보 (임시)
const businessName = ref('')
const category = ref('')
const togetherScore = 4.8
const distance = 0.8
const address = '강남구 역삼동'
// 스크롤 하단 이동
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const handleBack = () => {
  router.back()
}
// WebSocket 수신
const handleIncomingMessage = (msg) => {
  const idx = messages.value.findIndex((m) => m.id === msg.id)
  if (idx !== -1) {
    // 임시 메시지 교체
    messages.value[idx] = msg
  } else {
    messages.value.push(msg)
  }
  scrollToBottom()
}

const partnershipStatusLabel = computed(() => {
  switch (partnershipStatus.value) {
    case 'COMPLETED':
      return '협의 완료'
    case 'ACCEPTED':
      return '수락됨'
    case 'REJECTED':
      return '거절됨'
    case 'REQUESTED':
      return '요청됨'
    default:
      return '알 수 없음'
  }
})

// 메시지 전송
const sendMessage = async () => {
  if (!text.value.trim()) return
  const content = text.value
  text.value = ''
  try {
    await sendText(roomId, content)
  } catch (err) {
    console.error('메시지 전송 실패', err)
    alert('메시지 전송에 실패했습니다.')
  }
}

// 제휴 모달
const openPartnershipModal = () => {
  partnershipModalVisible.value = true
}

// 요청 수락
const accept = async () => {
  try {
    await acceptRequest(roomId) // currentUserId 제거
    partnershipStatus.value = 'ACCEPTED'
  } catch (err) {
    console.error('요청 수락 실패', err)
  }
}

// 요청 거절
const reject = async () => {
  try {
    await rejectRequest(roomId, '사용자가 거절함') // currentUserId 제거
    partnershipStatus.value = 'REJECTED'
  } catch (err) {
    console.error('요청 거절 실패', err)
  }
}
// 제휴 제안 메시지 처리
const handleProposalUpdated = ({ id, status }) => {
  const msg = messages.value.find((m) => m.id === id)
  if (msg) msg.payload.status = status
}

// 시간 포맷
const formatTime = (ts) => {
  if (!ts) return ''

  try {
    // createdAt은 ISO 문자열 형태이므로 바로 Date 생성자에 전달
    const date = new Date(ts)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (e) {
    console.error('시간 포맷 실패:', e)
    return ''
  }
}

onBeforeUnmount(() => {
  unsubscribe?.()
  disconnectWS()
})

const fetchRoomInfo = async () => {
  try {
    const res = await getRoomInfo(roomId)
    if (!res) return

    // API 응답에서 roomInfo 사용
    const roomInfo = res.roomInfo || res
    console.log('방 정보 로드됨:', roomInfo)
    partnershipStatus.value = roomInfo?.status ?? null
    me.value = roomInfo.me || {}
    otherUser.value = roomInfo.otherUser || {}
    requesterId.value = roomInfo.requesterId
    recipientId.value = roomInfo.recipientId
    partnershipStatus.value = roomInfo.status || null

    // role 계산
    role.value = currentUserId.value === requesterId.value ? 'REQUESTER' : 'RECIPIENT'

    businessName.value = otherUser.value.shopName || ''
    category.value = otherUser.value.username || ''

    console.log('방 정보 로드됨:', roomInfo)
  } catch (err) {
    console.error('방 정보 불러오기 실패', err)
  }
}
const fetchHistory = async () => {
  try {
    const res = await fetchChatHistory(roomId)
    console.log('채팅 기록 전체:', res)

    // res 자체가 배열인 경우
    if (Array.isArray(res)) {
      messages.value = [...res]
    }
    // 혹시 res.messages 안에 담기는 경우도 대비
    else if (res.messages && Array.isArray(res.messages)) {
      messages.value = [...res.messages]
    }

    console.log('messages.value 설정됨:', messages.value.length)

    nextTick(() => {
      scrollToBottom()
    })
  } catch (err) {
    console.error('채팅 기록 불러오기 실패', err)
  }
}

onMounted(async () => {
  // 1. JWT에서 사용자 ID 가져오기
  try {
    const token = localStorage.getItem('access_token')
    const decoded = token ? jwtDecode(token) : null
    currentUserId.value = decoded?.sub ? Number(decoded.sub) : null
    console.log('현재 사용자 ID:', currentUserId.value)
    console.log('현재 partnershipStatus:', partnershipStatus.value)
  } catch (e) {
    console.error('JWT 디코딩 실패', e)
  }

  // 2. 채팅 기록 먼저 가져오기 (방 정보와 함께 오므로)
  await fetchHistory()
  await fetchRoomInfo()

  // 3. 방 정보는 fetchHistory에서 받은 roomInfo 사용하거나 별도 호출
  // getRoomInfo가 roomInfo만 반환하는지 확인 필요

  // 4. WebSocket 연결
  connectWS(
    () => {
      unsubscribe = subscribeRoom(roomId, (msg) => {
        console.log('subscribeRoom 콜백 호출됨:', msg) // 메시지 들어오는지 확인
        handleIncomingMessage(msg)
      })

      console.log('WebSocket 연결됨')
    },
    (err) => console.error('WebSocket 연결 실패:', err),
  )
})
</script>
<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}
.chat-footer {
  border-top: 1px solid #eee;
  padding: 8px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px; /* 버튼과 input 사이 간격 */
}

.proposal-btn {
  background: #017f58;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  flex-shrink: 0; /* 버튼 크기 고정 */
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
/* 시스템 메시지 (파트너십 요청) 스타일 */
.chat-bubble.system-message {
  background: #f3f4f6;
  color: #374151;
  font-style: italic;
  text-align: center;
  border: 1px solid #d1d5db;
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
/* 요청 수락/거절 카드 */
.request-box {
  width: 100%;
  padding: 16px;
  text-align: center;
}

.request-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.request-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.request-actions .accept-btn {
  flex: 1;
  max-width: 120px;
  background: #017f58;
  color: #fff;
  border: none;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

.request-actions .reject-btn {
  flex: 1;
  max-width: 120px;
  background: #fff;
  color: #017f58;
  border: 1px solid #e5e7eb;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}

/* 입력창 비활성화 스타일 */
.input-box.disabled {
  opacity: 0.6;
  pointer-events: none;
}
.proposal-btn[disabled],
.send-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.back-icon {
  font-size: 20px;
  transform: scaleX(0.5);
  margin-right: 10px;
}
</style>
