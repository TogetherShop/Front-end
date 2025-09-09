import api from './api'

/**
 * 특정 사업자의 최신 쿠폰 1개 조회 (매장 카드용)
 * @param {number} businessId - 사업자 ID
 * @returns {Promise<Object|null>} 최신 쿠폰 또는 null
 */
export const getLatestBusinessCoupon = async (businessId) => {
  try {
    const response = await api.get(`/api/business/coupons/${businessId}/latest`)
    return response.data
  } catch (error) {
    if (error.response?.status === 204) {
      // No Content - 쿠폰이 없는 경우
      return null
    }
    console.error('최신 쿠폰 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사업자의 최근 3개 쿠폰 조회 (상세 모달용)
 * @param {number} businessId - 사업자 ID
 * @returns {Promise<Array>} 최근 3개 쿠폰 리스트
 */
export const getRecentBusinessCoupons = async (businessId) => {
  try {
    const response = await api.get(`/api/business/coupons/${businessId}/recent`)
    return response.data || []
  } catch (error) {
    console.error('최근 쿠폰 조회 실패:', error)
    throw error
  }
}

/**
 * 특정 사업자의 모든 쿠폰 조회 (옵션)
 * @param {number} businessId - 사업자 ID
 * @param {number} limit - 조회할 개수 제한
 * @returns {Promise<Array>} 쿠폰 리스트
 */
export const getBusinessCoupons = async (businessId, limit = null) => {
  try {
    const url = limit
      ? `/api/business/coupons/${businessId}?limit=${limit}`
      : `/api/business/coupons/${businessId}`

    const response = await api.get(url)
    return response.data || []
  } catch (error) {
    console.error('사업자 쿠폰 조회 실패:', error)
    throw error
  }
}
