<template>
  <div class="business-coupon-page">
    <!-- 상단바 -->
    <BusinessTopBar />

    <!-- 탭 리스트 -->
    <div class="container-fluid pt-3">
      <div class="business-coupon-page__tab-section">
        <div class="business-coupon-page__tab-container">
          <button
            class="business-coupon-page__tab-button"
            :class="{ 'business-coupon-page__tab-button--active': activeTab === 'my' }"
            @click="activeTab = 'my'"
            type="button"
          >
            내가 발급한 쿠폰
          </button>
          <button
            class="business-coupon-page__tab-button"
            :class="{ 'business-coupon-page__tab-button--active': activeTab === 'received' }"
            @click="activeTab = 'received'"
            type="button"
          >
            받은 쿠폰
          </button>
        </div>
      </div>
    </div>

    <!-- 쿠폰 목록 -->
    <div class="business-coupon-page__coupon-list">
      <div class="container-fluid px-4 py-3" :class="{ 'py-0': activeTab === 'received' }">
        <!-- 검색바 -->
        <div class="business-coupon-page__search-section">
          <div class="business-coupon-page__search-container">
            <div class="business-coupon-page__search-input-wrapper">
              <i class="business-coupon-page__search-icon material-symbols-outlined">search</i>
              <input
                type="text"
                placeholder="쿠폰명 검색..."
                class="business-coupon-page__search-input"
                v-model="searchQuery"
              />
            </div>
            <button @click="toggleFilter" class="business-coupon-page__filter-btn">
              <i class="material-symbols-outlined">tune</i>
            </button>
          </div>

          <!-- 필터 드롭다운 -->
          <div v-if="showFilter" class="business-coupon-page__filter-dropdown">
            <div class="business-coupon-page__filter-options">
              <!-- 활성 필터 (공통) -->
              <div class="business-coupon-page__filter-option">
                <input
                  class="business-coupon-page__filter-checkbox"
                  type="checkbox"
                  id="filter-active"
                  v-model="filters.active"
                />
                <label
                  class="business-coupon-page__filter-label business-coupon-page__filter-label--active"
                  for="filter-active"
                  >활성</label
                >
              </div>

              <!-- 협의중 필터 (내가 발급한 쿠폰에만) -->
              <div v-if="activeTab === 'my'" class="business-coupon-page__filter-option">
                <input
                  class="business-coupon-page__filter-checkbox"
                  type="checkbox"
                  id="filter-exchanging"
                  v-model="filters.exchanging"
                />
                <label
                  class="business-coupon-page__filter-label business-coupon-page__filter-label--exchanging"
                  for="filter-exchanging"
                  >협의중</label
                >
              </div>

              <!-- 만료 필터 (공통) -->
              <div class="business-coupon-page__filter-option">
                <input
                  class="business-coupon-page__filter-checkbox"
                  type="checkbox"
                  id="filter-expired"
                  v-model="filters.expired"
                />
                <label
                  class="business-coupon-page__filter-label business-coupon-page__filter-label--expired"
                  for="filter-expired"
                  >만료</label
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary business-coupon-page__spinner" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-2 business-coupon-page__loading-text">쿠폰을 불러오는 중...</p>
        </div>

        <div v-else>
          <!-- 내가 발급한 쿠폰 -->
          <div v-if="activeTab === 'my'">
            <BusinessCouponCard
              v-for="coupon in paginatedMyCoupons"
              :key="coupon.id"
              :coupon="coupon"
              @chatContinue="handleChatContinue"
              @openAnalysis="handleOpenAnalysis"
            />
          </div>

          <!-- 받은 쿠폰 -->
          <div v-else>
            <BusinessCouponCard
              v-for="coupon in paginatedReceivedCoupons"
              :key="coupon.id"
              :coupon="coupon"
              @chatContinue="handleChatContinue"
              @openAnalysis="handleOpenAnalysis"
            />
          </div>

          <!-- 빈 상태 -->
          <div
            v-if="
              (activeTab === 'my' && filteredMyCoupons.length === 0) ||
              (activeTab === 'received' && filteredReceivedCoupons.length === 0)
            "
            class="business-coupon-page__empty-state"
          >
            <span class="material-symbols-outlined business-coupon-page__empty-icon">redeem</span>
            <h6 class="business-coupon-page__empty-title">
              {{ activeTab === 'my' ? '발급한 쿠폰이 없습니다' : '받은 쿠폰이 없습니다' }}
            </h6>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1" class="business-coupon-page__pagination-nav">
          <div class="business-coupon-page__pagination-container">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="page !== '...' && changePage(page)"
              class="business-coupon-page__page-btn"
              :class="{
                'business-coupon-page__page-btn--active': page === currentPage,
                'business-coupon-page__page-btn--disabled': page === '...',
              }"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- 하단 네비게이션 바 -->
    <BusinessBottomNavigation />
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponsStore } from '@/stores/coupons'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessCouponCard from '@/components/BusinessCouponCard.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'

