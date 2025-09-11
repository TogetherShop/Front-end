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
            <!-- 거리 필터 -->
            <div class="filter-category">
              <h6 class="filter-title">온/오프라인</h6>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="온라인" />
                  <span>온라인</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedBusinessTypes" value="오프라인" />
                  <span>오프라인</span>
                </label>
              </div>
            </div>

            <!-- 카테고리 필터 -->
            <div class="filter-category">
              <h6 class="filter-title">업종</h6>
              <div class="filter-options">
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="음식점" />
                  <span>소매</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="카페" />
                  <span>음식</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="소매업" />
                  <span>수리/개인</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="미용업" />
                  <span>예체능</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="서비스업" />
                  <span>교육</span>
                </label>
                <label class="filter-checkbox">
                  <input type="checkbox" v-model="selectedCategories" value="기타" />
                  <span>부동산</span>
                </label>
                  <label class="filter-checkbox">
                    <input type="checkbox" v-model="selectedCategories" value="음식점" />
                    <span>숙박</span>
                  </label>
                  <label class="filter-checkbox">
                    <input type="checkbox" v-model="selectedCategories" value="카페" />
                    <span>과학/기술</span>
                  </label>
                  <label class="filter-checkbox">
                    <input type="checkbox" v-model="selectedCategories" value="소매업" />
                    <span>보건의료</span>
                  </label>
                  <label class="filter-checkbox">
                    <input type="checkbox" v-model="selectedCategories" value="미용업" />
                    <span>관리/임대</span>
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

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>매장 정보를 불러오는 중...</p>
    </div>

    <!-- 추천 매장 섹션 -->
    <div v-else class="content-section">
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
        <div v-if="filteredStores.length === 0" class="empty-state">
          <p>조건에 맞는 매장이 없습니다.</p>
        </div>

        <BusinessStoreCard
          v-else
          v-for="store in filteredStores"
          :key="store.businessId"
          :store="transformStoreData(store)"
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
      <div v-if="totalPages > 1" class="pagination">
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

// API 가져오기
import {
  getPartnershipBusinesses,
  getPartnershipBusinessDetail,
  requestPartnership,
  getMyBusinessInfo,
} from '@/api/partnership'

// 거리 계산 유틸리티
import { calculateDistance, formatDistance } from '@/utils/distanceCalculator'

// 반응형 데이터
const searchQuery = ref('')
const showFilter = ref(false)
const showSort = ref(false)
const sortBy = ref('together-score')
const selectedCategories = ref([])
const selectedBusinessTypes = ref([])
const selectedCollaborationCategories = ref([])
const currentPage = ref(1)
const stores = ref([])
const selectedStoreForDetail = ref(null)
const selectedStore = ref(null)
const showSuccessToast = ref(false)
const loading = ref(false)
const activeTab = ref('recommended')
const errorMessage = ref('')

// 내 비즈니스 정보
const myBusinessInfo = ref(null)

// 페이지네이션
const itemsPerPage = 5

// 필터링된 전체 매장 목록 (페이지네이션 적용 전)
const filteredStoresAll = computed(() => {
  let result = [...stores.value]

  // 탭에 따른 기본 필터링
  if (activeTab.value === 'recommended') {
    console.log('추천 필터링 시작:', {
      myCollaborationCategory: selectedCollaborationCategories.value,
      totalStores: result.length,
      myBusinessInfo: myBusinessInfo.value,
    })

    // 추천 매장: 내 collaboration_category와 같은 business_category + 함께지수 60 이상
    result = result.filter((store) => {
      const categoryMatch = selectedCollaborationCategories.value.includes(store.businessCategory)
      const scoreMatch = (store.togetherIndex || 0) >= 60

      if (categoryMatch && scoreMatch) {
        console.log(
          `✅ ${store.businessName}: category(${store.businessCategory}) + score(${store.togetherIndex})`,
        )
      }

      return categoryMatch && scoreMatch
    })

    console.log(`추천 매장 ${result.length}개 필터링 완료`)
  }
  // 전체 매장은 필터링 없이 모든 매장 표시

  // 검색 필터링
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (store) =>
        store.businessName.toLowerCase().includes(q) ||
        store.businessCategory.toLowerCase().includes(q),
    )
  }


  //업종 필터링 (선택된 경우)
  if (selectedBusinessTypes.value.length > 0) {
    result = result.filter((store) => selectedBusinessTypes.value.includes(store.businessType))
  }
  //업종 필터링 (선택된 경우)
  if (selectedCategories.value.length > 0) {
    result = result.filter((store) => selectedCategories.value.includes(store.businessCategory))
  }

  // 정렬
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'distance':
        // 거리 정보가 없는 항목은 맨 뒤로
        if (a.distance === null && b.distance === null) return 0
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      case 'together-score':
        return (b.togetherIndex || 0) - (a.togetherIndex || 0)
      case 'name':
        return a.businessName.localeCompare(b.businessName)
      default:
        return 0
    }
  })

  return result
})

// 총 아이템 수
const totalItems = computed(() => filteredStoresAll.value.length)

// 페이지네이션이 적용된 매장 목록
const filteredStores = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredStoresAll.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

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
const transformStoreData = (apiStore) => {
  // 내 위치와 매장 위치 간의 거리 계산
  const distance = calculateDistance(
    myBusinessInfo.value?.latitude,
    myBusinessInfo.value?.longitude,
    apiStore.latitude,
    apiStore.longitude
  )

  // API 데이터를 컴포넌트에서 기대하는 형식으로 변환
  return {
    businessId: apiStore.businessId,
    businessName: apiStore.businessName,
    businessCategory: apiStore.businessCategory,
    businessType: apiStore.businessType,
    address: apiStore.address,
    latitude: apiStore.latitude,
    longitude: apiStore.longitude,
    togetherScore: apiStore.togetherIndex || 0, // API의 togetherIndex를 togetherScore로 매핑
    profileImageUrl: apiStore.profileImageUrl,
    description: apiStore.description,
    collaborationCategory: apiStore.collaborationCategory,
    isPartnershipAvailable: true, // API에서 제공하지 않으면 기본값
    distance: distance, // 계산된 거리 (km)
    distanceText: formatDistance(distance) // 포맷된 거리 텍스트
  }
}

