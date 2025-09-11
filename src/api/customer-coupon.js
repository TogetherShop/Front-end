import axios from '@/libs/axios'
import api from './api'
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
    // 디버깅을 위한 토큰 확인
    const token = localStorage.getItem('access_token')
    console.log('getAvailableCoupons 요청 전 토큰 확인:', {
      hasToken: !!token,
      tokenLength: token?.length,
      userType: localStorage.getItem('user_type'),
    })

    const response = await api.get('/api/customer/coupons/available', {
      params,
      userType: 'customer',
    })
    console.log('발급 가능한 쿠폰 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('발급 가능한 쿠폰 목록 조회 실패:', error)
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
    const response = await api.get('/api/customer/coupons/received', {
      params,
      userType: 'customer',
    })
    console.log('받은 쿠폰 목록 조회:', response.data)
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
    const response = await api.post(
      `/api/customer/coupons/${couponId}/claim`,
      {},
      {
        userType: 'customer',
      },
    )
    console.log('쿠폰 발급 요청:', response.data)
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
    const response = await api.post(`/api/customer/coupons/${couponId}/use`, data, {
      userType: 'customer',
    })
    console.log('쿠폰 사용:', response.data)
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
    const response = await api.get(`/api/customer/coupons/${couponId}`, {
      userType: 'customer',
    })
    console.log('쿠폰 상세 정보 조회:', response.data)
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
    const response = await api.post(`/api/customer/coupons/${couponId}/check`, data, {
      userType: 'customer',
    })
    console.log('쿠폰 사용 가능 여부 확인:', response.data)
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
    const response = await api.get(`/api/customer/coupons/expiring?limit=${limit}`, {
      userType: 'customer',
    })
    console.log('기한 임박 쿠폰 조회:', response.data)
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
    const response = await api.get(`/api/customer/reviews`, {
      userType: 'customer',
    })
    console.log('최근 리뷰 조회:', response.data)
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
    const response = await api.get(`/api/customer/coupons/${couponId}/qr-code`, {
      userType: 'customer',
      responseType: 'blob', // 이미지 데이터를 Blob으로 받기
    })
    console.log('내가 발급한 쿠폰 QR 코드 생성:', response.data)

    // Blob을 Base64로 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          qrCodeData: reader.result, // data:image/png;base64,... 형태
          blob: response.data,
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(response.data)
    })
  } catch (error) {
    console.error(`쿠폰 QR 코드 생성 실패 (ID: ${couponId}):`, error)
    throw error
  }
}
