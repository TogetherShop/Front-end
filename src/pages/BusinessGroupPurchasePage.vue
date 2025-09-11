<template>
  <div class="business-group-purchase-page">
    <!-- 상단 바 -->
    <BusinessTopBar />

    <!-- 함께지수 랭킹 섹션 -->
    <div class="ranking-container">
      <div class="ranking-header">
        <span class="trophy-icon">🏆</span>
        <h2 class="ranking-title">함께지수 랭킹</h2>
      </div>

      <!-- 랭킹 로딩 상태 -->
      <div v-if="rankingLoading" class="ranking-loading">
        <div class="ranking-loading-spinner"></div>
        <p>랭킹 데이터를 불러오는 중...</p>
      </div>

      <!-- 랭킹 데이터가 로드된 후에만 표시 -->
      <div v-else-if="rankingData.length > 0" class="ranking-list">
        <div class="ranking-item ranking-item--first">
          <div class="rank-number">{{ rankingData[0].rank }}</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">{{ rankingData[0].businessName }}</span>
              <img src="@/assets/images/first.png" alt="1위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 {{ Math.round(rankingData[0].togetherScore) }}</span>
            </div>
          </div>
        </div>
        <div v-if="rankingData[1]" class="ranking-item">
          <div class="rank-number rank-number--second">{{ rankingData[1].rank }}</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">{{ rankingData[1].businessName }}</span>
              <img src="@/assets/images/second.png" alt="2위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 {{ Math.round(rankingData[1].togetherScore) }}</span>
            </div>
          </div>
        </div>
        <div v-if="rankingData[2]" class="ranking-item">
          <div class="rank-number rank-number--third">{{ rankingData[2].rank }}</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">{{ rankingData[2].businessName }}</span>
              <img src="@/assets/images/third.png" alt="3위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 {{ Math.round(rankingData[2].togetherScore) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 랭킹 데이터 로딩 실패 시 -->
      <div v-else class="ranking-empty">
        <p>랭킹 데이터를 불러올 수 없습니다.</p>
      </div>
    </div>

    <!-- 탭 네비게이션 섹션 -->
    <div class="tab-navigation-container">
      <div class="tab-navigation">
        <button
          class="nav-btn"
          :class="{ 'nav-btn--active': activeTab === 'ongoing' }"
          @click="setActiveTab('ongoing')"
        >
          공동구매
        </button>
        <button
          class="nav-btn"
          :class="{ 'nav-btn--active': activeTab === 'participated' }"
          @click="setActiveTab('participated')"
        >
          참여내역
        </button>
        <button
          class="nav-btn"
          :class="{ 'nav-btn--active': activeTab === 'registered' }"
          @click="setActiveTab('registered')"
        >
          등록내역
        </button>
      </div>
    </div>

    <!-- 진행 중인 공동구매 섹션 -->
    <div class="group-purchase-container">
      <div class="group-purchase-section">
        <h3 class="section-title">{{ getSectionTitle() }}</h3>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="getCurrentItems().length === 0" class="empty-state">
          <p>{{ getEmptyMessage() }}</p>
        </div>

        <!-- 공동구매 아이템 목록 -->
        <div v-else class="purchase-item" :class="'purchase-item--' + item.status" v-for="item in getCurrentItems()" :key="item.projectId || item.id">
          <div class="item-header">
            <h4 class="item-title">{{ item.title }}</h4>
            <span class="status-badge" :class="getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span>
          </div>
          <div class="item-details">
            <span class="price">{{ formatPrice(item.targetMoney || item.price) }}</span>
            <span class="participants">
              <span class="material-symbols-outlined person-icon">groups</span>
              {{ formatParticipants(item) }}
            </span>
            <span v-if="item.endDate" class="deadline">
              <span class="material-symbols-outlined calendar-icon">calendar_today</span>
              {{ formatDeadline(item.endDate) }}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :class="getProgressFillClass(item.status)" :style="{ width: getProgress(item) + '%' }"></div>
          </div>
          <div class="item-actions">
            <button
              v-for="button in getActionButtons(item.status, item)"
              :key="button.type"
              :class="['action-btn', button.class]"
              :disabled="button.disabled"
              @click="handleAction(button.type, item)"
            >
              {{ button.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 플로팅 액션 버튼 -->
    <button class="fab" @click="openRegisterModal">
      <span class="material-symbols-outlined">add</span>
    </button>

    <!-- 공동구매 등록 모달 -->
    <GroupPurchaseRegisterModal
      v-if="showRegisterModal"
      @close="closeRegisterModal"
      @confirm="confirmRegister"
    />

    <!-- 참여 확인 모달 -->
    <GroupPurchaseActionModal
      v-if="showJoinModal"
      type="join"
      :item="selectedItem"
      @close="closeJoinModal"
      @confirm="confirmJoin"
    />

    <!-- 취소 확인 모달 -->
    <GroupPurchaseActionModal
      v-if="showCancelModal"
      type="cancel"
      :item="selectedItem"
      @close="closeCancelModal"
      @confirm="confirmCancel"
    />

    <!-- 입금 정보 모달 -->
    <GroupPurchaseDepositModal
      v-if="showDepositModal"
      :item="selectedItem"
      @close="closeDepositModal"
    />

    <!-- 신청자 리스트 모달 -->
    <GroupPurchaseParticipantsModal
      v-if="showParticipantsModal"
      :item="selectedItem"
      @close="closeParticipantsModal"
      @approve="handleApprove"
    />

    <!-- 성공 토스트 -->
    <BusinessSuccessToast
      :show="showSuccessToast"
      :message="toastMessage"
      @hide="hideSuccessToast"
    />

    <!-- 하단 네비게이션 -->
    <BusinessBottomNavigation />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'
import BusinessSuccessToast from '@/components/BusinessSuccessToast.vue'
import GroupPurchaseRegisterModal from '@/components/GroupPurchaseRegisterModal.vue'
import GroupPurchaseActionModal from '@/components/GroupPurchaseActionModal.vue'
import GroupPurchaseDepositModal from '@/components/GroupPurchaseDepositModal.vue'
import GroupPurchaseParticipantsModal from '@/components/GroupPurchaseParticipantsModal.vue'

// API 함수들 import
import {
  createProject,
  getProjects,
  getProjectDetail,
  participateProject,
  cancelParticipation,
  cancelProject,
  getMyProjects,
  getMyParticipations,
  approveParticipant,
  getBusinesses,
} from '@/api/group-purchase'

// 반응형 데이터
const activeTab = ref('ongoing')
const showRegisterModal = ref(false)
const showJoinModal = ref(false)
const showDepositModal = ref(false)
const showParticipantsModal = ref(false)
const showCancelModal = ref(false)
const showSuccessToast = ref(false)
const toastMessage = ref('')
const selectedItem = ref(null)
const loading = ref(false)

// 공동구매 데이터
const ongoingPurchases = ref([])
const participatedPurchases = ref([])
const registeredPurchases = ref([])

// 페이징 관련
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = ref(20)


// 랭킹 데이터
const rankingData = ref([])
const rankingLoading = ref(false) // 랭킹 로딩 상태 추가

// 랭킹 데이터를 불러오는 함수
const loadRankingData = async () => {
  try {
    rankingLoading.value = true // 로딩 시작
    const response = await getBusinesses()

    // 백엔드가 직접 배열을 반환하므로 response 자체가 데이터 배열
    if (response && Array.isArray(response) && response.length > 0) {
      // 함께지수(togetherIndex)를 기준으로 정렬
      const sortedBusinesses = response
        .sort((a, b) => (b.togetherIndex || 0) - (a.togetherIndex || 0))
        .slice(0, 3) // 상위 3개만 선택

      // 랭킹 데이터 형태로 변환
      rankingData.value = sortedBusinesses.map((business, index) => ({
        id: business.businessId,
        rank: index + 1,
        businessName: business.businessName,
        togetherScore: business.togetherIndex || 0
      }))

      console.log('랭킹 데이터 로드 완료:', rankingData.value)
    } else {
      // API 응답이 없거나 빈 배열인 경우 빈 배열 유지
      rankingData.value = []
      console.log('랭킹 데이터 없음 - 빈 상태 표시')
    }
  } catch (error) {
    console.error('랭킹 데이터 로드 실패:', error)
    // 에러 발생 시에도 빈 배열 유지 (기본값 제거)
    rankingData.value = []
  } finally {
    rankingLoading.value = false // 로딩 완료
  }
}

// API 데이터 로드 함수들
const loadOngoingPurchases = async () => {
  try {
    loading.value = true
    const response = await getProjects({
      page: currentPage.value,
      size: pageSize.value
    })

    if (response.success && response.data) {
      ongoingPurchases.value = response.data.map(item => ({
        ...item,
        // 백엔드 DDL 기준 필드 매핑
        projectId: item.id, // 백엔드: id → 프론트: projectId
        title: item.description, // 백엔드: description → 프론트: title
        targetQuantity: item.targetNumber, // 백엔드: targetNumber → 프론트: targetQuantity
        price: item.targetMoney, // 백엔드: targetMoney → 프론트: price
        status: mapApiStatus(item.status) // 백엔드 상태를 프론트 상태로 변환
      }))
      totalPages.value = response.totalPages || 0

      console.log('진행 중인 공동구매 데이터:', ongoingPurchases.value)
    }
  } catch (error) {
    console.error('진행 중인 공동구매 로드 실패:', error)
    ongoingPurchases.value = []
  } finally {
    loading.value = false
  }
}

const loadParticipatedPurchases = async () => {
  try {
    loading.value = true
    const response = await getMyParticipations({
      page: currentPage.value,
      size: pageSize.value
    })

    if (response.success && response.data) {
      // 참여한 프로젝트들의 상세 정보를 가져옴
      const detailedData = await Promise.all(
        response.data.map(async (participation) => {
          try {
            const detail = await getProjectDetail(participation.projectId)
            return {
              ...detail.data,
              // 참여자 정보 추가
              participantId: participation.id, // 백엔드: id → 프론트: participantId
              joinedAt: participation.joinedAt,
              approvalStatus: participation.status === 'APPLIED' ? 'waiting' : 'approved',

              // 백엔드 DDL 기준 필드 매핑
              projectId: detail.data.id, // 백엔드: id → 프론트: projectId
              title: detail.data.description, // 백엔드: description → 프론트: title
              targetQuantity: detail.data.targetNumber, // 백엔드: targetNumber → 프론트: targetQuantity
              price: detail.data.targetMoney, // 백엔드: targetMoney → 프론트: price
              status: mapApiStatus(detail.data.status) // 백엔드 상태를 프론트 상태로 변환
            }
          } catch (error) {
            console.error('프로젝트 상세 조회 실패:', error)
            return null
          }
        })
      )

      participatedPurchases.value = detailedData.filter(item => item !== null)
      totalPages.value = response.totalPages || 0

      console.log('참여한 공동구매 데이터:', participatedPurchases.value)
    }
  } catch (error) {
    console.error('참여한 공동구매 로드 실패:', error)
    participatedPurchases.value = []
  } finally {
    loading.value = false
  }
}

const loadRegisteredPurchases = async () => {
  try {
    loading.value = true
    const response = await getMyProjects()

    if (response.success && response.data) {
      registeredPurchases.value = response.data.map(item => ({
        ...item,
        // 백엔드 DDL 기준 필드 매핑
        projectId: item.id, // 백엔드: id → 프론트: projectId
        title: item.description, // 백엔드: description → 프론트: title
        targetQuantity: item.targetNumber, // 백엔드: targetNumber → 프론트: targetQuantity
        price: item.targetMoney, // 백엔드: targetMoney → 프론트: price
        status: mapApiStatus(item.status) // 백엔드 상태를 프론트 상태로 변환
      }))

      console.log('등록한 공동구매 데이터:', registeredPurchases.value)
    }
  } catch (error) {
    console.error('등록한 공동구매 로드 실패:', error)
    registeredPurchases.value = []
  } finally {
    loading.value = false
  }
}

// API 상태를 UI 상태로 매핑 (백엔드 DDL 기준)
const mapApiStatus = (apiStatus) => {
  const statusMap = {
    'OPEN': 'recruiting',      // 백엔드: OPEN → 프론트: recruiting
    'FULFILLED': 'success',    // 백엔드: FULFILLED → 프론트: success
    'CLOSED': 'success',       // 백엔드: CLOSED → 프론트: success
    'CANCELLED': 'failed'      // 백엔드: CANCELLED → 프론트: failed
  }
  return statusMap[apiStatus] || 'recruiting'
}

// 탭 변경 시 데이터 로드
const setActiveTab = async (tab) => {
  activeTab.value = tab
  await loadDataByTab()
}

const loadDataByTab = async () => {
  switch (activeTab.value) {
    case 'ongoing':
      await loadOngoingPurchases()
      break
    case 'participated':
      await loadParticipatedPurchases()
      break
    case 'registered':
      await loadRegisteredPurchases()
      break
  }
}

// 헬퍼 함수들
const getSectionTitle = () => {
  const titles = {
    ongoing: '진행 중인 공동구매',
    participated: '참여한 공동구매',
    registered: '등록한 공동구매'
  }
  return titles[activeTab.value] || '진행 중인 공동구매'
}

const getEmptyMessage = () => {
  const messages = {
    ongoing: '진행 중인 공동구매가 없습니다.',
    participated: '참여한 공동구매가 없습니다.',
    registered: '등록한 공동구매가 없습니다.'
  }
  return messages[activeTab.value] || '공동구매가 없습니다.'
}

const getCurrentItems = () => {
  switch (activeTab.value) {
    case 'participated':
      return participatedPurchases.value
    case 'registered':
      return registeredPurchases.value
    default:
      return ongoingPurchases.value
  }
}

const formatParticipants = (item) => {
  const current = item.currentQuantity || 0
  const target = item.targetQuantity || 0
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0
  return `${current}/${target}명 (${percentage}%)`
}

const formatDeadline = (endDate) => {
  if (!endDate) return ''

  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return '마감'
  if (diffDays === 0) return 'D-Day'
  return `D-${diffDays}`
}

const getProgress = (item) => {
  const current = item.currentQuantity || 0
  const target = item.targetQuantity || 0
  return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
}

const getStatusText = (status) => {
  const statusMap = {
    recruiting: '모집중',
    success: '성공',
    failed: '실패'
  }
  return statusMap[status] || '알 수 없음'
}

const getStatusBadgeClass = (status) => {
  return `status-badge--${status}`
}

const getProgressFillClass = (status) => {
  return `progress-fill--${status}`
}

const getActionButtons = (status, item = null) => {
  const currentTab = activeTab.value

  if (currentTab === 'ongoing') {
    // 진행 중인 공동구매 탭
    if (status === 'recruiting') {
      return [{ type: 'participate', text: '참여', class: 'participate-btn' }]
    } else if (status === 'failed' || status === 'success') {
      return [{ type: 'closed', text: '마감', class: 'closed-btn', disabled: true }]
    }
  } else if (currentTab === 'participated') {
    // 참여한 공동구매 탭
    if (status === 'recruiting') {
      return [{ type: 'cancel', text: '취소', class: 'cancel-btn' }]
    } else if (status === 'failed') {
      return [{ type: 'pending', text: '미결', class: 'pending-btn', disabled: true }]
    } else if (status === 'success') {
      // 승인 상태에 따라 다른 버튼 표시
      if (item?.approvalStatus === 'waiting') {
        return [{ type: 'approval-waiting', text: '승인대기', class: 'approval-waiting-btn' }]
      } else if (item?.approvalStatus === 'approved') {
        return [{ type: 'approval-confirmed', text: '승인', class: 'approval-confirmed-btn', disabled: true }]
      } else {
        return [{ type: 'approval-waiting', text: '승인대기', class: 'approval-waiting-btn' }]
      }
    }
  } else if (currentTab === 'registered') {
    // 등록한 공동구매 탭
    if (status === 'recruiting') {
      return [{ type: 'cancel', text: '취소', class: 'cancel-btn' }]
    } else if (status === 'failed') {
      return [{ type: 'closed', text: '마감', class: 'closed-btn', disabled: true }]
    } else if (status === 'success') {
      return [{ type: 'participants', text: '승인내역', class: 'approval-btn' }]
    }
  }

  return []
}

const handleAction = (actionType, item) => {
  switch (actionType) {
    case 'participate':
      selectedItem.value = item
      showJoinModal.value = true
      break
    case 'closed':
      // 마감된 버튼은 클릭해도 아무 동작 안함
      break
    case 'cancel':
      // 참여한 공동구매 탭에서만 취소 확인 모달 띄우기
      if (activeTab.value === 'participated' || activeTab.value === 'registered') {
        selectedItem.value = item
        showCancelModal.value = true
      }
      break
    case 'pending':
    case 'approval-waiting':
      // 참여한 공동구매 탭에서 승인대기 버튼 클릭 시 입금 정보 모달 열기
      if (activeTab.value === 'participated') {
        selectedItem.value = item
        showDepositModal.value = true
      }
      break
    case 'approval-confirmed':
      // 승인완료된 버튼은 클릭해도 아무 동작 안함 (disabled)
      break
    case 'approval':
      // 등록한 공동구매 탭에서만 승인 기능 작동
      if (activeTab.value === 'registered') {
        toastMessage.value = '승인 처리되었습니다.'
        showSuccessToast.value = true
      }
      break
    case 'participants':
      // 승인내역 모달 열기
      if (activeTab.value === 'registered') {
        selectedItem.value = item
        showParticipantsModal.value = true
      }
      break
  }
}

const formatPrice = (price) => {
  if (!price) return '₩ 0원'
  return `₩ ${price.toLocaleString()}원`
}

// 모달 관련 함수들
const openRegisterModal = () => {
  showRegisterModal.value = true
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
}

const confirmRegister = async (projectData) => {
  try {
    closeRegisterModal()
    loading.value = true

    // API 호출로 프로젝트 생성
    const response = await createProject(projectData)

    if (response.success) {
      toastMessage.value = '등록 완료 되었습니다!'
      showSuccessToast.value = true

      // 등록한 공동구매 탭으로 이동하고 데이터 새로고침
      activeTab.value = 'registered'
      await loadRegisteredPurchases()
    } else {
      showError(response.message || '등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('공동구매 등록 실패:', error)
    showError('등록 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const closeCancelModal = () => {
  showCancelModal.value = false
  selectedItem.value = null
}

const confirmCancel = async () => {
  try {
    const item = selectedItem.value
    console.log('🔍 취소하려는 아이템:', item) // 디버깅 로그

    closeCancelModal()
    loading.value = true

    // projectId 유효성 검사 및 대체값 사용
    const projectId = item.projectId || item.id

    if (!projectId) {
      console.error('❌ 프로젝트 ID가 없습니다. item:', item)
      throw new Error('프로젝트 ID가 없습니다.')
    }

    console.log('✅ 취소할 프로젝트 ID:', projectId)

    if (activeTab.value === 'participated') {
      // 참여 취소
      const response = await cancelParticipation(projectId)
      if (response.success) {
        toastMessage.value = '참여가 취소되었습니다!'
        await loadParticipatedPurchases()
      }
    } else if (activeTab.value === 'registered') {
      // 프로젝트 취소
      const response = await cancelProject(projectId)
      if (response.success) {
        toastMessage.value = '프로젝트가 취소되었습니다!'
        await loadRegisteredPurchases()
      }
    }

    showSuccessToast.value = true
  } catch (error) {
    console.error('취소 실패:', error)
    showError('취소 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const closeParticipantsModal = () => {
  showParticipantsModal.value = false
  selectedItem.value = null
}

const handleApprove = async (participantId) => {
  try {
    loading.value = true
    const response = await approveParticipant(participantId)

    if (response.success) {
      toastMessage.value = '참여가 승인되었습니다!'
      showSuccessToast.value = true

      // 참여자 목록 새로고침
      if (showParticipantsModal.value && selectedItem.value) {
        // 모달이 열려있다면 참여자 목록 새로고침 로직 추가
      }
    } else {
      showError(response.message || '승인에 실패했습니다.')
    }
  } catch (error) {
    console.error('승인 실패:', error)
    showError('승인 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const closeDepositModal = () => {
  showDepositModal.value = false
  selectedItem.value = null
}

const closeJoinModal = () => {
  showJoinModal.value = false
  selectedItem.value = null
}

const confirmJoin = async () => {
  try {
    const item = selectedItem.value
    console.log('🔍 참여하려는 아이템:', item) // 디버깅 로그

    closeJoinModal()
    loading.value = true

    // projectId 유효성 검사 및 대체값 사용
    const projectId = item.projectId || item.id

    if (!projectId) {
      console.error('❌ 프로젝트 ID가 없습니다. item:', item)
      throw new Error('프로젝트 ID가 없습니다.')
    }

    console.log('✅ 참여할 프로젝트 ID:', projectId)
    const response = await participateProject(projectId)

    if (response.success) {
      toastMessage.value = '참여 완료 되었습니다!'
      showSuccessToast.value = true

      // 참여한 공동구매 탭으로 이동하고 데이터 새로고침
      activeTab.value = 'participated'
      await loadParticipatedPurchases()
    } else {
      showError(response.message || '참여에 실패했습니다.')
    }
  } catch (error) {
    console.error('공동구매 참여 실패:', error)
    showError('참여 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const hideSuccessToast = () => {
  showSuccessToast.value = false
}

const showError = (message) => {
  toastMessage.value = message
  showSuccessToast.value = true
}

onMounted(async () => {
  // 초기 데이터 로드
  await loadRankingData()
  await loadDataByTab()
})
</script>

<style scoped>
@import '@/styles/business-group-purchase-page.css';

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 랭킹 로딩 상태 */
.ranking-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 120px;
}

.ranking-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.ranking-empty {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}
</style>
