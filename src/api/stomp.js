import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import api from './axios' // Axios refresh 로직과 연동

let client = null
let subs = {}

// 토큰 갱신 포함한 WebSocket 연결
export const connectWS = async (onConnected, onError) => {
  try {
    let token = localStorage.getItem('access_token')

    // 토큰 없으면 refresh로 갱신
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

    // Vite 프록시 적용: 상대경로 사용
    const sock = new SockJS(`${wsUrl}?token=${encodeURIComponent(token)}`)
    client = Stomp.over(sock)
    client.debug = null // 콘솔 로그 줄이기

    const headers = { Authorization: `Bearer ${token}` }
    client.connect(headers, onConnected, onError)
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

  const sub = client.subscribe(`/topic/room/${roomId}`, (msg) => {
    try {
      cb(JSON.parse(msg.body))
    } catch {
      console.warn('❌ 메시지 파싱 실패', msg.body)
    }
  })
  subs[roomId] = sub

  // 메타 채널 구독
  const meta = client.subscribe(`/topic/room/${roomId}/meta`, (msg) => {
    try {
      cb({ type: 'META', payload: JSON.parse(msg.body) })
    } catch {
      /* noop */
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

// 메시지 전송 함수
export const sendText = (roomId, content) => {
  try {
    ensureConnected()
    client.send('/app/chat.send', {}, JSON.stringify({ roomId, content }))
  } catch (err) {
    console.error('❌ 메시지 전송 실패', err)
  }
}

export const sendProposal = (roomId, { discountPercent, totalQuantity, startDate, endDate }) => {
  try {
    ensureConnected()
    client.send(
      '/app/chat.propose',
      {},
      JSON.stringify({
        roomId,
        discountPercent,
        totalQuantity,
        startDate,
        endDate,
      }),
    )
  } catch (err) {
    console.error('❌ 제안 전송 실패', err)
  }
}

export const acceptProposal = (proposalId) => {
  try {
    ensureConnected()
    client.send('/app/chat.proposal.accept', {}, JSON.stringify({ proposalId }))
  } catch (err) {
    console.error('❌ 제안 수락 실패', err)
  }
}

export const rejectProposal = (proposalId, reason) => {
  try {
    ensureConnected()
    client.send('/app/chat.proposal.reject', {}, JSON.stringify({ proposalId, reason }))
  } catch (err) {
    console.error('❌ 제안 거절 실패', err)
  }
}

export const acceptRoomRequest = (roomId) => {
  try {
    ensureConnected()
    client.send('/app/chat.request.accept', {}, JSON.stringify({ roomId }))
  } catch (err) {
    console.error('❌ 요청 수락 실패', err)
  }
}

export const rejectRoomRequest = (roomId, reason) => {
  try {
    ensureConnected()
    client.send('/app/chat.request.reject', {}, JSON.stringify({ roomId, reason }))
  } catch (err) {
    console.error('❌ 요청 거절 실패', err)
  }
}
