import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import api from './axios'

let client = null
let subs = {}

// 토큰 갱신 포함한 WebSocket 연결
export const connectWS = async (onConnected, onError) => {
  try {
    let token = localStorage.getItem('access_token')

    if (!token) {
      try {
        const { data } = await api.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refresh_token'),
        })
        token = data.accessToken
        localStorage.setItem('access_token', token)
        if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken)
      } catch {
        console.error('❌ WebSocket 연결 실패: 토큰 없음/갱신 실패')
        if (onError) onError('NO_TOKEN')
        return
      }
    }

    const wsUrl = import.meta.env.VITE_WS_URL
    const sock = new SockJS(`${wsUrl}?token=${encodeURIComponent(token)}`)
    client = Stomp.over(sock)

    // 🔧 디버그 모드 활성화 (문제 해결 후 null로 변경)
    client.debug = (str) => console.log('🔧 STOMP:', str)

    const headers = { Authorization: `Bearer ${token}` }
    client.connect(
      headers,
      (frame) => {
        console.log('✅ WebSocket 연결 성공:', frame)
        onConnected()
      },
      (error) => {
        console.error('❌ WebSocket 연결 실패:', error)
        onError(error)
      },
    )
  } catch (err) {
    console.error('❌ WebSocket 초기화 오류:', err)
    if (onError) onError(err)
  }
}

export const disconnectWS = () => {
  if (client) {
    Object.values(subs).forEach((s) => s.unsubscribe && s.unsubscribe())
    subs = {}
    client.disconnect(() => {})
    client = null
  }
}

export const subscribeRoom = (roomId, cb) => {
  if (!client || !client.connected) {
    console.error('❌ WebSocket 연결되지 않음')
    return null
  }

  console.log(`🔍 구독 시작: /topic/room/${roomId}`)

  const sub = client.subscribe(`/topic/room/${roomId}`, (msg) => {
    try {
      console.log('📨 원본 메시지 수신:', msg.body)

      const parsedMsg = JSON.parse(msg.body)
      console.log('📨 파싱된 메시지:', parsedMsg)

      // 🎯 메시지 타입별 로깅
      if (parsedMsg.type === 'COUPON_PROPOSAL') {
        console.log('🎯 제휴 제안 메시지 수신됨!', parsedMsg)
      } else if (parsedMsg.type === 'TEXT') {
        console.log('💬 텍스트 메시지 수신됨:', parsedMsg)
      }

      cb(parsedMsg)
    } catch (err) {
      console.error('❌ 메시지 파싱 실패:', err, msg.body)
    }
  })
  subs[roomId] = sub

  // 메타 채널 구독
  const meta = client.subscribe(`/topic/room/${roomId}/meta`, (msg) => {
    try {
      console.log('📊 메타 메시지 수신:', msg.body)
      cb({ type: 'META', payload: JSON.parse(msg.body) })
    } catch (err) {
      console.warn('❌ 메타 메시지 파싱 실패:', err)
    }
  })
  subs[roomId + ':meta'] = meta

  return () => {
    sub.unsubscribe()
    meta.unsubscribe()
    delete subs[roomId]
    delete subs[roomId + ':meta']
  }
}

const ensureConnected = () => {
  if (!client || !client.connected) {
    throw new Error('WebSocket 연결되지 않음')
  }
}

export const sendText = (roomId, content) => {
  try {
    ensureConnected()
    const message = { roomId, content, type: 'TEXT' }
    console.log('📤 텍스트 메시지 전송:', message)
    client.send('/app/chat.send', {}, JSON.stringify(message))
  } catch (err) {
    console.error('❌ 메시지 전송 실패', err)
  }
}

// 🔧 제안 전송 함수 수정
export const sendProposal = (roomId, proposalData) => {
  try {
    ensureConnected()

    // 🎯 전송할 데이터 구조 확인
    const payload = {
      roomId,
      type: 'COUPON_PROPOSAL', // 타입 명시적 추가
      ...proposalData,
    }

    console.log('📤 제휴 제안 전송:', payload)
    console.log('📤 전송 경로: /app/chat.propose')

    client.send('/app/chat.propose', {}, JSON.stringify(payload))
    console.log('✅ 제휴 제안 전송 완료')
  } catch (err) {
    console.error('❌ 제안 전송 실패', err)
    throw err // 에러를 다시 던져서 상위에서 처리할 수 있도록
  }
}

export const acceptProposal = (proposalId) => {
  try {
    ensureConnected()
    const payload = { proposalId }
    console.log('📤 제안 수락 전송:', payload)
    client.send('/app/chat.proposal.accept', {}, JSON.stringify(payload))
  } catch (err) {
    console.error('❌ 제안 수락 실패', err)
  }
}

export const rejectProposal = (proposalId, reason) => {
  try {
    ensureConnected()
    const payload = { proposalId, reason }
    console.log('📤 제안 거절 전송:', payload)
    client.send('/app/chat.proposal.reject', {}, JSON.stringify(payload))
  } catch (err) {
    console.error('❌ 제안 거절 실패', err)
  }
}

export const acceptRoomRequest = (roomId) => {
  try {
    ensureConnected()
    const payload = { roomId }
    console.log('📤 방 요청 수락 전송:', payload)
    client.send('/app/chat.request.accept', {}, JSON.stringify(payload))
  } catch (err) {
    console.error('❌ 요청 수락 실패', err)
  }
}

export const rejectRoomRequest = (roomId, reason) => {
  try {
    ensureConnected()
    const payload = { roomId, reason }
    console.log('📤 방 요청 거절 전송:', payload)
    client.send('/app/chat.request.reject', {}, JSON.stringify(payload))
  } catch (err) {
    console.error('❌ 요청 거절 실패', err)
  }
}

// 🔧 연결 상태 확인 함수 추가
export const isConnected = () => {
  const connected = client && client.connected
  console.log('🔗 WebSocket 연결 상태:', connected)
  return connected
}

// 🔧 채팅 기록 가져오기 함수 추가 (API 호출)
export const fetchChatHistory = async (roomId) => {
  try {
    console.log('📚 채팅 기록 요청:', roomId)
    const { data } = await api.get(`/api/partnership/rooms/${roomId}/history`)
    console.log('📚 채팅 기록 응답:', data)
    return data
  } catch (err) {
    console.error('❌ 채팅 기록 불러오기 실패', err)
    throw err
  }
}

// 🔧 방 정보 가져오기 함수 추가
export const getRoomInfo = async (roomId) => {
  try {
    console.log('🏠 방 정보 요청:', roomId)
    const { data } = await api.get(`/api/partnership/rooms/${roomId}`)
    console.log('🏠 방 정보 응답:', data)
    return data
  } catch (err) {
    console.error('❌ 방 정보 불러오기 실패', err)
    throw err
  }
}
