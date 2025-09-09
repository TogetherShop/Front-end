<template>
  <div class="business-partnership-page">
    <!-- 상단 바 -->
    <BusinessTopBar />

    <!-- 검색 및 필터 섹션 -->
    <div class="search-filter-section">
      <!-- 검색창 -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="매장명, 업종 검색"
            class="search-input"
            @input="onSearchInput"
          />
        </div>
      </div>

      <!-- 필터 및 정렬 컨트롤 -->
      <div class="filter-sort-controls">
        <!-- 좌측 필터 -->
        <div class="filter-section">
          <button class="filter-button" @click="toggleFilter">
            <span class="material-symbols-outlined">tune</span>
          </button>

          <!-- 필터 드롭다운 -->
          <div v-if="showFilter" class="filter-dropdown">
            <div class="filter-category">
              <h6 class="filter-title">온/오프라인</h6>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="온라인" />
                  <span>온라인</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="오프라인" />
                  <span>오프라인</span>
                </label>
              </div>
            </div>

            <div class="filter-category">
              <h6 class="filter-title">업종</h6>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="음식점" />
                  <span>음식점</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="카페" />
                  <span>카페</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="소매업" />
                  <span>소매업</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="미용업" />
                  <span>미용업</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="서비스업" />
                  <span>서비스업</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="기타" />
                  <span>기타</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 우측 정렬 -->
        <div class="sort-section">
          <button class="sort-button" @click="toggleSort">
            <span class="sort-text">{{ getSortText() }}</span>
            <span class="material-symbols-outlined">keyboard_arrow_down</span>
          </button>

          <!-- 정렬 드롭다운 -->
          <div v-if="showSort" class="sort-dropdown">
            <div class="sort-option" @click="setSortBy('distance')">
              <span :class="{ active: sortBy === 'distance' }">거리 순</span>
              <span v-if="sortBy === 'distance'" class="material-symbols-outlined">check</span>
            </div>
            <div class="sort-option" @click="setSortBy('together-score')">
              <span :class="{ active: sortBy === 'together-score' }">함께지수 순</span>
              <span v-if="sortBy === 'together-score'" class="material-symbols-outlined"
                >check</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 추천 매장 섹션 -->
    <div class="content-section">
      <!-- 탭 헤더 -->
      <div class="section-header">
        <div class="tab-container">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'recommended' }"
            @click="setActiveTab('recommended')"
          >
            추천 매장
          </button>
          <div class="tab-divider">|</div>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'all' }"
            @click="setActiveTab('all')"
          >
            전체 매장
          </button>
        </div>
      </div>

      <!-- 매장 리스트 -->
      <div class="store-list">
        <BusinessStoreCard
          v-for="store in users"
          :key="store.id"
          :store="store"
          @request-partnership="onRequestPartnership"
          @view-detail="onViewDetail"
        >
          <template #actions>
            <!-- partnershipExists true면 요청 완료 상태로 -->
            <button v-if="store.partnershipExists" disabled class="requested-button">요청됨</button>

            <button v-else @click="$emit('request-partnership', store)" class="request-button">
              협의 요청
            </button>
          </template>
        </BusinessStoreCard>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-btn', { active: currentPage === page, ellipsis: page === '...' }]"
          @click="page !== '...' && setCurrentPage(page)"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 매장 상세 모달 -->
    <BusinessStoreDetailModal
      v-if="selectedStoreForDetail"
      :store="selectedStoreForDetail"
      @close="closeDetailModal"
      @request-partnership="onRequestPartnership"
    />

    <!-- 제휴 요청 모달 -->
    <BusinessPartnershipModal
      v-if="selectedStore"
      :store="selectedStore"
      @close="closeModal"
      @confirm="confirmPartnership"
    />

    <!-- 성공 토스트 -->
    <BusinessSuccessToast :show="showSuccessToast" @hide="hideSuccessToast" />

    <!-- 하단 네비게이션 -->
    <BusinessBottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/api'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessStoreCard from '@/components/BusinessStoreCard.vue'
import BusinessStoreDetailModal from '@/components/BusinessStoreDetailModal.vue'
import BusinessPartnershipModal from '@/components/BusinessPartnershipModal.vue'
import BusinessSuccessToast from '@/components/BusinessSuccessToast.vue'
import BusinessBottomNav from '@/components/BusinessBottomNav.vue'

