import axios from '@/libs/axios'

// 고객 쿠폰 API 함수들

/**
 * 발급 가능한 쿠폰 목록 조회
 * @param {Object} params - 쿼리 파라미터 (선택사항)
 * @param {string} params.storeGroup - 매장 그룹 이름
 * @param {string} params.category - 카테고리 이름
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 항목 수
 * @returns {Promise<Object>} 쿠폰 목록 데이터
 */
export const getAvailableCoupons = async (params = {}) => {
  try {
    const response = await axios.get('/api/customer/coupons/available', { params })
    return response.data
  } catch (error) {
    console.error('발급 가능한 쿠폰 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 받은 쿠폰 목록 조회
 * @param {Object} params - 쿼리 파라미터 (선택사항)
 * @param {string} params.search - 검색어
 * @param {string} params.status - 쿠폰 상태 (active, expired, used)
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 항목 수
 * @returns {Promise<Object>} 받은 쿠폰 목록 데이터
 */
export const getReceivedCoupons = async (params = {}) => {
  try {
    const response = await axios.get('/api/customer/coupons/received', { params })
    return response.data
  } catch (error) {
    console.error('받은 쿠폰 목록 조회 실패:', error)
    throw error
  }
}

/**
 * 쿠폰 발급 요청
 * @param {number} couponId - 쿠폰 ID
 * @returns {Promise<Object>} 발급 결과
 */
export const claimCoupon = async (couponId) => {
  try {
    const response = await axios.post(`/api/customer/coupons/${couponId}/claim`)
    return response.data
  } catch (error) {
    console.error(`쿠폰 발급 실패 (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * 쿠폰 사용
 * @param {number} couponId - 쿠폰 ID
 * @param {Object} data - 사용 데이터 (선택사항)
 * @param {string} data.storeId - 매장 ID
 * @param {number} data.amount - 사용 금액
 * @returns {Promise<Object>} 사용 결과
 */
export const useCoupon = async (couponId, data = {}) => {
  try {
    const response = await axios.post(`/api/customer/coupons/${couponId}/use`, data)
    return response.data
  } catch (error) {
    console.error(`쿠폰 사용 실패 (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * 쿠폰 상세 정보 조회
 * @param {number} couponId - 쿠폰 ID
 * @returns {Promise<Object>} 쿠폰 상세 정보
 */
export const getCouponDetail = async (couponId) => {
  try {
    const response = await axios.get(`/api/customer/coupons/${couponId}`)
    return response.data
  } catch (error) {
    console.error(`쿠폰 상세 정보 조회 실패 (ID: ${couponId}):`, error)
    throw error
  }
}

/**
 * 쿠폰 사용 가능 여부 확인
 * @param {number} couponId - 쿠폰 ID
 * @param {Object} data - 확인 데이터
 * @param {string} data.storeId - 매장 ID
 * @param {number} data.amount - 주문 금액
 * @returns {Promise<Object>} 사용 가능 여부
 */
export const checkCouponAvailability = async (couponId, data) => {
  try {
    const response = await axios.post(`/api/customer/coupons/${couponId}/check`, data)
    return response.data
  } catch (error) {
    console.error(`쿠폰 사용 가능 여부 확인 실패 (ID: ${couponId}):`, error)
    throw error
  }
}


/**
 * 기한이 임박한 쿠폰 조회 (프로필 페이지용)
 * @param {number} limit - 조회할 쿠폰 개수 (기본값: 2)
 * @returns {Promise<Array>} 기한이 임박한 쿠폰 목록
 */
export const getExpiringCoupons = async (limit = 2) => {
  try {
    const response = await axios.get(`/api/customer/coupons/expiring?limit=${limit}`)
    return response.data
  } catch (error) {
    console.error('기한 임박 쿠폰 조회 실패:', error)
    throw error
  }
}

/**
 * 최근 작성한 리뷰 조회 (프로필 페이지용)
 * @param {number} limit - 조회할 리뷰 개수 (기본값: 2)
 * @returns {Promise<Array>} 최근 리뷰 목록
 */
export const getRecentReviews = async (limit = 2) => {
  try {
    const response = await axios.get(`/api/customer/reviews`)
    return response.data
  } catch (error) {
    console.error('최근 리뷰 조회 실패:', error)
    throw error
  }
}

/**
 * 내가 발급한 쿠폰 QR 코드 생성
 * @param {number} couponId - 쿠폰 ID
 * @returns {Promise<Object>} QR 코드 데이터
 */
export const createQRcode = async (couponId) => {
  try {
    const response = await axios.get(`/api/customer/coupons/${couponId}/qr-code`)
    return response.data
  } catch (error) {
    console.error(`쿠폰 QR 코드 생성 실패 (ID: ${couponId}):`, error)
    throw error
  }
}
