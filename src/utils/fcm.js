import { getMessaging, getToken } from 'firebase/messaging'
import { getApp } from 'firebase/app'
import api from '@/api/api'

// FCM 토큰 발급 함수
export const getFcmToken = async () => {
  try {
    const app = getApp()
    const messaging = getMessaging(app)

    const currentToken = await getToken(messaging, {
      vapidKey:
        'BAOFN15lHfGyHNIFFIklufg42Vg3YMjpV6jztQECm8yLbR8i-aYGZ6f2Na_n1DpW-5wzS7Kp14OEEIGF60YE39E',
    })
    console.log('FCM 토큰 발급 성공:', currentToken)
    return currentToken
  } catch (error) {
    console.error('FCM 토큰 발급 실패:', error)
    return null
  }
}

// FCM 토큰을 서버에 전송하는 함수
export const sendFcmTokenToServer = async (userType, token) => {
  if (!token) return

  const url =
    userType === 'customer'
      ? '/api/fcm/customer/fcm-token' // 고객 토큰 등록 API 엔드포인트
      : '/api/fcm/business/fcm-token' // 매장 토큰 등록 API 엔드포인트

  try {
    await api.post(url, { fcmToken: token }, { userType })
    console.log('FCM 토큰 서버 전송 성공')
  } catch (e) {
    console.error('FCM 토큰 서버 전송 실패:', e)
  }
}
