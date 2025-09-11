import { defineStore } from 'pinia'
import defaultStoreImg from '@/assets/images/togethershop_cursor.png'

export const useStoresStore = defineStore('stores', {
  state: () => ({
    stores: [],
    filteredStores: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
      type: 'all',
      hasDiscount: false,
      distance: 5000, // 5km
    },
    currentUserLocation: null, // { latitude, longitude }
  }),

  getters: {
    storeCount: (state) => state.stores.length,

    nearbyStores: (state) => {
      if (!state.currentUserLocation) return state.stores
      return state.stores
        .filter((store) => store.distance <= state.filters.distance)
        .sort((a, b) => a.distance - b.distance)
    },

    discountStores: (state) => state.stores.filter((s) => s.hasDiscount),

    storesByCategory: (state) => {
      const categories = {}
      state.stores.forEach((store) => {
        const category = store.type || 'other'
        if (!categories[category]) categories[category] = []
        categories[category].push(store)
      })
      return categories
    },
  },

  actions: {
    /**
     * 백엔드의 /api/stores/nearby (인증 필요) 호출
     * 응답: Business(또는 DTO) 리스트 → 프론트 표시용으로 매핑
     */
    // /Users/jeongminji/Front-end/src/stores/stores.js
    async fetchNearbyStores(lat, lng, radius = 5000) {
      this.isLoading = true
      this.error = null
      this.currentUserLocation = { latitude: lat, longitude: lng }

      try {
        const raw = localStorage.getItem('access_token') || ''
        // 앞/뒤 따옴표 제거, 선행 Bearer 제거 → 순수 토큰만 남김
        const pure = raw.replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '')
        if (!pure) throw new Error('로그인이 필요합니다')

        const url = `/api/stores/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${pure}`,
          },
        })

        if (res.status === 401 || res.status === 403) {
          throw new Error('인증이 필요합니다. 다시 로그인 해주세요.')
        }
        if (!res.ok) throw new Error('매장 데이터를 불러올 수 없습니다')

        const data = await res.json()
        const mapped = this.mapToFrontStores(data, this.currentUserLocation).sort(
          (a, b) => a.distance - b.distance,
        )
        this.stores = mapped
        this.applyFilters()
      } catch (err) {
        console.error('[nearby] fetch error:', err)
        this.error = err.message || '매장 데이터를 불러올 수 없습니다'
      } finally {
        this.isLoading = false
      }
    },
    /**
     * 백엔드 → 프론트 매핑
     * business 테이블 컬럼/DTO 필드를 안전하게 변환
     */
    mapToFrontStores(apiStores, userLoc) {
      if (!Array.isArray(apiStores)) return []
      const hasUser = !!(userLoc?.latitude && userLoc?.longitude)

      return apiStores
        .filter((b) => b && (b.latitude ?? b.lat) != null && (b.longitude ?? b.lng) != null)
        .map((b) => {
          // 백엔드 필드 대응 (DTO 이름에 맞춰 안전 처리)
          const id = b.businessId ?? b.id ?? b.business_id
          const name = b.businessName ?? b.name ?? b.business_name ?? '매장'
          const address = b.address ?? ''
          const lat = Number(b.latitude ?? b.lat)
          const lng = Number(b.longitude ?? b.lng)
          const category = b.businessCategory ?? b.business_category ?? '매장'
          // type(맵 아이콘/필터용) 대략 맵핑
          const type = this.mapCategoryToType(b.businessType ?? b.business_type, category, name)
          const distance =
            typeof b.distance === 'number'
              ? b.distance
              : hasUser
                ? Math.round(this.haversineMeters(userLoc.latitude, userLoc.longitude, lat, lng))
                : 0
          const walkTime =
            typeof b.walkTime === 'number'
              ? b.walkTime
              : hasUser
                ? Math.max(1, Math.round(distance / 67))
                : 0

          return {
            id: String(id),
            name,
            type, // 'cafe' | 'restaurant' | 'retail' | 'store'
            category, // 화면 표시용
            lat,
            lng,
            distance,
            walkTime,
            rating: 0, // DB에 없으므로 기본값
            reviewCount: 0, // DB에 없으므로 기본값
            hasDiscount: false, // 쿠폰 시스템 붙을 때 교체
            images: [defaultStoreImg],
            tags: [],
            phone: b.phoneNumber ?? '',
            address,
            openHours: b.businessHours ?? '',
          }
        })
    },

    /**
     * 카테고리/업종명을 프론트 type으로 구분
     */
    mapCategoryToType(businessType, businessCategory, name) {
      const t = `${businessType || ''} ${businessCategory || ''} ${name || ''}`.toLowerCase()

      if (
        t.includes('카페') ||
        t.includes('cafe') ||
        t.includes('디저트') ||
        t.includes('베이커리')
      ) {
        return 'cafe'
      }
      if (
        t.includes('음식') ||
        t.includes('레스토랑') ||
        t.includes('한식') ||
        t.includes('양식') ||
        t.includes('치킨') ||
        t.includes('피자') ||
        t.includes('국수') ||
        t.includes('food') ||
        t.includes('restaurant')
      ) {
        return 'restaurant'
      }
      if (
        t.includes('마트') ||
        t.includes('편의점') ||
        t.includes('서점') ||
        t.includes('정육') ||
        t.includes('리테일') ||
        t.includes('소매') ||
        t.includes('retail') ||
        t.includes('store')
      ) {
        return 'retail'
      }
      return 'store'
    },

    /**
     * Haversine 거리(m) 계산
     */
    haversineMeters(lat1, lon1, lat2, lon2) {
      const R = 6371000 // meters
      const toRad = (d) => (d * Math.PI) / 180
      const dLat = toRad(lat2 - lat1)
      const dLon = toRad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },

    // -----------------------
    // (개발용) 더미 데이터
    // -----------------------
    generateMockStores(centerLat, centerLng, radius) {
      const mockStores = [
        {
          id: '1',
          name: '스타벅스 강남점',
          type: 'cafe',
          category: '카페',
          lat: centerLat + 0.001,
          lng: centerLng + 0.001,
          distance: 150,
          walkTime: 2,
          rating: 4.5,
          reviewCount: 128,
          hasDiscount: true,
          images: ['/images/stores/starbucks.jpg'],
          tags: ['신규', '맞춤'],
          phone: '02-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          openHours: '07:00-22:00',
        },
        {
          id: '2',
          name: '맥도날드 역삼점',
          type: 'restaurant',
          category: '패스트푸드',
          lat: centerLat - 0.002,
          lng: centerLng + 0.003,
          distance: 280,
          walkTime: 4,
          rating: 4.2,
          reviewCount: 89,
          hasDiscount: false,
          images: ['/images/stores/mcdonalds.jpg'],
          tags: ['실시간'],
          phone: '02-2345-6789',
          address: '서울시 강남구 역삼동 456',
          openHours: '24시간',
        },
        {
          id: '3',
          name: '투썸플레이스 강남센터점',
          type: 'cafe',
          category: '카페',
          lat: centerLat + 0.003,
          lng: centerLng - 0.001,
          distance: 320,
          walkTime: 5,
          rating: 4.3,
          reviewCount: 156,
          hasDiscount: true,
          discount: '케이크 세트 15% 할인',
          images: ['/images/stores/twosome.jpg'],
          tags: ['맞춤'],
          phone: '02-3456-7890',
          address: '서울시 강남구 강남대로 789',
          openHours: '08:00-23:00',
        },
        {
          id: '4',
          name: '올리브영 강남점',
          type: 'retail',
          category: '화장품',
          lat: centerLat - 0.001,
          lng: centerLng - 0.002,
          distance: 200,
          walkTime: 3,
          rating: 4.4,
          reviewCount: 234,
          hasDiscount: true,
          discount: '전 상품 10% 할인',
          images: ['/images/stores/oliveyoung.jpg'],
          tags: ['신규', '실시간'],
          phone: '02-4567-8901',
          address: '서울시 강남구 선릉로 321',
          openHours: '10:00-22:00',
        },
        {
          id: '5',
          name: '교촌치킨 역삼점',
          type: 'restaurant',
          category: '치킨',
          lat: centerLat + 0.002,
          lng: centerLng + 0.002,
          distance: 350,
          walkTime: 5,
          rating: 4.1,
          reviewCount: 67,
          hasDiscount: false,
          images: ['/images/stores/kyochon.jpg'],
          tags: ['실시간'],
          phone: '02-5678-9012',
          address: '서울시 강남구 테헤란로 654',
          openHours: '16:00-02:00',
        },
        {
          id: '6',
          name: '파리바게뜨 강남점',
          type: 'cafe',
          category: '베이커리',
          lat: centerLat - 0.003,
          lng: centerLng + 0.001,
          distance: 420,
          walkTime: 6,
          rating: 4.0,
          reviewCount: 98,
          hasDiscount: true,
          images: ['/images/stores/paris.jpg'],
          tags: ['맞춤'],
          phone: '02-6789-0123',
          address: '서울시 강남구 강남대로 147',
          openHours: '06:30-23:00',
        },
        {
          id: '7',
          name: '롯데리아 강남역점',
          type: 'restaurant',
          category: '패스트푸드',
          lat: centerLat + 0.001,
          lng: centerLng - 0.003,
          distance: 310,
          walkTime: 4,
          rating: 3.9,
          reviewCount: 156,
          hasDiscount: false,
          images: ['/images/stores/lotteria.jpg'],
          tags: ['실시간'],
          phone: '02-7890-1234',
          address: '서울시 강남구 강남대로 258',
          openHours: '07:00-24:00',
        },
        {
          id: '8',
          name: 'GS25 역삼점',
          type: 'retail',
          category: '편의점',
          lat: centerLat - 0.0005,
          lng: centerLng + 0.0015,
          distance: 120,
          walkTime: 2,
          rating: 4.2,
          reviewCount: 45,
          hasDiscount: true,
          images: ['/images/stores/gs25.jpg'],
          tags: ['신규'],
          phone: '02-8901-2345',
          address: '서울시 강남구 역삼로 369',
          openHours: '24시간',
        },
      ]

      return mockStores.filter((store) => store.distance <= radius)
    },

    // -----------------------
    // 기존 보조 기능들
    // -----------------------

    // (구) POST 기반 호출이 필요하면 사용
    async fetchStoresFromAPI(latitude, longitude, radius) {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`/api/stores/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius,
          filters: this.filters,
        }),
      })

      if (!response.ok) {
        throw new Error('매장 데이터를 불러올 수 없습니다')
      }
      return await response.json()
    },

    setSearchQuery(query) {
      this.searchQuery = query
      this.applyFilters()
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.applyFilters()
    },

    applyFilters() {
      let filtered = [...this.stores]

      // 검색어
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(
          (store) =>
            store.name.toLowerCase().includes(query) ||
            store.category?.toLowerCase().includes(query) ||
            store.address?.toLowerCase().includes(query),
        )
      }

      // 타입
      if (this.filters.type !== 'all') {
        filtered = filtered.filter((store) => store.type === this.filters.type)
      }

      // 할인
      if (this.filters.hasDiscount) {
        filtered = filtered.filter((store) => store.hasDiscount)
      }

      // 거리
      if (this.filters.distance != null) {
        filtered = filtered.filter(
          (store) => typeof store.distance === 'number' && store.distance <= this.filters.distance,
        )
      }
      // 정렬
      filtered.sort((a, b) => a.distance - b.distance)

      this.filteredStores = filtered
    },

    async fetchStoreDetail(storeId) {
      this.isLoading = true
      this.error = null
      try {
        const existingStore = this.stores.find((s) => s.id === storeId)
        if (existingStore) return existingStore

        // 필요 시 백엔드 호출로 대체
        // const response = await fetch(`/api/stores/${storeId}`, { headers: { Authorization: `Bearer ${token}` } })
        // return await response.json()

        return this.stores.find((s) => s.id === storeId) || null
      } catch (error) {
        this.error = error.message
        console.error('매장 상세 정보 로드 실패:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    async getCoupon(storeId) {
      try {
        const store = this.stores.find((s) => s.id === storeId)
        if (store) {
          return {
            success: true,
            message: `${store.name}의 쿠폰을 받았습니다!`,
            coupon: {
              id: Date.now(),
              storeId,
              storeName: store.name,
              discount: store.discount,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          }
        }
        throw new Error('매장을 찾을 수 없습니다')
      } catch (error) {
        console.error('쿠폰 받기 실패:', error)
        throw error
      }
    },

    toggleFavorite(storeId) {
      const store = this.stores.find((s) => s.id === storeId)
      if (store) {
        store.isFavorite = !store.isFavorite
        this.applyFilters()
      }
    },

    async addReview(storeId, review) {
      try {
        const store = this.stores.find((s) => s.id === storeId)
        if (store) {
          const total = (store.rating || 0) * (store.reviewCount || 0) + review.rating
          store.reviewCount = (store.reviewCount || 0) + 1
          store.rating = Math.round((total / store.reviewCount) * 10) / 10
          return { success: true, message: '리뷰가 등록되었습니다' }
        }
        throw new Error('매장을 찾을 수 없습니다')
      } catch (error) {
        console.error('리뷰 등록 실패:', error)
        throw error
      }
    },

    resetFilters() {
      this.filters = { type: 'all', hasDiscount: false, distance: 5000 }
      this.searchQuery = ''
      this.applyFilters()
    },

    clearStores() {
      this.stores = []
      this.filteredStores = []
      this.error = null
    },

    clearError() {
      this.error = null
    },
  },
})
