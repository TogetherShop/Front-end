import axios from '@/libs/axios'
import api from './api'

// 고객 프로필 API 함수들

/**
 * 고객 프로필 조회 (이름, 주소 등 개인정보)
 * @returns {Promise<Object>} 고객 프로필 데이터
 */
export const getCustomerProfile = async () => {
  try {
    const response = await api.get('/api/customer/profile', {
      userType: 'customer',
    })
    console.log('고객 프로필 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('고객 프로필 조회 실패:', error)
    throw error
  }
}
