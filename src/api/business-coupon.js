// src/api/business-coupon.js
import api from './api'

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
 */
export const getCouponAnalysis = async (templateId) => {
  try {
    console.log(`API 호출 시작: 쿠폰 분석 (templateId: ${templateId})`)
    const response = await api.get(`/api/business/coupons/templates/${templateId}/analysis`, {
      headers: {
        userType: 'business',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log('쿠폰 분석 응답:', response.data)
    return response.data
  } catch (error) {
    console.error(`쿠폰 분석 조회 실패 (templateId: ${templateId}):`, error)

    if (error.response) {
      throw new Error(`분석 데이터를 불러올 수 없습니다: ${error.response.status}`)
    } else if (error.request) {
      throw new Error('서버에 연결할 수 없습니다.')
    } else {
      throw new Error(`분석 요청 오류: ${error.message}`)
    }
  }
}