const onSearchInput = () => {
  currentPage.value = 1
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
  selectedStoreForDetail.value = null // 상세 모달 닫기
  selectedStore.value = store
  selectedStoreForDetail.value = null
}

const onViewDetail = async (store) => {
  try {
    // API에서 상세 정보 가져오기
    const response = await getPartnershipBusinessDetail(store.businessId)

    if (response) {
      // 백엔드가 직접 PartnershipDetailDTO를 반환
      selectedStoreForDetail.value = transformStoreData(response)
    } else {
      // API 실패시 기본 정보로 모달 열기
      selectedStoreForDetail.value = transformStoreData(store)
    }
  } catch (error) {
    console.error('매장 상세 정보 조회 실패:', error)
    // 에러시에도 기본 정보로 모달 열기
    selectedStoreForDetail.value = transformStoreData(store)
  }
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

const confirmPartnership = async (store, message = '협업을 제안합니다.') => {
  try {
    loading.value = true

    // API 호출로 제휴 요청 전송
    const response = await requestPartnership(store.businessId, message)

    if (response && response.roomId) {
      // 성공 시 모달 닫고 토스트 표시
      closeModal()
      showSuccessToast.value = true
    } else {
      throw new Error('제휴 요청 응답이 올바르지 않습니다.')
    }
  } catch (error) {
    console.error('제휴 요청 실패:', error)
    alert('제휴 요청에 실패했습니다. 다시 시도해주세요.')
  }
  finally {
    loading.value = false
  }
}

const fetchStores = async () => {
  try {

    // API 호출로 매장 목록 가져오기
    const response = await getPartnershipBusinesses()

    // 백엔드가 직접 배열을 반환
    if (Array.isArray(response)) {
      // 각 매장에 거리 정보 추가
      stores.value = response.map(store => {
        const distance = calculateDistance(
          myBusinessInfo.value?.latitude,
          myBusinessInfo.value?.longitude,
          store.latitude,
          store.longitude
        )

        return {
          ...store,
          distance: distance,
          distanceText: formatDistance(distance)
        }
      })

      console.log(`${stores.value.length}개 매장 데이터 로드 완료`)
      console.log('내 위치:', myBusinessInfo.value?.latitude, myBusinessInfo.value?.longitude)
    } else {
      console.warn('예상하지 못한 API 응답 형식:', response)
      stores.value = []
    }
  } catch (error) {
    console.error('매장 목록 조회 실패:', error)

    if (error.response?.status === 404) {
      console.log('API 엔드포인트를 찾을 수 없습니다. 더미 데이터로 대체합니다.')
      // 더미 데이터 사용 (거리 정보 포함)
      const myLat = myBusinessInfo.value?.latitude || 37.5665
      const myLng = myBusinessInfo.value?.longitude || 126.9780

      stores.value = [
        {
          businessId: 1,
          businessName: '홍길동 카페',
          businessCategory: '음식점업',
          address: '서울시 강남구 테헤란로 123',
          latitude: 37.5010,
          longitude: 127.0394,
          togetherIndex: 85.5,
          profileImageUrl: 'https://example.com/profile1.jpg',
          description: '맛있는 커피와 디저트를 제공하는 카페입니다.',
          collaborationCategory: '소매업',
          distance: calculateDistance(myLat, myLng, 37.5010, 127.0394),
          distanceText: formatDistance(calculateDistance(myLat, myLng, 37.5010, 127.0394))
        },
        {
          businessId: 2,
          businessName: '김철수 베이커리',
          businessCategory: '제조업',
          address: '서울시 서초구 서초대로 456',
          latitude: 37.4979,
          longitude: 127.0276,
          togetherIndex: 92.3,
          profileImageUrl: 'https://example.com/profile2.jpg',
          description: '신선한 빵을 매일 굽는 베이커리입니다.',
          collaborationCategory: '음식점업',
          distance: calculateDistance(myLat, myLng, 37.4979, 127.0276),
          distanceText: formatDistance(calculateDistance(myLat, myLng, 37.4979, 127.0276))
        },
      ]
    } else {
      stores.value = []
    }
  }
}

// 내 비즈니스 정보 가져오기
const fetchMyBusinessInfo = async () => {
  try {
    const response = await getMyBusinessInfo()
    if (response) {
      myBusinessInfo.value = response
      // 내 collaboration_category를 추천 필터에 설정
      if (response.collaborationCategory) {
        selectedCollaborationCategories.value = [response.collaborationCategory]
        console.log('내 협업 카테고리:', response.collaborationCategory)
      }
    }
  } catch (error) {
    console.error('내 비즈니스 정보 조회 실패:', error)
    // 에러 시 기본값 설정 (예시)
    selectedCollaborationCategories.value = ['음식점업'] // 기본값
  }
}

// 라이프사이클
onMounted(async () => {
  await Promise.all([
    fetchStores(),
    fetchMyBusinessInfo(), // 내 비즈니스 정보도 함께 로드
  ])
  // 내 비즈니스 정보를 먼저 가져온 후에 매장 목록 조회 (거리 계산을 위해)
  await fetchMyBusinessInfo()
  await fetchStores()
})
</script>

<style scoped>
@import '@/styles/business-partnership-page.css';

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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
