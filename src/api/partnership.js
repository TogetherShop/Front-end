import api from './api'

/**
 * 제휴 관련 API
 */

// ======= PartnershipPageController =======

// 2.1 제휴페이지 매장 목록 조회
export const getPartnershipBusinesses = async () => {
  try {
    const response = await api.get('/api/partnership-page/businesses')
    console.log('제휴페이지 매장 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴페이지 매장 목록 조회 실패:', error)
    throw error
  }
}

// 2.2 제휴페이지 매장 상세 조회
export const getPartnershipBusinessDetail = async (businessId) => {
  try {
    const response = await api.get(`/api/partnership-page/businesses/${businessId}`)
    console.log('제휴페이지 매장 상세 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴페이지 매장 상세 조회 실패:', error)
    throw error
  }
}

// 2.3 내 비즈니스 정보 조회 (JWT에서 userId를 추출해서 해당 business 정보 조회)
export const getMyBusinessInfo = async () => {
  try {
    const response = await api.get('/api/users/me', {
      userType: 'business',
    })
    console.log('내 비즈니스 정보 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('내 비즈니스 정보 조회 실패:', error)
    throw error
  }
}

// ======= PartnershipRestController =======

// 3.1 제휴 요청
export const requestPartnership = async (recipientId, message = '협업을 제안합니다.') => {
  try {
    const response = await api.post(
      `/api/partnership/request/${recipientId}`,
      {},
      {
        params: { message },
        userType: 'business',
      },
    )
    console.log('제휴 요청:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴 요청 실패:', error)
    throw error
  }
}

// 3.2 제휴 요청 수락
export const acceptPartnership = async (roomId) => {
  try {
    const response = await api.post(
      `/api/partnership/accept/${roomId}`,
      {},
      {
        userType: 'business',
      },
    )
    console.log('제휴 요청 수락:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴 요청 수락 실패:', error)
    throw error
  }
}

// 3.3 제휴 요청 거절
export const rejectPartnership = async (roomId, reason = '') => {
  try {
    const response = await api.post(`/api/partnership/reject/${roomId}`, reason ? { reason } : {}, {
      userType: 'business',
    })
    console.log('제휴 요청 거절:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴 요청 거절 실패:', error)
    throw error
  }
}

// 3.4 내 채팅방 목록 조회
export const getChatRooms = async () => {
  try {
    const response = await api.get('/api/partnership/rooms', {
      userType: 'business',
    })
    console.log('내 채팅방 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('내 채팅방 목록 조회 실패:', error)
    throw error
  }
}

// 3.5 채팅방 히스토리 조회
export const getChatHistory = async (roomId, params = {}) => {
  try {
    const response = await api.get(`/api/partnership/rooms/${roomId}/history`, {
      params: {
        page: params.page || 0,
        size: params.size || 100,
      },
      userType: 'business',
    })
    console.log('채팅방 히스토리 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('채팅방 히스토리 조회 실패:', error)
    throw error
  }
}

// 3.6 채팅방 정보 조회
export const getChatRoomInfo = async (roomId) => {
  try {
    const response = await api.get(`/api/partnership/rooms/${roomId}`, {
      userType: 'business',
    })
    console.log('채팅방 정보 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('채팅방 정보 조회 실패:', error)
    throw error
  }
}
