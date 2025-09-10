import axios from '@/libs/axios'
import api from './api'

/**
 * 고객 알림 관련 API 함수들
 */

/**
 * 고객의 알림 목록을 조회합니다.
 * @returns {Promise<Array>} 알림 목록
 */
export const getCustomerNotifications = async () => {
  try {
    // 디버깅을 위한 토큰 확인
    const token = localStorage.getItem('access_token')
    console.log('getCustomerNotifications 요청 전 토큰 확인:', {
      hasToken: !!token,
      tokenLength: token?.length,
      userType: localStorage.getItem('user_type'),
    })

    const response = await api.get('/api/notifications/customer', {
      userType: 'customer',
    })
    console.log('고객 알림 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('알림 목록 조회 실패:', error)
    console.error('에러 상세 정보:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    })
    throw error
  }
}

/**
 * 알림을 클릭 처리합니다. (CLICKED 상태로 변경)
 * @param {number} notificationId - 알림 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('알림 읽음 처리 요청:', notificationId)
    
    const response = await api.post(`/api/notifications/customer/${notificationId}/read`, {}, {
      userType: 'customer',
    })
    console.log('알림 읽음 처리 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
    console.error('에러 상세 정보:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    throw error
  }
}

/**
 * 모든 알림을 읽음 처리합니다. (READ 상태로 변경)
 * @returns {Promise<Object>} 응답 데이터
 */
export const markAllNotificationsAsRead = async () => {
  try {
    console.log('모든 알림 읽음 처리 요청')
    
    const response = await api.put('/api/notification/customer/read-all', {}, {
      userType: 'customer',
    })
    console.log('모든 알림 읽음 처리 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('모든 알림 읽음 처리 실패:', error)
    console.error('에러 상세 정보:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    throw error
  }
}

/**
 * 알림을 삭제합니다.
 * @param {number} notificationId - 알림 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export const deleteNotification = async (notificationId) => {
  try {
    console.log('알림 삭제 요청:', notificationId)
    
    const response = await api.delete(`/api/notification/${notificationId}`, {
      userType: 'customer',
    })
    console.log('알림 삭제 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('알림 삭제 실패:', error)
    console.error('에러 상세 정보:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    throw error
  }
}

/**
 * 알림 타입에 따른 아이콘을 반환합니다.
 * @param {string} notificationType - 알림 타입
 * @returns {string} Material Icons 아이콘명
 */
export const getNotificationIcon = (notificationType) => {
  const iconMap = {
    LOCATION_BASED: 'location_on',
    COUPON: 'redeem',
    PARTNERSHIP: 'handshake',
    MARKETING: 'campaign',
    SYSTEM: 'notifications'
  }
  return iconMap[notificationType] || 'notifications'
}

/**
 * 알림 타입에 따른 색상을 반환합니다.
 * @param {string} notificationType - 알림 타입
 * @returns {string} CSS 색상값
 */
export const getNotificationColor = (notificationType) => {
  const colorMap = {
    LOCATION_BASED: '#4CAF50',
    COUPON: '#FF9800',
    PARTNERSHIP: '#2196F3',
    MARKETING: '#9C27B0',
    SYSTEM: '#607D8B'
  }
  return colorMap[notificationType] || '#666666'
}

/**
 * 알림 타입에 따른 제목을 반환합니다.
 * @param {string} notificationType - 알림 타입
 * @returns {string} 알림 제목
 */
export const getNotificationTitle = (notificationType) => {
  const titleMap = {
    LOCATION_BASED: '위치 기반 알림',
    COUPON: '쿠폰 알림',
    PARTNERSHIP: '제휴 알림',
    MARKETING: '마케팅 알림',
    SYSTEM: '시스템 알림'
  }
  return titleMap[notificationType] || '알림'
}

/**
 * 날짜를 포맷팅합니다.
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatNotificationDate = (date) => {
  const notificationDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 오늘인지 확인
  if (notificationDate.toDateString() === today.toDateString()) {
    return '오늘'
  }
  
  // 어제인지 확인
  if (notificationDate.toDateString() === yesterday.toDateString()) {
    return '어제'
  }
  
  // 그 외의 경우 날짜 표시
  return notificationDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '')
}

/**
 * 시간을 포맷팅합니다.
 * @param {string|Date} date - 날짜/시간
 * @returns {string} 포맷된 시간 문자열 (HH:MM)
 */
export const formatNotificationTime = (date) => {
  const notificationDate = new Date(date)
  return notificationDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * 상대적 시간을 계산합니다.
 * @param {string|Date} date - 날짜/시간
 * @returns {string} 상대적 시간 문자열
 */
export const getRelativeTime = (date) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInMs = now - notificationDate
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) {
    return '방금 전'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`
  } else {
    return formatNotificationDate(date)
  }
}