// 기존 반응형 데이터
const searchQuery = ref('')
const showFilter = ref(false)
const showSort = ref(false)
const sortBy = ref('distance')
const selectedCategories = ref([])
const selectedBusinessTypes = ref([])
const currentPage = ref(1)
const stores = ref([])
const selectedStore = ref(null)
const selectedStoreForDetail = ref(null)
const showSuccessToast = ref(false)
const loading = ref(false)
const activeTab = ref('recommended')
const errorMessage = ref('')

// 사용자 선호 업종
const userPreferredCategories = ref(['베이커리', '카페'])
const dummyStores = [
  /* 기존 더미 데이터 */
]

// ------------------------
// **전체회원 조회 로직**
// ------------------------
const users = ref([]) // 검색된 회원 목록
const query = ref('')
let searchTimer = null

const filteredStores = computed(() => {
  let result = stores.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (store) => store.name.toLowerCase().includes(q) || store.category.toLowerCase().includes(q),
    )
  }
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return result.slice(startIndex, startIndex + itemsPerPage)
})
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    users.value = []
    return
  }

  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const { data } = await api.get('/api/users', {
        params: { q: searchQuery.value.trim() },
      })
      users.value = data.map((user) => ({
        ...user,
        lastMessage: user.lastMessage || '',
        lastMessageTime: user.lastMessageTime || '',
        rating: user.rating || 0,
      }))
    } catch (e) {
      console.error(e)
      users.value = []
      errorMessage.value = `검색 오류: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`
    } finally {
      loading.value = false
    }
  }, 300)
}

// ------------------------
// **협의 요청 / 채팅 생성 로직**
// ------------------------
const router = useRouter()

// 기존 매장 필터, 정렬, 페이지네이션 로직 유지

const filteredStoresCount = ref(0)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(filteredStoresCount.value / itemsPerPage))

// 페이지네이션 등 기존 메서드 유지
const onSearchInput = () => {
  currentPage.value = 1
  searchUsers()
}
const toggleFilter = () => {
  showFilter.value = !showFilter.value
  if (showFilter.value) showSort.value = false
}
const toggleSort = () => {
  showSort.value = !showSort.value
  if (showSort.value) showFilter.value = false
}
const setSortBy = (value) => {
  sortBy.value = value
  showSort.value = false
  currentPage.value = 1
}
const getSortText = () => (sortBy.value === 'distance' ? '거리 순' : '함께지수 순')
const setActiveTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1
}
const setCurrentPage = (page) => {
  currentPage.value = page
}
const onRequestPartnership = async (store) => {
  // 모달 보여주고 싶으면 모달로
  selectedStore.value = store
  selectedStoreForDetail.value = null
}
const onViewDetail = (store) => {
  selectedStoreForDetail.value = store
}
const closeDetailModal = () => {
  selectedStoreForDetail.value = null
}
const closeModal = () => {
  selectedStore.value = null
}
const hideSuccessToast = () => {
  showSuccessToast.value = false
}
const confirmPartnership = async (store) => {
  closeModal()
  showSuccessToast.value = true

  loading.value = true
  errorMessage.value = ''
  try {
    console.log('채팅방 생성 시도 - userId:', store.id)
    const { data } = await api.post(`/api/partnership/request/${store.id}`)
    console.log('채팅방 생성 성공:', data)
    router.push(`/business/chats/${data.roomId}`)
  } catch (e) {
    console.error('채팅방 생성 오류:', e)
    if (e.response?.status === 403) errorMessage.value = '권한이 없습니다. 로그인 확인'
    else if (e.response?.status === 401) errorMessage.value = '인증 필요'
    else if (e.response?.status === 404) errorMessage.value = 'API를 찾을 수 없음'
    else
      errorMessage.value = `오류: ${e.response?.status} ${e.response?.data?.message || e.message}`
  } finally {
    loading.value = false
  }
}

const fetchStores = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/users')

    // 배열을 splice로 업데이트하여 반응성 보장
    users.value.splice(
      0,
      users.value.length,
      ...data.map((user) => ({
        id: user.id,
        name: user.businessName || user.name,
        category: user.businessCategory || user.category,
        partnershipExists: !!user.partnershipExists, // boolean 강제
      })),
    )
  } catch (e) {
    console.error('매장 불러오기 오류', e)
    users.value.splice(0) // 배열 초기화
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
@import '@/styles/business-partnership-page.css';
</style>