export default {
  name: 'BusinessCouponPage',
  components: {
    BusinessTopBar,
    BusinessCouponCard,
    BusinessBottomNavigation,
  },
  setup() {
    const router = useRouter()
    const couponsStore = useCouponsStore()

    const showFilter = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = 5

    // 탭 상태 (Pinia store)
    const activeTab = computed({
      get: () => couponsStore.activeTab,
      set: (val) => couponsStore.setActiveTab(val),
    })

    const filters = computed(() => couponsStore.filters)
    const searchQuery = computed({
      get: () => couponsStore.searchQuery,
      set: (val) => couponsStore.setSearchQuery(val),
    })

    // 원본 필터링 (탭별 쿠폰)
    const filteredMyCoupons = computed(() => {
      return couponsStore.searchFilteredCoupons.filter(
        (c) => activeTab.value === 'my' && couponsStore.myCoupons.includes(c),
      )
    })

    const filteredReceivedCoupons = computed(() => {
      return couponsStore.searchFilteredCoupons.filter(
        (c) => activeTab.value === 'received' && couponsStore.receivedCoupons.includes(c),
      )
    })

    // 페이지네이션 적용된 데이터
    const paginatedMyCoupons = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      return filteredMyCoupons.value.slice(start, start + itemsPerPage)
    })

    const paginatedReceivedCoupons = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      return filteredReceivedCoupons.value.slice(start, start + itemsPerPage)
    })

    // 총 페이지 수
    const totalPages = computed(() => {
      const totalItems =
        activeTab.value === 'my'
          ? filteredMyCoupons.value.length
          : filteredReceivedCoupons.value.length
      return Math.ceil(totalItems / itemsPerPage)
    })

    // visiblePages 로직은 그대로 사용
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
        if (current > 4) pages.push('...')
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== total) pages.push(i)
        }
        if (current < total - 3) pages.push('...')
        if (total > 1) pages.push(total)
      }
      return pages
    })

    // 페이지 전환 함수 (상단으로 스크롤 포함)
    const changePage = async (page) => {
      if (typeof page !== 'number') return
      // 페이지 변경
      currentPage.value = page

      // DOM이 업데이트된 뒤에 스크롤 (가능하면 컴포넌트 루트로, 없으면 window 최상단)
      await nextTick()
      const rootEl = document.querySelector('.business-coupon-page')
      if (rootEl) {
        rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // 탭이 바뀔 때 페이지 초기화
    watch(activeTab, () => {
      currentPage.value = 1
      // 탭 전환 시에도 상단으로 이동하고 싶다면 아래 주석을 해제하세요:
      // const rootEl = document.querySelector('.business-coupon-page')
      // if (rootEl) rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // else window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    const toggleFilter = () => {
      showFilter.value = !showFilter.value
    }

    const handleOpenAnalysis = (coupon) => {
      const templateId = coupon.template_id || coupon.templateId || coupon.id
      // query로 전달 (URL에 남음, 새로고침 안전)
      router.push({
        name: 'BusinessCouponAnalysis', // 라우트 name 설정
        query: { templateId: String(templateId) },
      })
    }

    return {
      activeTab,
      filters,
      searchQuery,
      showFilter,
      toggleFilter,
      filteredMyCoupons,
      filteredReceivedCoupons,
      paginatedMyCoupons,
      paginatedReceivedCoupons,
      totalPages,
      visiblePages,
      currentPage,
      changePage,
      handleOpenAnalysis,
    }
  },
}
</script>

<style>
@import '../../styles/business-coupon.css';
</style>
