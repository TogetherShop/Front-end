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
            <div
              class="sort-option"
              :class="{ active: sortBy === 'distance' }"
              @click="setSortBy('distance')"
            >
              <span>거리 순</span>
            </div>

            <div
              class="sort-option"
              :class="{ active: sortBy === 'together-score' }"
              @click="setSortBy('together-score')"
            >
              <span>함께지수 순</span>
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
          v-for="store in filteredStores"
          :key="store.id"
          :store="store"
          @request-partnership="onRequestPartnership"
          @view-detail="onViewDetail"
        />
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
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessStoreCard from '@/components/BusinessStoreCard.vue'
import BusinessStoreDetailModal from '@/components/BusinessStoreDetailModal.vue'
import BusinessPartnershipModal from '@/components/BusinessPartnershipModal.vue'
import BusinessSuccessToast from '@/components/BusinessSuccessToast.vue'

import BusinessBottomNav from '@/components/BusinessBottomNav.vue'

// 반응형 데이터
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
const activeTab = ref('recommended') // 'recommended' 또는 'all'

// 사용자 선호 업종 (회원가입 시 선택한 것들) - 실제로는 API에서 가져올 예정
const userPreferredCategories = ref(['베이커리', '카페'])

// 더미 데이터 (실제로는 API에서 가져올 데이터)
const dummyStores = [
  {
    id: 1,
    name: '달달 베이커리',
    category: '베이커리',
    distance: 500,
    rating: 4.5,
    togetherScore: 85,
    couponDescription: '월 10% 할인 쿠폰',
    image: null,
    isPartnershipAvailable: true,
  },
  {
    id: 2,
    name: '담담 베이커리',
    category: '베이커리',
    distance: 800,
    rating: 4.3,
    togetherScore: 78,
    couponDescription: '주말 15% 할인 쿠폰',
    image: null,
    isPartnershipAvailable: true,
  },
  {
    id: 3,
    name: '싱글 베이커리',
    category: '베이커리',
    distance: 500,
    rating: 4.6,
    togetherScore: 92,
    couponDescription: '신규 회원 20% 할인',
    image: null,
    isPartnershipAvailable: true,
  },
  {
    id: 4,
    name: '따뜻한 카페',
    category: '카페',
    distance: 300,
    rating: 4.4,
    togetherScore: 65,
    couponDescription: '아메리카노 2+1',
    image: null,
    isPartnershipAvailable: true,
  },
  {
    id: 5,
    name: '깔끔한 세탁소',
    category: '세탁소',
    distance: 600,
    rating: 4.2,
    togetherScore: 45,
    couponDescription: '첫 방문 30% 할인',
    image: null,
    isPartnershipAvailable: true,
  },
  {
    id: 6,
    name: '모던 헤어샵',
    category: '미용실',
    distance: 1200,
    rating: 4.7,
    togetherScore: 72,
    couponDescription: '컷+파마 20% 할인',
    image: null,
    isPartnershipAvailable: true,
  },
]

// 계산된 속성
const filteredStores = computed(() => {
  let result = stores.value

  // 탭에 따른 기본 필터링
  if (activeTab.value === 'recommended') {
    // 추천 매장: 사용자 선호 업종 + 함께지수 60 이상
    result = result.filter(
      (store) =>
        userPreferredCategories.value.includes(store.category) && store.togetherScore >= 60,
    )
  }
  // 전체 매장은 필터링 없이 모든 매장 표시

  // 검색 필터링
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (store) =>
        store.name.toLowerCase().includes(query) || store.category.toLowerCase().includes(query),
    )
  }

  // 카테고리 필터링 (선택된 경우)
  if (selectedCategories.value.length > 0) {
    result = result.filter((store) =>
      selectedCategories.value.some(
        (category) =>
          store.category.includes(category) ||
          (category === '온라인' && store.isOnline) ||
          (category === '오프라인' && !store.isOnline),
      ),
    )
  }

  // 업종 필터링 (선택된 경우)
  if (selectedBusinessTypes.value.length > 0) {
    result = result.filter((store) => selectedBusinessTypes.value.includes(store.category))
  }

  // 정렬
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'distance':
        return a.distance - b.distance
      case 'rating':
        return b.rating - a.rating
      case 'together-score':
        return b.togetherScore - a.togetherScore
      default:
        return 0
    }
  })

  // 페이지네이션용 전체 결과 저장
  filteredStoresCount.value = result.length

  // 페이지네이션
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return result.slice(startIndex, endIndex)
})

const filteredStoresCount = ref(0)

const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(filteredStoresCount.value / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current > 4) {
      pages.push('...')
    }

    const start = Math.max(2, current - 2)
    const end = Math.min(total - 1, current + 2)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 3) {
      pages.push('...')
    }

    if (total > 1) {
      pages.push(total)
    }
  }

  return pages
})

// 메서드
const onSearchInput = () => {
  currentPage.value = 1 // 검색 시 첫 페이지로 리셋
}

const toggleFilter = () => {
  showFilter.value = !showFilter.value
  if (showFilter.value) {
    showSort.value = false
  }
}

const toggleSort = () => {
  showSort.value = !showSort.value
  if (showSort.value) {
    showFilter.value = false
  }
}

const setSortBy = (value) => {
  sortBy.value = value
  showSort.value = false
  currentPage.value = 1 // 정렬 변경 시 첫 페이지로 리셋
}

const getSortText = () => {
  switch (sortBy.value) {
    case 'distance':
      return '거리 순'
    case 'together-score':
      return '함께지수 순'
    default:
      return '거리 순'
  }
}

const setActiveTab = (tab) => {
  activeTab.value = tab
  currentPage.value = 1 // 탭 변경 시 첫 페이지로 리셋
}

const setCurrentPage = (page) => {
  currentPage.value = page
}

const onRequestPartnership = (store) => {
  selectedStoreForDetail.value = null // 상세 모달 닫기
  selectedStore.value = store
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
  try {
    // API 호출로 제휴 요청 전송
    console.log('제휴 요청:', store)

    // 성공 시 모달 닫고 토스트 표시
    closeModal()
    showSuccessToast.value = true
  } catch (error) {
    console.error('제휴 요청 실패:', error)
    alert('제휴 요청에 실패했습니다. 다시 시도해주세요.')
  }
}

const fetchStores = async () => {
  try {
    loading.value = true
    // 실제로는 API 호출
    // const response = await partnershipApi.getStores()
    // stores.value = response.data

    // 현재는 더미 데이터 사용
    stores.value = dummyStores
  } catch (error) {
    console.error('매장 목록 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

// 라이프사이클
onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
@import '@/styles/business-partnership-page.css';
</style>
