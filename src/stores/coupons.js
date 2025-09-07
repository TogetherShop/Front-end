// stores/coupons.js
import { defineStore } from 'pinia'

export const useCouponsStore = defineStore('coupons', {
  state: () => ({
    // 활성 탭 ('my' 또는 'received')
    activeTab: 'my',

    // 로딩 상태
    loading: false,
    error: null,

    // 필터 설정
    filters: {
      active: true,
      expired: true,
      exchanging: true,
    },

    // 검색어
    searchQuery: '',

    // 내가 발급한 쿠폰
    myCoupons: [
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
      {
        id: 4,
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
        id: 5,
        title: '피자마루',
        timeAgo: '2시간 전',
        status: 'exchanging',
        category: 'food',
        businessName: '피자마루',
        chatActive: true,
        partnerId: 1,
      },
      {
        id: 6,
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
      {
        id: 7,
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
        id: 8,
        title: '피자마루',
        timeAgo: '2시간 전',
        status: 'exchanging',
        category: 'food',
        businessName: '피자마루',
        chatActive: true,
        partnerId: 1,
      },
      {
        id: 9,
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
      {
        id: 10,
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
        id: 11,
        title: '피자마루',
        timeAgo: '2시간 전',
        status: 'exchanging',
        category: 'food',
        businessName: '피자마루',
        chatActive: true,
        partnerId: 1,
      },
      {
        id: 12,
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
    ],

    // 받은 쿠폰
    receivedCoupons: [
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
    ],

    // 채팅 관련 상태
    activeChatPartner: null,
    pendingExchanges: [],
  }),

  getters: {
    // 현재 활성 탭의 쿠폰들
    currentTabCoupons: (state) => {
      return state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons
    },

    // 필터링된 쿠폰들
    filteredCoupons: (state) => {
      const coupons = state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons

      return coupons.filter((coupon) => {
        // 상태별 필터링
        if (coupon.status === 'active' && !state.filters.active) return false
        if (coupon.status === 'expired' && !state.filters.expired) return false
        if (coupon.status === 'exchanging' && !state.filters.exchanging) return false

        return true
      })
    },

    // 검색 필터링된 쿠폰들
    searchFilteredCoupons: (state) => {
      let coupons = state.filteredCoupons

      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        coupons = coupons.filter(
          (coupon) =>
            coupon.title.toLowerCase().includes(query) ||
            (coupon.description && coupon.description.toLowerCase().includes(query)) ||
            coupon.businessName.toLowerCase().includes(query),
        )
      }

      return coupons
    },

    // 상태별 쿠폰 개수
    couponStatusCounts: (state) => {
      const counts = {
        active: 0,
        expired: 0,
        exchanging: 0,
      }

      const allCoupons = state.activeTab === 'my' ? state.myCoupons : state.receivedCoupons

      allCoupons.forEach((coupon) => {
        if (counts.hasOwnProperty(coupon.status)) {
          counts[coupon.status]++
        }
      })

      return counts
    },

    // 활성 상태인 내 쿠폰
    activeMyCoupons: (state) => {
      return state.myCoupons.filter((coupon) => coupon.status === 'active')
    },

    // 교환 중인 쿠폰들
    exchangingCoupons: (state) => {
      return state.myCoupons.filter((coupon) => coupon.status === 'exchanging')
    },

    // 만료 임박 쿠폰 (3일 이하)
    expiringSoonCoupons: (state) => {
      return [...state.myCoupons, ...state.receivedCoupons].filter(
        (coupon) => coupon.remainingDays && coupon.remainingDays <= 3 && coupon.status === 'active',
      )
    },

    // 채팅이 활성화된 쿠폰들
    couponsWithActiveChat: (state) => {
      return state.myCoupons.filter((coupon) => coupon.chatActive)
    },
  },

  actions: {
    // 탭 변경
    setActiveTab(tab) {
      this.activeTab = tab
    },

    // 검색어 설정
    setSearchQuery(query) {
      this.searchQuery = query
    },

    // 필터 토글
    toggleFilter(filterType) {
      this.filters[filterType] = !this.filters[filterType]
    },

    // 모든 필터 설정
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // 필터 초기화
    resetFilters() {
      this.filters = {
        active: true,
        expired: false,
        exchanging: true,
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null
    },

    // 새 쿠폰 발급
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

    // 쿠폰 교환 시작
    async startExchange(couponId, exchangeData) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (!coupon) return false

      try {
        coupon.status = 'exchanging'
        coupon.chatActive = true
        coupon.timeAgo = '방금 전'

        // 교환 대기 목록에 추가
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

    // 교환 취소
    cancelExchange(couponId) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (coupon && coupon.status === 'exchanging') {
        coupon.status = 'active'
        coupon.chatActive = false
        coupon.timeAgo = null

        // 교환 대기 목록에서 제거
        const exchangeIndex = this.pendingExchanges.findIndex(
          (exchange) => exchange.couponId === couponId,
        )
        if (exchangeIndex !== -1) {
          this.pendingExchanges.splice(exchangeIndex, 1)
        }

        return true
      }
      return false
    },

    // 채팅 활성화/비활성화
    toggleChat(couponId, active = true) {
      const coupon = this.myCoupons.find((c) => c.id === couponId)
      if (coupon) {
        coupon.chatActive = active
        if (active) {
          this.activeChatPartner = coupon.partnerId
        } else if (this.activeChatPartner === coupon.partnerId) {
          this.activeChatPartner = null
        }
      }
    },

    // 쿠폰 상태 업데이트
    updateCouponStatus(couponId, status) {
      const coupon =
        this.myCoupons.find((c) => c.id === couponId) ||
        this.receivedCoupons.find((c) => c.id === couponId)

      if (coupon) {
        coupon.status = status

        // 만료 상태로 변경 시 만료 시간 설정
        if (status === 'expired' && !coupon.expiredText) {
          coupon.expiredText = '방금 만료됨'
          coupon.remainingDays = 0
        }
      }
    },

    // 쿠폰 삭제
    deleteCoupon(couponId) {
      const myIndex = this.myCoupons.findIndex((c) => c.id === couponId)
      const receivedIndex = this.receivedCoupons.findIndex((c) => c.id === couponId)

      if (myIndex !== -1) {
        this.myCoupons.splice(myIndex, 1)
      } else if (receivedIndex !== -1) {
        this.receivedCoupons.splice(receivedIndex, 1)
      }

      // 교환 대기 목록에서도 제거
      const exchangeIndex = this.pendingExchanges.findIndex(
        (exchange) => exchange.couponId === couponId,
      )
      if (exchangeIndex !== -1) {
        this.pendingExchanges.splice(exchangeIndex, 1)
      }
    },

    // 유틸리티 메서드들
    formatPrice(amount) {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
      }).format(amount)
    },

    formatDate(date) {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(date))
    },

    // Toast 알림을 위한 메시지 생성
    getToastMessage(action, success = true) {
      const messages = {
        exchange: success ? '교환이 시작되었습니다.' : '교환 시작에 실패했습니다.',
        cancel: success ? '교환이 취소되었습니다.' : '교환 취소에 실패했습니다.',
        delete: success ? '쿠폰이 삭제되었습니다.' : '쿠폰 삭제에 실패했습니다.',
      }
      return messages[action] || (success ? '작업이 완료되었습니다.' : '작업에 실패했습니다.')
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
