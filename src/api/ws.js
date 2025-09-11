import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import api from './api'

let stompClient = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

// 최신 access token 가져오기
function getAccessToken() {
  return localStorage.getItem('access_token')
}

// WebSocket 연결
export function connectWS(onConnect, onError) {
  const token = getAccessToken()
  if (!token) {
    console.error('❌ 액세스 토큰이 없습니다. 다시 로그인해주세요.')
    if (onError) onError('NO_TOKEN')
    return
  }

  console.log('🔄 WebSocket 연결 시도 중...', token.substring(0, 20) + '...')

  try {
    const socket = new SockJS(`/ws-chat?token=${token}`)
    stompClient = Stomp.over(socket)
    stompClient.debug = (str) => console.log('🔧 STOMP Debug:', str)

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      (frame) => {
        console.log('✅ WebSocket 연결 성공:', frame)
        reconnectAttempts = 0
        if (onConnect) onConnect()
      },
      (error) => handleConnectionError(error, onConnect, onError),
    )
  } catch (error) {
    console.error('❌ WebSocket 초기화 오류:', error)
    if (onError) onError('INIT_ERROR')
  }
}

function handleConnectionError(error, onConnect, onError) {
  if (error?.toString().includes('403')) {
    console.error('🚫 인증 실패 (403 Forbidden)')
    if (onError) onError('AUTH_FAILED')
    return
  }

  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++
    setTimeout(() => connectWS(onConnect, onError), RECONNECT_DELAY)
  } else {
    console.error('💥 최대 재연결 횟수 초과.')
    if (onError) onError('MAX_RETRIES_EXCEEDED')
  }
}

// WebSocket 해제
export function disconnectWS() {
  if (stompClient) {
    stompClient.disconnect()
    stompClient = null
    reconnectAttempts = 0
  }
}

function safeParseJSON(str) {
  if (typeof str !== 'string') return str // 이미 객체면 그대로 반환
  try {
    return JSON.parse(str) // JSON이면 파싱
  } catch {
    return str // 순수 문자열이면 그대로 반환
  }
}

// 메시지 구독
export const subscribeRoom = (roomId, callback) => {
  if (!stompClient?.connected) {
    console.error('WebSocket이 연결되지 않았습니다')
    return null
  }

  const destination = `/topic/room/${roomId}`
  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      if (!message.body) return

      const raw = message.body.replace(/\0/g, '')
      const body = safeParseJSON(raw) // 안전하게 파싱

      let payload = null

      // COUPON_PROPOSAL 타입이면 payload 처리
      if (body.type === 'COUPON_PROPOSAL') {
        if (body.payload) {
          payload = typeof body.payload === 'string' ? safeParseJSON(body.payload) : body.payload
        }
      } else if (body.payload) {
        payload = typeof body.payload === 'string' ? safeParseJSON(body.payload) : body.payload
      }

      callback({
        id: body.id || Date.now(),
        senderId: body.senderId,
        senderName: body.senderName || body.sender || `유저${body.senderId}`,
        content: body.content || '',
        timestamp: new Date(body.createdAt || Date.now()).getTime(),
        type: body.type || 'CHAT',
        payload: payload,
        createdAt: body.createdAt,
      })
    } catch (err) {
      console.error('메시지 파싱 오류:', err, message.body)
    }
  })

  return () => subscription.unsubscribe()
}

// 메시지 전송 (REST 대신 WebSocket 전송)
export const sendText = (roomId, content) => {
  if (!stompClient?.connected) return Promise.reject('WebSocket 연결 없음')
  const message = { roomId, content, type: 'TEXT' }
  try {
    stompClient.send('/app/chat.send', {}, JSON.stringify(message))
    return Promise.resolve()
  } catch (err) {
    console.error('메시지 전송 실패:', err)
    return Promise.reject(err)
  }
}

// 채팅 기록 가져오기 (REST 호출)

// api/ws.js
export const fetchChatHistory = async (roomId) => {
  try {
    const { data } = await api.get(`/api/partnership/rooms/${roomId}/history`)

    const messages = data.messages.map((m) => {
      let payload = null

      if (m.payload) {
        payload = typeof m.payload === 'string' ? JSON.parse(m.payload) : m.payload
      } else if (m.type === 'COUPON_PROPOSAL' && m.content) {
        try {
          payload = JSON.parse(m.content)
        } catch (e) {
          console.error('Payload 파싱 실패:', e, m.content)
        }
      }

      return {
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName || '', // template에서 필요
        content: m.type === 'COUPON_PROPOSAL' ? '제휴 제안' : m.content || '',
        type: m.type || 'TEXT',
        payload: payload,
        createdAt: m.createdAt,
        timestamp: new Date(m.createdAt).getTime(),
      }
    })

    // roomInfo도 같이 반환
    return {
      messages,
      roomInfo: data.roomInfo || {},
    }
  } catch (err) {
    console.error('채팅 기록 불러오기 실패', err)
    throw err
  }
}

// 제휴 제안, 수락, 거절
export const proposeBilateralCoupon = (proposalMessage) => {
  if (!stompClient?.connected) throw new Error('WebSocket이 연결되지 않았습니다')
  stompClient.send('/app/chat.propose', {}, JSON.stringify(proposalMessage))
}
export const acceptBilateralCoupon = (proposalId) => {
  stompClient?.send('/app/chat.proposal.accept', {}, JSON.stringify({ proposalId }))
}
export const rejectBilateralCoupon = (proposalId, reason) => {
  stompClient?.send('/app/chat.proposal.reject', {}, JSON.stringify({ proposalId, reason }))
}
export const acceptRequest = (roomId) => {
  stompClient?.send('/app/chat.request.accept', {}, JSON.stringify({ roomId }))
}
export const rejectRequest = (roomId, reason) => {
  stompClient?.send('/app/chat.request.reject', {}, JSON.stringify({ roomId, reason }))
}

// 연결 상태 체크
export const isConnected = () => stompClient?.connected || false

// 방 정보 가져오기 (REST 호출)
export const getRoomInfo = async (roomId) => {
  try {
    const { data } = await api.get(`/api/partnership/rooms/${roomId}`)
    return data
  } catch (err) {
    console.error('방 정보 불러오기 실패', err)
    throw err
  }
}
