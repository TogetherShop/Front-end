import { defineStore } from 'pinia'

const API_BASE = 'http://localhost:3000'
const FETCH_TIMEOUT_MS = 5000

// fetch with timeout helper
async function fetchWithTimeout(url, opts = {}, timeout = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err) {
    clearTimeout(id)
    throw err
  }
}

// 기존 가데이터 (fallback)
const FALLBACK_MY = [
  {
    id: 1,
    title: '아메리카노 20% 할인',
    description: '베이커리 달콤과 1:1 교환',
    participants: 47,
    maxParticipants: 50,
    progress: 94.0,
    remainingDays: 3,
    status: 'active',
    category: 'coffee',
    businessName: '베이커리 달콤',
    discountType: 'percentage',
    discountValue: 20,
  },
  {
    id: 2,
    title: '피자마루',
    timeAgo: '2시간 전',
    status: 'exchanging',
    category: 'food',
    businessName: '피자마루',
    chatActive: true,
    partnerId: 1,
  },
  {
    id: 3,
    title: '디저트 10% 할인',
    description: '헤어샵 스타일과 1:1 교환',
    participants: 50,
    maxParticipants: 50,
    progress: 100,
    remainingDays: 0,
    status: 'expired',
    category: 'dessert',
    businessName: '헤어샵 스타일',
    discountType: 'percentage',
    discountValue: 10,
    expiredText: '1주일 전 만료',
  },
  // ... 필요하면 더 추가
]

const FALLBACK_RECEIVED = [
  {
    id: 4,
    title: '피자 15% 할인',
    description: '피자마루에서 제공',
    participants: 47,
    maxParticipants: 50,
    progress: 94.0,
    remainingDays: 3,
    status: 'active',
    category: 'food',
    businessName: '피자마루',
    discountType: 'percentage',
    discountValue: 15,
  },
  {
    id: 5,
    title: '디저트 10% 할인',
    description: '헤어샵 스타일과 1:1 교환',
    participants: 50,
    maxParticipants: 50,
    progress: 100,
    remainingDays: 0,
    status: 'expired',
    category: 'dessert',
    businessName: '헤어샵 스타일',
    discountType: 'percentage',
    discountValue: 10,
    expiredText: '1주일 전 만료',
  },
]

