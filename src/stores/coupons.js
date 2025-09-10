// src/stores/coupons.js - 간단한 수정버전
import { defineStore } from 'pinia'
import { getMyCoupons } from '@/api/business-coupon'

// fallback 가데이터
const FALLBACK_MY = [
  {
    id: 1,
    title: '아메리카노 20% 할인',
    description: '베이커리 달콤과 1:1 교환으로 작성',
    participants: 47,
    maxParticipants: 50,
    progress: 94.0,
    remainingDays: 3,
    status: 'active',
    category: 'coffee',
    businessName: '베이커리 달콤',
    discountType: 'percentage',
    discountValue: 20,
    templateId: 1,
    totalQuantity: 50,
    currentQuantity: 3,
  },
  {
    id: 2,
    title: '피자마루',
    description: '피자마루과 1:1 교환으로 작성',
    timeAgo: '2시간 전',
    status: 'exchanging',
    category: 'food',
    businessName: '피자마루',
    chatActive: true,
    partnerId: 1,
    totalQuantity: 0,
    currentQuantity: 0,
  },
]

const FALLBACK_RECEIVED = [
  {
    id: 4,
    title: '피자 15% 할인',
    description: '피자마루과 1:1 교환으로 작성',
    participants: 47,
    maxParticipants: 50,
    progress: 94.0,
    remainingDays: 3,
    status: 'active',
    category: 'food',
    businessName: '피자마루',
    discountType: 'percentage',
    discountValue: 15,
    templateId: 4,
    totalQuantity: 50,
    currentQuantity: 3,
  },
]

// API 데이터를 UI에 맞게 변환하는 함수
const transformCouponData = (coupon) => {
  const usedQuantity =
    coupon.totalQuantity && coupon.currentQuantity
      ? coupon.totalQuantity - coupon.currentQuantity
      : 0

  const progress = coupon.progress || 0
  const remainingDays = coupon.remainingDays ? Math.max(0, coupon.remainingDays) : 0
  const status = coupon.status || 'active'

  let expiredText = null
  if (status === 'expired') {
    expiredText = coupon.expiredText || '만료됨'
  }

  return {
    id: coupon.id,
    templateId: coupon.templateId,
    title: coupon.title || '제목 없음',
    description: coupon.description || '',
    participants: usedQuantity,
    maxParticipants: coupon.totalQuantity || coupon.maxParticipants || 0,
    progress: progress,
    remainingDays: remainingDays,
    status: status,
    businessName: coupon.businessName || '',
    discountValue: coupon.discountValue || 0,
    timeAgo: coupon.timeAgo || null,
    chatActive: coupon.chatActive || false,
    partnerId: coupon.partnerId || null,
    owner: coupon.owner || 'my',
    termsAndConditions: coupon.termsAndConditions || '',
    acceptedByRequester: coupon.acceptedByRequester || false,
    acceptedByRecipient: coupon.acceptedByRecipient || false,
    roomId: coupon.roomId || null,
    expiredText: expiredText,
    currentQuantity: coupon.currentQuantity || 0,
    totalQuantity: coupon.totalQuantity || 0,
    category: coupon.category || 'general',
    discountType: coupon.discountType || 'percentage',
    createdAt: coupon.createdAt || new Date(),
  }
}

export const useCouponsStore = defineStore('coupons', {
  state: () => ({
    activeTab: 'my',
    loading: false,
    error: null,
    filters: { active: true, expired: true, exchanging: true },
    searchQuery: '',
    myCoupons: [...FALLBACK_MY],
    receivedCoupons: [...FALLBACK_RECEIVED],
    activeChatPartner: null,
    pendingExchanges: [],
  }),

  getters: {
    currentTabCoupons: (state) =>
      state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons,

    filteredCoupons: (state) => {
      const coupons = state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons
      return coupons.filter((c) => {
        if (c.status === 'active' && !state.filters.active) return false
        if (c.status === 'expired' && !state.filters.expired) return false
        if (c.status === 'exchanging' && !state.filters.exchanging) return false
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
        (c) => c.remainingDays && c.remainingDays <= 3 && c.status === 'active',
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

    // 간소화된 로딩 함수
    async loadCoupons({ force = false } = {}) {
      // 중복 실행 방지
      if (this.loading && !force) {
        console.log('이미 로딩 중이므로 return')
        return
      }

      console.log('loadCoupons 시작')
      this.loading = true
      this.error = null

      let apiSuccess = false

      try {
        const data = await getMyCoupons()
        console.log('API 호출 성공:', data)
        apiSuccess = true

        if (data && data.success !== false) {
          this.myCoupons = Array.isArray(data.myCoupons)
            ? data.myCoupons.map(transformCouponData)
            : [...FALLBACK_MY]

          this.receivedCoupons = Array.isArray(data.receivedCoupons)
            ? data.receivedCoupons.map(transformCouponData)
            : [...FALLBACK_RECEIVED]
        } else {
          this.myCoupons = [...FALLBACK_MY]
          this.receivedCoupons = [...FALLBACK_RECEIVED]
        }
      } catch (err) {
        console.error('API 호출 실패:', err)
        this.error = err.message
        this.myCoupons = [...FALLBACK_MY]
        this.receivedCoupons = [...FALLBACK_RECEIVED]
      }

      // 명시적으로 loading을 false로 설정
      console.log('loading을 false로 설정')
      this.loading = false

      console.log('loadCoupons 완료, loading:', this.loading)
      return apiSuccess
    },

    // 강제 로딩 해제
    forceStopLoading() {
      console.log('강제로 loading 해제')
      this.loading = false
    },

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
