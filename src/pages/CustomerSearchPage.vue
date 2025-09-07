<template>
  <div class="search-page bg-white position-relative">
    <!-- 상단바 -->
    <CustomerTopBar />
    
    <!-- 메인 콘텐츠 -->
    <main class="search-page__content">
      <!-- 제목 섹션 -->
      <div class="customer-search__header text-center">
        <h1 class="customer-search__title fw-bold text-dark mb-2">당신만을 위한<br>맞춤 장소 추천</h1>
        <p class="customer-search__subtitle">데이터 기반 인사이트로 완벽한 장소를 찾아보세요</p>
      </div>
      
      <!-- 검색바 -->
      <div class="customer-search__search-container px-4 mb-4">
        <div class="customer-search__search-bar bg-white rounded shadow-sm position-relative">
          <i class="material-symbols-outlined customer-search__search-icon">search</i>
          <input 
            type="text" 
            class="customer-search__search-input" 
            placeholder="매장명 검색"
            v-model="searchQuery"
            @input="handleSearchInput"
          >
          <div v-if="isSearching" class="customer-search__search-loading position-absolute end-0 top-50 translate-middle-y me-3">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">검색 중...</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 검색 결과 섹션 -->
      <div v-if="hasSearchResults" class="customer-search__results mx-3 mb-4">
        <div class="customer-search__results-list d-flex flex-column gap-3">
          <div 
            v-for="store in searchResults" 
            :key="store.id"
            class="customer-search__result-item"
          >
            <div class="customer-search__result-content">
              <div class="customer-search__result-image">
                <div 
                  class="customer-search__result-image-bg" 
                  :style="{ backgroundImage: store.image ? `url(${store.image})` : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }"
                ></div>
              </div>
              <div class="customer-search__result-info">
                <div class="customer-search__result-header">
                  <h4 class="customer-search__result-name">{{ store.name }}</h4>
                  <span class="customer-search__result-status">{{ store.isOnline ? '온라인' : '오프라인' }}</span>
                  <div class="customer-search__result-rating" v-if="store.rating">
                    <i class="material-symbols-outlined customer-search__star-icon">star</i>
                    <span>{{ store.rating }}</span>
                  </div>
                </div>
                <span class="customer-search__result-category">{{ store.category }}</span>
                <div class="customer-search__result-address" v-if="store.address">
                  <i class="material-symbols-outlined">location_on</i>
                  <span>{{ store.address }}</span>
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>

      <!-- 검색 결과 없음 메시지 -->
      <div v-if="searchQuery.trim() && !isSearching && !hasSearchResults" class="customer-search__no-results mx-3 mb-4 text-center py-5">
        <i class="material-symbols-outlined text-muted mb-3" style="font-size: 48px;">search_off</i>
        <h4 class="text-muted mb-2">검색 결과가 없습니다</h4>
        <p class="text-muted small">다른 검색어로 시도해보세요</p>
      </div>
      
      <!-- 맞춤추천 섹션 (검색 중이 아닐 때만 표시) -->
      <div v-if="!hasSearchResults" class="customer-search__hotplace bg-light-green rounded-3 mx-3 mb-4 p-4">
        <h2 class="customer-search__hotplace-title mb-2">20대가 선택하는 핫플레이스</h2>
        <p class="customer-search__hotplace-subtitle mb-3">또래들이 가장 많이 찾는 트렌디한 장소들</p>
        
        <!-- 추천 매장 카드들 -->
        <div class="customer-search__hotplace-cards d-flex gap-3 overflow-auto">
          <div 
            v-for="store in recommendedStores" 
            :key="store.id"
            class="customer-search__hotplace-card bg-light rounded-3 p-3 flex-shrink-0" 
          >
            <div class="customer-search__hotplace-card-image position-relative mb-3">
              <div 
                class="customer-search__hotplace-card-image-bg rounded-3" 
                :style="{ backgroundImage: store.image ? `url(${store.image})` : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }"
              ></div>
              <div class="customer-search__hotplace-card-category position-absolute top-0 end-0 m-2">
                <span class="badge bg-white text-dark border">{{ store.category || '매장' }}</span>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h3 class="customer-search__hotplace-card-name fw-bold text-dark mb-0">{{ store.name }}</h3>
              <div class="d-flex align-items-center">
                <i class="material-symbols-outlined text-warning me-1 customer-search__hotplace-card-rating-icon">star</i>
                <span class="fw-semibold text-dark">{{ store.rating || '0.0' }}</span>
              </div>
            </div>
            <p class="customer-search__hotplace-card-description text-muted small mb-2">{{ store.description || '매장 설명이 없습니다.' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="customer-search__hotplace-card-address d-flex align-items-center">
                <i class="material-symbols-outlined customer-search__hotplace-card-address-icon">location_on</i>
                <span class="text-muted small">{{ store.address || '주소 정보 없음' }}</span>
              </div>
              <span class="customer-search__hotplace-card-visitor-count">{{ store.visitorCount || '0' }}명</span>
            </div>
          </div>

        </div>
      </div>
      
      <!-- 관련 매장 추천 섹션 (검색 중이 아닐 때만 표시) -->
      <div v-if="!hasSearchResults" class="customer-search__related bg-light-green rounded-3 mx-3 mb-5 p-4">
        <h2 class="customer-search__related-title mb-2">
          <span class="customer-search__related-title-highlight">스타벅스 강남점</span><span class="customer-search__related-title-normal">을<br>방문한 고객들이 자주 가는 곳</span>
        </h2>
        <p class="customer-search__related-subtitle text-muted small mb-3">유사한 취향을 가진 고객들의 선택</p>
        
        <!-- 관련 매장 카드들 -->
        <div class="customer-search__related-cards d-flex gap-3 overflow-auto">
          <div 
            v-for="store in relatedStores" 
            :key="store.id"
            class="customer-search__related-card bg-light rounded-3 p-3 flex-shrink-0" 
          >
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h3 class="customer-search__related-card-name fw-bold text-dark mb-0">{{ store.name }}</h3>
              <span 
                class="badge customer-search__related-card-category bg-light-green text-primary"
              >{{ store.category || '매장' }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="customer-search__related-card-progress flex-grow-1 me-3">
                <div class="progress customer-search__related-card-progress-bar">
                  <div 
                    class="progress-bar customer-search__related-card-progress-fill bg-primary"
                    :style="{ width: `${store.matchPercentage || 0}%` }"
                  ></div>
                </div>
              </div>
              <span 
                class="fw-semibold customer-search__related-card-percentage text-primary"
              >{{ store.matchPercentage || 0 }}%</span>
            </div>
          </div>

        </div>
      </div>
    </main>
    
    <!-- 하단 네비게이션 -->
    <CustomerBottomNavigation />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue'

export default {
  name: 'SearchPage',
  components: {
    CustomerTopBar,
    CustomerBottomNavigation
  },
  setup() {
    // 반응형 데이터
    const searchQuery = ref('')
    const isSearching = ref(false)

    // 더미 데이터 - 피그마 디자인 기반
    const recommendedStores = ref([
      {
        id: 'cafe-moment',
        name: '카페 모먼트',
        category: '카페',
        rating: 4.8,
        description: '감성적인 인테리어와 맛있는 원두로 유명한 카페',
        address: '서울특별시 강남구 테헤란로 123',
        visitorCount: 1240,
        image: null,
        isOnline: false
      },
      {
        id: 'brunch-house',
        name: '브런치 하우스',
        category: '음식점',
        rating: 4.6,
        description: '건강한 재료로 만든 브런치 전문점',
        address: '서울특별시 강남구 압구정로 456',
        visitorCount: 890,
        image: null,
        isOnline: true
      },
      {
        id: 'coffee-bean',
        name: '커피빈 강남점',
        category: '카페',
        rating: 4.5,
        description: '프리미엄 원두로 만든 특별한 커피',
        address: '서울특별시 강남구 선릉로 789',
        visitorCount: 1560,
        image: null,
        isOnline: false
      },
      {
        id: 'bakery-sweet',
        name: '베이커리 스위트',
        category: '베이커리',
        rating: 4.7,
        description: '수제 빵과 디저트로 유명한 베이커리',
        address: '서울특별시 강남구 도곡로 321',
        visitorCount: 980,
        image: null,
        isOnline: true
      }
    ])

    const relatedStores = ref([
      {
        id: 'twosome-place',
        name: '투썸플레이스',
        category: '카페',
        matchPercentage: 85,
        rating: 4.3,
        description: '프리미엄 디저트와 커피를 제공하는 카페',
        address: '서울특별시 강남구 역삼로 123'
      },
      {
        id: 'bagel-bagel',
        name: '베이글베이글',
        category: '카페',
        matchPercentage: 72,
        rating: 4.1,
        description: '수제 베이글과 커피가 유명한 카페',
        address: '서울특별시 강남구 테헤란로 456'
      },
      {
        id: 'salady',
        name: '샐러디',
        category: '샐러드',
        matchPercentage: 68,
        rating: 4.0,
        description: '신선한 샐러드와 건강한 식사',
        address: '서울특별시 강남구 선릉로 789'
      },
      {
        id: 'subway',
        name: '서브웨이',
        category: '샌드위치',
        matchPercentage: 55,
        rating: 3.8,
        description: '신선한 재료로 만든 샌드위치',
        address: '서울특별시 강남구 도곡로 321'
      },
      {
        id: 'mcdonalds',
        name: '맥도날드',
        category: '패스트푸드',
        matchPercentage: 45,
        rating: 3.5,
        description: '전 세계적으로 사랑받는 패스트푸드',
        address: '서울특별시 강남구 압구정로 654'
      }
    ])

    // 전체 매장 데이터 (검색용)
    const allStores = computed(() => [...recommendedStores.value, ...relatedStores.value])

    const popularSearchTerms = ref([
      '스타벅스',
      '카페',
      '맥도날드',
      '맘스터치',
      '투썸플레이스'
    ])

    // 검색 결과 (검색 시 필터링된 데이터)
    const searchResults = ref([])

    // 검색 결과가 있는지 확인하는 computed
    const hasSearchResults = computed(() => searchResults.value.length > 0)

    // 매장 검색 (더미 데이터에서 필터링)
    const searchStoresHandler = () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
      }

      isSearching.value = true
      
      // 더미 검색 로직
      setTimeout(() => {
        const query = searchQuery.value.toLowerCase()
        
        searchResults.value = allStores.value.filter(store => 
          store.name.toLowerCase().includes(query) ||
          store.category.toLowerCase().includes(query) ||
          (store.description && store.description.toLowerCase().includes(query)) ||
          (store.address && store.address.toLowerCase().includes(query))
        )
        
        isSearching.value = false
      }, 500)
    }

    // 검색어 변경 감지 (디바운싱)
    const debouncedSearch = computed(() => {
      let timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          searchStoresHandler()
        }, 300)
      }
    })

    // 검색어 입력 핸들러
    const handleSearchInput = () => {
      debouncedSearch.value()
    }

    return {
      // 반응형 데이터
      searchQuery,
      recommendedStores,
      relatedStores,
      popularSearchTerms,
      searchResults,
      isSearching,
      hasSearchResults,
      
      // 메서드
      handleSearchInput,
      searchStoresHandler
    }
  }
}
</script>

<style>
@import '../styles/customer-search-page.css';
</style>
