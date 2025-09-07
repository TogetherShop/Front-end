<template>
  <div class="business-group-purchase-page">
    <!-- 상단 바 -->
    <BusinessTopBar />

    <!-- 함께지수 랭킹 섹션 -->
    <div class="ranking-container">
      <div class="ranking-header">
        <span class="material-symbols-outlined trophy-icon">trophy</span>
        <h2 class="ranking-title">함께지수 랭킹</h2>
      </div>

      <div class="ranking-list">
        <div class="ranking-item ranking-item--first">
          <div class="rank-number">1</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">카페 온다로드</span>
              <img src="@/assets/images/first.png" alt="1위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 99</span>
            </div>
          </div>
        </div>
        <div class="ranking-item">
          <div class="rank-number rank-number--second">2</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">베이커리 담음</span>
              <img src="@/assets/images/second.png" alt="2위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 88</span>
            </div>
          </div>
        </div>
        <div class="ranking-item">
          <div class="rank-number rank-number--third">3</div>
          <div class="store-image">
            <div class="store-avatar-placeholder"></div>
          </div>
          <div class="user-info">
            <div class="user-name-container">
              <span class="user-name">해어싱 스타일</span>
              <img src="@/assets/images/third.png" alt="3위" class="rank-icon" />
            </div>
            <div class="user-stats">
              <span class="score">함께지수 77</span>
            </div>
          </div>
        </div>
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

        <div class="purchase-item" :class="'purchase-item--' + item.status" v-for="item in getCurrentItems()" :key="item.id">
          <div class="item-header">
            <h4 class="item-title">{{ item.title }}</h4>
            <span class="status-badge" :class="getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span>
          </div>
          <div class="item-details">
            <span class="price">{{ formatPrice(item.price) }}</span>
            <span class="participants">
              <span class="material-symbols-outlined person-icon">person</span>
              {{ item.participants }}
            </span>
            <span v-if="item.deadline" class="deadline">
              <span class="material-symbols-outlined calendar-icon">calendar_today</span>
              {{ item.deadline }}
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :class="getProgressFillClass(item.status)" :style="{ width: item.progress + '%' }"></div>
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

// 랭킹 데이터 (API 연결 준비)
const rankingData = ref([
  {
    id: 1,
    rank: 1,
    businessName: '카페 온다로드',
    togetherScore: 4.9
  },
  {
    id: 2,
    rank: 2,
    businessName: '베이커리 담음',
    togetherScore: 4.8
  },
  {
    id: 3,
    rank: 3,
    businessName: '해어싱 스타일',
    togetherScore: 4.7
  }
])

// API에서 랭킹 데이터를 불러오는 함수 (추후 구현)
const loadRankingData = async () => {
  try {
    // const response = await getRankingData()
    // rankingData.value = response.data
    console.log('랭킹 데이터 로드 준비됨')
  } catch (error) {
    console.error('랭킹 데이터 로드 실패:', error)
  }
}

const ongoingPurchases = ref([
  {
    id: 1,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: 'D-3',
    status: 'recruiting'
  },
  {
    id: 2,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: null,
    status: 'failed'
  },
  {
    id: 3,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '10/10명 (100%)',
    progress: 100,
    deadline: null,
    status: 'success'
  }
])

const participatedPurchases = ref([
  {
    id: 4,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: 'D-3',
    status: 'recruiting',
    approvalStatus: null // 승인 상태: null, 'waiting', 'approved'
  },
  {
    id: 5,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: null,
    status: 'failed',
    approvalStatus: null
  },
  {
    id: 6,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '10/10명 (100%)',
    progress: 100,
    deadline: null,
    status: 'success',
    approvalStatus: 'waiting' // 승인대기 상태
  }
])

const registeredPurchases = ref([
  {
    id: 7,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: 'D-3',
    status: 'recruiting'
  },
  {
    id: 8,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '6/10명 (60%)',
    progress: 60,
    deadline: null,
    status: 'failed'
  },
  {
    id: 9,
    title: '포장재 1000개 공동구매',
    price: 500000,
    participants: '10/10명 (100%)',
    progress: 100,
    deadline: null,
    status: 'success'
  }
])

// 메서드
const setActiveTab = (tab) => {
  activeTab.value = tab
}

const getSectionTitle = () => {
  const titles = {
    ongoing: '진행 중인 공동구매',
    participated: '참여한 공동구매',
    registered: '등록한 공동구매'
  }
  return titles[activeTab.value] || '진행 중인 공동구매'
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
  return `$ ${price.toLocaleString()}원`
}

const openRegisterModal = () => {
  showRegisterModal.value = true
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
}

const confirmRegister = () => {
  closeRegisterModal()
  toastMessage.value = '등록 완료 되었습니다!'
  showSuccessToast.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  selectedItem.value = null
}

const confirmCancel = () => {
  closeCancelModal()
  toastMessage.value = '취소되었습니다!'
  showSuccessToast.value = true
}

const closeParticipantsModal = () => {
  showParticipantsModal.value = false
  selectedItem.value = null
}

const closeDepositModal = () => {
  showDepositModal.value = false
  selectedItem.value = null
}

const closeJoinModal = () => {
  showJoinModal.value = false
  selectedItem.value = null
}

const confirmJoin = () => {
  closeJoinModal()
  toastMessage.value = '참여 완료 되었습니다!'
  showSuccessToast.value = true
}

const hideSuccessToast = () => {
  showSuccessToast.value = false
}

onMounted(() => {
  // 초기 데이터 로드
  loadRankingData()
})
</script>

<style scoped>
@import '@/styles/business-group-purchase-page.css';
</style>
