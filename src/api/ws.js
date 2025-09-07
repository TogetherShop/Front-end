import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 3000

export function connectWS(onConnect, onError) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    console.error('❌ 액세스 토큰이 없습니다. 다시 로그인해주세요.')
    if (onError) onError('NO_TOKEN')
    return
  }

  console.log('🔄 WebSocket 연결 시도 중...', {
    hasToken: !!token,
    tokenPreview: token.substring(0, 20) + '...',
  })

  try {
    const socket = new SockJS('/ws-chat?token=' + token)
    stompClient = Stomp.over(socket)

    stompClient.debug = (str) => console.log('🔧 STOMP Debug:', str)

    stompClient.connect(
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      (frame) => {
        console.log('✅ WebSocket 연결 성공:', frame)
        reconnectAttempts = 0
        if (onConnect) onConnect()
      },
      (error) => {
        console.error('❌ WebSocket 연결 실패:', error)
        handleConnectionError(error, onConnect, onError)
      },
    )
  } catch (error) {
    console.error('❌ WebSocket 초기화 오류:', error)
    if (onError) onError('INIT_ERROR')
  }
}

function handleConnectionError(error, onConnect, onError) {
  if (error && error.toString().includes('403')) {
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

export function disconnectWS() {
  if (stompClient) {
    stompClient.disconnect()
    stompClient = null
    reconnectAttempts = 0
  }
}

// 구독 함수 (널 문자 제거 및 안전한 JSON 파싱)
export const subscribeRoom = (roomId, callback) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되지 않았습니다')
    return null
  }

  const destination = `/topic/room/${roomId}`
  console.log('구독 시작:', destination)

  const subscription = stompClient.subscribe(destination, (message) => {
    try {
      if (!message.body) {
        console.warn('⚠ 빈 메시지 수신:', message)
        return
      }

      // 널 문자 제거
      const raw = message.body.replace(/\0/g, '')
      const body = JSON.parse(raw)

      const parsed = {
        id: body.id || Date.now(),
        senderId: body.senderId,
        senderName: body.senderName || body.sender || `유저${body.senderId}`,
        content: body.content || '',
        timestamp: new Date(body.createdAt || Date.now()).getTime(),
        type: body.type || 'CHAT',
        payload: body.payload || null,
        isTemp: false,
      }

      console.log('메시지 수신:', JSON.stringify(parsed))
      callback(parsed)
    } catch (error) {
      console.error('메시지 파싱 오류:', error, message.body)
    }
  })

  return () => {
    console.log('구독 해제:', destination)
    subscription.unsubscribe()
  }
}

// 메시지 전송
export const sendText = (roomId, content) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되지 않았습니다')
    return Promise.reject('WebSocket 연결 없음')
  }

  const message = { roomId, content, type: 'TEXT' }
  try {
    stompClient.send('/app/chat.send', {}, JSON.stringify(message))
    return Promise.resolve()
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    return Promise.reject(error)
  }
}

// 상호 쿠폰 제안 - 수정된 버전
export function proposeBilateralCoupon(proposalMessage) {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket이 연결되지 않았습니다')
    throw new Error('WebSocket이 연결되지 않았습니다')
  }

  console.log('🚀 ProposalMessage 전송:', JSON.stringify(proposalMessage, null, 2))

  try {
    // ProposalMessage 그대로 전송
    stompClient.send('/app/chat.propose', {}, JSON.stringify(proposalMessage))
    console.log('✅ 쿠폰 제안 전송 완료')
  } catch (error) {
    console.error('❌ 쿠폰 제안 전송 실패:', error)
    throw error
  }
}

// 상호 쿠폰 수락
export function acceptBilateralCoupon(roomId) {
  stompClient?.send('/app/chat.proposal.accept', {}, JSON.stringify({ roomId }))
}

// 상호 쿠폰 거절
export function rejectBilateralCoupon(roomId, reason) {
  stompClient?.send('/app/chat.proposal.reject', {}, JSON.stringify({ roomId, reason }))
}

export function acceptRequest(roomId) {
  stompClient?.send('/app/chat.request.accept', {}, JSON.stringify({ roomId }))
}
export function rejectRequest(roomId, reason) {
  stompClient?.send('/app/chat.request.reject', {}, JSON.stringify({ roomId, reason }))
}

export function isConnected() {
  return stompClient && stompClient.connected
}
