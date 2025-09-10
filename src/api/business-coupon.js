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
  }
}

/**
 * 내 쿠폰 목록 조회 (사업자)
 */
export const getMyCoupons = async () => {
  try {
    console.log('API 호출 시작: /api/business/coupons')
    const response = await api.get('/api/business/coupons', {
      headers: {
        userType: 'business',
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10초 타임아웃
    })

    console.log('API 응답 상태:', response.status)
    console.log('API 응답 데이터:', response.data)

    return response.data
  } catch (error) {
    console.error('사업자 쿠폰 목록 조회 실패:', error)

    // 네트워크 오류나 서버 오류에 대한 상세한 정보 제공
    if (error.response) {
      console.error('응답 오류:', error.response.status, error.response.data)
      throw new Error(
        `서버 오류: ${error.response.status} - ${error.response.data?.message || '알 수 없는 오류'}`,
      )
    } else if (error.request) {
      console.error('요청 오류:', error.request)
      throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.')
    } else {
      console.error('설정 오류:', error.message)
      throw new Error(`요청 설정 오류: ${error.message}`)
    }
  }
}

/**
 * 특정 쿠폰 분석 조회
 * GET /api/business/coupons/templates/:templateId/analysis
 */
export const getCouponAnalysis = async (templateId) => {
  try {
    const response = await api.get(`/api/business/coupons/templates/${templateId}/analysis`, {
      headers: {
        userType: 'business',
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    })
    return response.data
  } catch (error) {
    console.error(`쿠폰 분석 조회 실패 (templateId: ${templateId}):`, error)
    throw error
  }
}
