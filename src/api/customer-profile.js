import axios from '@/libs/axios'
import api from './api'

// 고객 프로필 API 함수들

/**
 * 고객 프로필 조회 (이름, 주소 등 개인정보)
 * @returns {Promise<Object>} 고객 프로필 데이터
 */
export const getCustomerProfile = async () => {
  try {
    // 요청 전 헤더 확인
    const token = localStorage.getItem('access_token')

    const response = await api.get('/api/customer/profile', {
      userType: 'customer',
    })
    return response.data
  } catch (error) {
    console.error('고객 프로필 조회 실패:', error)
    console.error('에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestHeaders: error.config?.headers,
    })
    throw error
  }
}