export const useCouponsStore = defineStore('coupons', {
  state: () => ({
    activeTab: 'my',
    loading: false,
    error: null,
    filters: {
      active: true,
      expired: true,
      exchanging: true,
    },
    searchQuery: '',
    myCoupons: [...FALLBACK_MY], // 초기값은 fallback 가데이터
    receivedCoupons: [...FALLBACK_RECEIVED], // 초기값
    activeChatPartner: null,
    pendingExchanges: [],
  }),

  getters: {
    currentTabCoupons: (state) =>
      state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons,

    filteredCoupons: (state) => {
      const coupons = state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons
      return coupons.filter((coupon) => {
        if (coupon.status === 'active' && !state.filters.active) return false
        if (coupon.status === 'expired' && !state.filters.expired) return false
        if (coupon.status === 'exchanging' && !state.filters.exchanging) return false
        return true
      })
    },

    searchFilteredCoupons: (state) => {
      let coupons = state.filteredCoupons
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        coupons = coupons.filter(
          (c) =>
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.businessName && c.businessName.toLowerCase().includes(q)),
        )
      }
      return coupons
    },

    couponStatusCounts: (state) => {
      const counts = { active: 0, expired: 0, exchanging: 0 }
      const allCoupons = state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons
      allCoupons.forEach((coupon) => {
        if (counts.hasOwnProperty(coupon.status)) counts[coupon.status]++
      })
      return counts
    },

    activeMyCoupons: (state) => state.myCoupons.filter((c) => c.status === 'active'),
    exchangingCoupons: (state) => state.myCoupons.filter((c) => c.status === 'exchanging'),
    expiringSoonCoupons: (state) =>
      [...state.myCoupons, ...state.receivedCoupons].filter(
        (coupon) => coupon.remainingDays && coupon.remainingDays <= 3 && coupon.status === 'active',
      ),
    couponsWithActiveChat: (state) => state.myCoupons.filter((c) => c.chatActive),
  },

  actions: {
    setActiveTab(tab) {
      this.activeTab = tab
    },
    setSearchQuery(query) {
      this.searchQuery = query
    },
    toggleFilter(filterType) {
      this.filters[filterType] = !this.filters[filterType]
    },
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    resetFilters() {
      this.filters = { active: true, expired: false, exchanging: true }
    },
    clearError() {
      this.error = null
    },

    // ------------ 신규/변경: 서버에서 쿠폰 목록 불러오기 ------------
    // businessId: 현재 로그인된 사업자 id
    // 옵션: force -> 강제로 API 호출(캐시 갱신)
    async loadCoupons(businessId = 1, { force = false } = {}) {
      // 이미 로딩 중이면 중복 호출 방지
      if (this.loading && !force) return
      this.loading = true
      this.error = null

      const url = `${API_BASE}/api/businesses/${businessId}/coupons`
      try {
        const res = await fetchWithTimeout(
          url,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } },
          FETCH_TIMEOUT_MS,
        )
        if (!res || !res.ok) throw new Error(`Network response not ok (${res && res.status})`)
        const body = await res.json()
        if (!body || !body.success) throw new Error('Invalid response body')

        // API 스펙(권장): { success: true, myCoupons: [...], receivedCoupons: [...] }
        if (Array.isArray(body.myCoupons)) {
          this.myCoupons = body.myCoupons
        } else if (Array.isArray(body.coupons)) {
          // 만약 단일 배열로 반환된다면 서버에서 owner 필드로 분리 가능
          // 예: coupon.owner = 'my' | 'received'
          const my = body.coupons.filter((c) => c.owner === 'my')
          const received = body.coupons.filter((c) => c.owner === 'received')
          if (my.length) this.myCoupons = my
          if (received.length) this.receivedCoupons = received
        }

        if (Array.isArray(body.receivedCoupons)) {
          this.receivedCoupons = body.receivedCoupons
        }

        // 안전장치: 만약 응답이 빈 경우 fallback 유지 또는 초기화
        if (
          (!Array.isArray(body.myCoupons) || body.myCoupons.length === 0) &&
          (!Array.isArray(body.coupons) || body.coupons.length === 0)
        ) {
          // 서버가 빈 배열을 명시적으로 준다면 빈 목록으로 둘 것인지 판단 필요
          // 여기서는 빈 목록도 존중 (서버가 실제로 없다고 응답했을 수 있음)
        }
      } catch (err) {
        console.warn(
          'Failed to load coupons from API, using fallback mock data:',
          err && err.message,
        )
        // fallback: 이미 초기값으로 가데이터가 있으므로 별도 처리는 필요 없지만 안전하게 재할당
        this.myCoupons = [...FALLBACK_MY]
        this.receivedCoupons = [...FALLBACK_RECEIVED]
        this.error = err && err.message ? String(err.message) : 'network error'
      } finally {
        this.loading = false
      }
    },

    // 기존 액션들 그대로 유지 (생략하지 않고 필요시 계속 사용)
    addMyCoupon(couponData) {
      const newCoupon = {
        id: Date.now(),
        ...couponData,
        participants: 0,
        progress: 0,
        status: 'active',
        createdAt: new Date(),
      }
      this.myCoupons.unshift(newCoupon)
      return newCoupon
    },
    async startExchange(couponId, exchangeData) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (!coupon) return false
      try {
        coupon.status = 'exchanging'
        coupon.chatActive = true
        coupon.timeAgo = '방금 전'
        this.pendingExchanges.push({
          couponId,
          partnerId: exchangeData.partnerId,
          startedAt: new Date(),
        })
        return true
      } catch (error) {
        this.error = error.message
        console.error('교환 시작 실패:', error)
        return false
      }
    },
    cancelExchange(couponId) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (coupon && coupon.status === 'exchanging') {
        coupon.status = 'active'
        coupon.chatActive = false
        coupon.timeAgo = null
        const exchangeIndex = this.pendingExchanges.findIndex((e) => e.couponId === couponId)
        if (exchangeIndex !== -1) this.pendingExchanges.splice(exchangeIndex, 1)
        return true
      }
      return false
    },
    toggleChat(couponId, active = true) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (coupon) {
        coupon.chatActive = active
        if (active) this.activeChatPartner = coupon.partnerId
        else if (this.activeChatPartner === coupon.partnerId) this.activeChatPartner = null
      }
    },
    updateCouponStatus(couponId, status) {
      const coupon =
        this.myCoupons.find((c) => c.id === couponId) ||
        this.receivedCoupons.find((c) => c.id === couponId)
      if (coupon) {
        coupon.status = status
        if (status === 'expired' && !coupon.expiredText) {
          coupon.expiredText = '방금 만료됨'
          coupon.remainingDays = 0
        }
      }
    },
    deleteCoupon(couponId) {
      const myIndex = this.myCoupons.findIndex((c) => c.id === couponId)
      const receivedIndex = this.receivedCoupons.findIndex((c) => c.id === couponId)
      if (myIndex !== -1) this.myCoupons.splice(myIndex, 1)
      else if (receivedIndex !== -1) this.receivedCoupons.splice(receivedIndex, 1)
      const exchangeIndex = this.pendingExchanges.findIndex((e) => e.couponId === couponId)
      if (exchangeIndex !== -1) this.pendingExchanges.splice(exchangeIndex, 1)
    },
  },

  persist: {
    key: 'business-coupons',
    storage: localStorage,
    paths: [
      'myCoupons',
      'receivedCoupons',
      'filters',
      'activeTab',
      'pendingExchanges',
      'searchQuery',
    ],
  },
})
