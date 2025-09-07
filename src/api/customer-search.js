import axios from '@/libs/axios'
import api from './api'

/**
 * 매장 찾기 관련 API
 */

// 매장 검색
export const searchStores = async (params = {}) => {
  try {
    const response = await api.get('/api/stores/search', {
      params: {
        query: params.query || '',
        category: params.category || '',
        location: params.location || '',
        page: params.page || 1,
        limit: params.limit || 20,
        ...params,
      },
      userType: 'customer',
    })
    console.log('매장 검색:', response.data)
    return response.data
  } catch (error) {
    console.error('매장 검색 실패:', error)
    throw error
  }
}

// 맞춤 추천 매장 목록 조회 (RecommendedBusinessDTO)
export const getRecommendedStores = async (params = {}) => {
  try {
    const response = await api.get('/api/stores/recommended', {
      params: {
        ageGroup: params.ageGroup || '20s',
        limit: params.limit || 10,
        ...params,
      },
      userType: 'customer',
    })
    console.log('추천 매장 조회 응답:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    })
    return response.data
  } catch (error) {
    console.error('추천 매장 조회 실패:', error)
    console.error('에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

// 관련 매장 추천 조회 (특정 매장 방문 고객들이 자주 가는 곳)
export const getRelatedStores = async (storeId, params = {}) => {
  try {
    const response = await api.get(`/api/stores/visit-pattern`, {
      params: {
        limit: params.limit || 10,
        ...params,
      },
      userType: 'customer',
    })
    console.log('관련 매장 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('관련 매장 조회 실패:', error)
    throw error
  }
}

// 매장 상세 정보 조회
export const getStoreDetail = async (storeId) => {
  try {
    const response = await api.get(`/api/stores/${storeId}`, {
      userType: 'customer',
    })
    console.log('매장 상세 정보 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('매장 상세 정보 조회 실패:', error)
    throw error
  }
}

// 매장 카테고리 목록 조회
export const getStoreCategories = async () => {
  try {
    const response = await api.get('/api/stores/categories', {
      userType: 'customer',
    })
    console.log('매장 카테고리 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('매장 카테고리 조회 실패:', error)
    throw error
  }
}
