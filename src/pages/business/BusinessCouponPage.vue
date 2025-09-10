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
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary business-coupon-page__spinner" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-2 business-coupon-page__loading-text">쿠폰을 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="alert alert-warning text-center">
          <i class="material-symbols-outlined">warning</i>
          <p>쿠폰을 불러오는 중 오류가 발생했습니다.</p>
          <button @click="retryLoad" class="btn btn-primary btn-sm">다시 시도</button>
        </div>

        <div v-else>
          <!-- 내가 발급한 쿠폰 -->
          <div v-if="activeTab === 'my'">
            <BusinessCouponCard
              v-for="coupon in paginatedMyCoupons"
              :key="`my-${coupon.id}`"
              :coupon="coupon"
              @chatContinue="handleChatContinue"
              @openAnalysis="handleOpenAnalysis"
            />
          </div>

          <!-- 받은 쿠폰 -->
          <div v-else>
            <BusinessCouponCard
              v-for="coupon in paginatedReceivedCoupons"
              :key="`received-${coupon.id}`"
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
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

    // 로컬 로딩 상태 추가
    const localLoading = ref(false)
    const loadingTimeout = ref(false)

    // 탭 상태
    const activeTab = computed({
      get: () => couponsStore.activeTab,
      set: (val) => couponsStore.setActiveTab(val),
    })

    const filters = computed(() => couponsStore.filters)
    const searchQuery = computed({
      get: () => couponsStore.searchQuery,
      set: (val) => couponsStore.setSearchQuery(val),
    })

    // 로딩 상태를 더 안전하게 관리
    const isLoading = computed(() => {
      const storeLoading = couponsStore.loading
      const localLoadingValue = localLoading.value
      console.log(`Loading check - store: ${storeLoading}, local: ${localLoadingValue}`)
      return storeLoading || localLoadingValue
    })

    const error = computed(() => couponsStore.error)

    // 필터링된 리스트는 store의 데이터를 직접 사용
    const filteredMyCoupons = computed(() => {
      const coupons = couponsStore.myCoupons
      return coupons.filter((c) => {
        // 검색 필터 적용
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase()
          const matchesSearch =
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.businessName && c.businessName.toLowerCase().includes(q))

          if (!matchesSearch) return false
        }

        // 상태 필터 적용
        if (c.status === 'active' && !filters.value.active) return false
        if (c.status === 'expired' && !filters.value.expired) return false
        if (c.status === 'exchanging' && !filters.value.exchanging) return false

        return true
      })
    })

    const filteredReceivedCoupons = computed(() => {
      const coupons = couponsStore.receivedCoupons
      return coupons.filter((c) => {
        // 검색 필터 적용
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase()
          const matchesSearch =
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.businessName && c.businessName.toLowerCase().includes(q))

          if (!matchesSearch) return false
        }

        // 상태 필터 적용
        if (c.status === 'active' && !filters.value.active) return false
        if (c.status === 'expired' && !filters.value.expired) return false
        if (c.status === 'exchanging' && !filters.value.exchanging) return false

        return true
      })
    })

    const paginatedMyCoupons = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      return filteredMyCoupons.value.slice(start, start + itemsPerPage)
    })

    const paginatedReceivedCoupons = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      return filteredReceivedCoupons.value.slice(start, start + itemsPerPage)
    })

    const totalPages = computed(() => {
      const totalItems =
        activeTab.value === 'my'
          ? filteredMyCoupons.value.length
          : filteredReceivedCoupons.value.length
      return Math.ceil(totalItems / itemsPerPage)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
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

    const changePage = async (page) => {
      if (typeof page !== 'number') return
      currentPage.value = page
      await nextTick()
      const rootEl = document.querySelector('.business-coupon-page')
      if (rootEl) rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    watch(activeTab, () => {
      currentPage.value = 1
    })

    watch(searchQuery, () => {
      currentPage.value = 1
    })

    const toggleFilter = () => {
      showFilter.value = !showFilter.value
    }

    const handleChatContinue = (couponId) => {
      const coupon = [...couponsStore.myCoupons, ...couponsStore.receivedCoupons].find(
        (c) => c.id === couponId,
      )

      if (coupon && coupon.roomId) {
        router.push({
          name: 'BusinessChat',
          params: { roomId: coupon.roomId },
          query: { partnerId: coupon.partnerId },
        })
      }
    }

    const handleOpenAnalysis = (coupon) => {
      const templateId = coupon.templateId || coupon.id

      if (coupon.status === 'exchanging' || !templateId) {
        alert('쿠폰이 아직 생성되지 않아 분석할 수 없습니다.')
        return
      }

      router.push({
        name: 'BusinessCouponAnalysis',
        query: { templateId: String(templateId) },
      })
    }

    const retryLoad = async () => {
      localLoading.value = true
      try {
        await couponsStore.loadCoupons({ force: true })
      } finally {
        localLoading.value = false
      }
    }

    // 로딩 타임아웃 설정
    let timeoutId = null

    // 페이지가 마운트되면 스토어에서 쿠폰 로드
    onMounted(async () => {
      console.log('BusinessCouponPage 마운트됨, 쿠폰 로딩 시작...')

      localLoading.value = true

      // 2초 후 강제로 로딩 해제
      timeoutId = setTimeout(() => {
        console.log('2초 타임아웃 - 강제로 모든 로딩 해제')
        localLoading.value = false
        loadingTimeout.value = true
        // store의 loading도 강제로 false로 설정
        couponsStore.loading = false
        console.log('강제 해제 후 store loading:', couponsStore.loading)
      }, 2000)

      try {
        await couponsStore.loadCoupons()
        console.log('쿠폰 로딩 성공')
        console.log('로딩 성공 후 store loading:', couponsStore.loading)

        // 성공했는데도 loading이 true면 강제로 false로 설정
        if (couponsStore.loading) {
          console.warn('로딩 성공했는데도 store loading이 true - 강제로 false 설정')
          couponsStore.loading = false
        }
      } catch (error) {
        console.error('쿠폰 로딩 중 오류:', error)
      } finally {
        localLoading.value = false
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.log('finally에서 store loading:', couponsStore.loading)
      }
    })

    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

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
      handleChatContinue,
      handleOpenAnalysis,
      retryLoad,
      isLoading,
      localLoading,
      loadingTimeout,
      error,
    }
  },
}
</script>

<style>
@import '../../styles/business-coupon.css';
</style>
