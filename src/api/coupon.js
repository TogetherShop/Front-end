import axios from '@/libs/axios'

// 쿠폰 관련 API 함수들

/**
 * 발급 가능한 쿠폰 목록 조회
 * @returns {Promise} 쿠폰 목록 데이터
 */
export const getAvailableCoupons = async () => {
  try {
    const response = await axios.get('/api/coupons/available')
    return response.data
  } catch (error) {
    console.error('발급 가능한 쿠폰 조회 실패:', error)
    throw error
  }
}

/**
 * 받은 쿠폰 목록 조회
 * @returns {Promise} 받은 쿠폰 목록 데이터
 */
export const getReceivedCoupons = async () => {
  try {
    const response = await axios.get('/api/coupons/received')
    return response.data
  } catch (error) {
    console.error('받은 쿠폰 조회 실패:', error)
    throw error
  }
}

/**
 * 쿠폰 발급 요청
 * @param {number} couponId - 쿠폰 ID
 * @returns {Promise} 발급 결과
 */
export const claimCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/claim`)
    return response.data
  } catch (error) {
    console.error('쿠폰 발급 실패:', error)
    throw error
  }
}

/**
 * 쿠폰 사용
 * @param {number} couponId - 쿠폰 ID
 * @returns {Promise} 사용 결과
 */
export const useCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/coupons/${couponId}/use`)
    return response.data
  } catch (error) {
    console.error('쿠폰 사용 실패:', error)
    throw error
  }
}
