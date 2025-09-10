import api from './api'

/**
 * 공동구매 관련 API
 */

// 1.1 공동구매 프로젝트 생성
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/api/group-purchase/projects', projectData, {
      userType: 'business',
    })
    console.log('공동구매 프로젝트 생성:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 프로젝트 생성 실패:', error)
    throw error
  }
}

// 1.2 공동구매 프로젝트 목록 조회
export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/api/group-purchase/projects', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
      },
    })
    console.log('공동구매 프로젝트 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 프로젝트 목록 조회 실패:', error)
    throw error
  }
}

// 1.3 공동구매 프로젝트 상세 조회
export const getProjectDetail = async (projectId) => {
  try {
    const response = await api.get(`/api/group-purchase/projects/${projectId}`)
    console.log('공동구매 프로젝트 상세 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 프로젝트 상세 조회 실패:', error)
    throw error
  }
}

// 1.4 공동구매 참여
export const participateProject = async (projectId) => {
  try {
    // projectId 유효성 검사
    if (!projectId) {
      throw new Error('프로젝트 ID가 필요합니다.')
    }

    const numericProjectId = Number(projectId)
    if (isNaN(numericProjectId)) {
      throw new Error('유효하지 않은 프로젝트 ID입니다.')
    }

    console.log('🚀 API 호출 - 공동구매 참여, projectId:', numericProjectId)

    const response = await api.post('/api/group-purchase/participation',
      { projectId: numericProjectId },
      { userType: 'business' }
    )
    console.log('공동구매 참여:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 참여 실패:', error)

    // 더 자세한 에러 정보 제공
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.message || '잘못된 요청입니다.'
      throw new Error(errorMsg)
    }

    throw error
  }
}

// 1.5 참여 취소
export const cancelParticipation = async (projectId) => {
  try {
    const response = await api.delete(`/api/group-purchase/participation/${projectId}`, {
      userType: 'business',
    })
    console.log('공동구매 참여 취소:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 참여 취소 실패:', error)
    throw error
  }
}

// 1.6 프로젝트 취소
export const cancelProject = async (projectId) => {
  try {
    const response = await api.put(`/api/group-purchase/projects/${projectId}/cancel`, {}, {
      userType: 'business',
    })
    console.log('공동구매 프로젝트 취소:', response.data)
    return response.data
  } catch (error) {
    console.error('공동구매 프로젝트 취소 실패:', error)
    throw error
  }
}

// 1.7 내가 생성한 프로젝트 목록 조회
export const getMyProjects = async () => {
  try {
    const response = await api.get('/api/group-purchase/my-projects', {
      userType: 'business',
    })
    console.log('내가 생성한 프로젝트 목록:', response.data)
    return response.data
  } catch (error) {
    console.error('내가 생성한 프로젝트 목록 조회 실패:', error)
    throw error
  }
}

// 1.8 내가 참여한 프로젝트 목록 조회
export const getMyParticipations = async (params = {}) => {
  try {
    const response = await api.get('/api/group-purchase/my-participations', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
      },
      userType: 'business',
    })
    console.log('내가 참여한 프로젝트 목록:', response.data)
    return response.data
  } catch (error) {
    console.error('내가 참여한 프로젝트 목록 조회 실패:', error)
    throw error
  }
}

// 1.9 프로젝트 참여자 목록 조회
export const getProjectParticipants = async (projectId, params = {}) => {
  try {
    const response = await api.get(`/api/group-purchase/projects/${projectId}/participants`, {
      params: {
        page: params.page || 0,
        size: params.size || 20,
      },
    })
    console.log('프로젝트 참여자 목록:', response.data)
    return response.data
  } catch (error) {
    console.error('프로젝트 참여자 목록 조회 실패:', error)
    throw error
  }
}

// 1.10 참여 승인
export const approveParticipant = async (participantId) => {
  try {
    const response = await api.put(`/api/group-purchase/participants/${participantId}/approve`, {}, {
      userType: 'business',
    })
    console.log('참여 승인:', response.data)
    return response.data
  } catch (error) {
    console.error('참여 승인 실패:', error)
    throw error
  }
}

export const getBusinesses = async () => {
  try {
    const response = await api.get('/api/partnership-page/businesses')
    console.log('제휴페이지 매장 목록 조회:', response.data)
    return response.data
  } catch (error) {
    console.error('제휴페이지 매장 목록 조회 실패:', error)
    throw error
  }
}
