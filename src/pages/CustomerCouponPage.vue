<template>
  <div class="coupon-page">
    <!-- 상단바 -->
    <CustomerTopBar />

    <!-- 탭 리스트 -->
    <div class="container-fluid px-5 py-3">
      <div class="coupon-page__tab-container">
        <button
          class="coupon-page__tab-button"
          :class="{ 'coupon-page__tab-button--active': activeTab === 'available' }"
          @click="updateTab('available')"
          type="button"
        >
          발급 가능한 쿠폰
        </button>
        <button
          class="coupon-page__tab-button"
          :class="{ 'coupon-page__tab-button--active': activeTab === 'received' }"
          @click="updateTab('received')"
          type="button"
        >
          받은 쿠폰
        </button>
      </div>
    </div>

    <!-- 안내 메시지 박스 -->
    <div v-if="activeTab === 'available'" class="container-fluid px-4 pb-3">
      <div class="coupon-page__info-box">
        <p class="coupon-page__info-text mb-0">결제한 내역에 따라 쿠폰이 발행됩니다.</p>
        <p class="coupon-page__info-text mb-0">
          제휴 가게 중에서 한 개의 쿠폰만 발급 및 사용이 가능합니다.
        </p>
      </div>
    </div>

    <!-- 쿠폰 목록 -->
    <div class="coupon-page__coupon-list">
      <div class="container-fluid px-4 py-3" :class="{ 'py-0': activeTab === 'received' }">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩 중...</span>
          </div>
          <p class="mt-2">쿠폰을 불러오는 중...</p>
        </div>

        <div v-else-if="activeTab === 'available'">
          <!-- 매장별 쿠폰 섹션 -->
          <div v-for="business in businessCoupons" :key="business.businessId" class="mb-4">
            <h4 class="coupon-page__section-title fw-bold mb-3">{{ business.businessName }}</h4>
            <div v-if="business.coupons.length === 0" class="text-muted text-center py-3">
              <small>이 매장의 제휴 파트너에서 사용 가능한 쿠폰이 없습니다.</small>
            </div>
            <CustomerCouponCard
              v-for="coupon in business.coupons"
              :key="coupon.templateId"
              :coupon="coupon"
              @claim="handleClaimCoupon"
              @download="handleDownload"
            />
          </div>
          
          <!-- 데이터가 없는 경우 -->
          <div v-if="businessCoupons.length === 0" class="text-center py-5">
            <p class="text-muted">사용 가능한 쿠폰이 없습니다.</p>
          </div>
        </div>

        <div v-else>
          <!-- 검색바 -->
          <div class="coupon-page__search-container px-1 mb-3">
            <div class="coupon-page__search-box">
              <i class="material-symbols-outlined coupon-page__search-icon">search</i>
              <input
                type="text"
                placeholder="쿠폰 검색"
                class="coupon-page__search-input"
                v-model="searchQuery"
              />
            </div>
          </div>

          <!-- 받은 쿠폰 목록 -->
          <div class="coupon-page__received-coupons">
            <CustomerReceivedCouponCard
              v-for="coupon in filteredReceivedCoupons"
              :key="coupon.id"
              :coupon="coupon"
              @click="handleReceivedCouponClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 바 -->
    <CustomerBottomNavigation />

    <!-- 쿠폰 발급 모달 -->
    <CustomerCouponModal
      :is-visible="showModal"
      :coupon="selectedCoupon"
      @close="closeModal"
      @download="handleDownload"
    />

    <!-- 받은 쿠폰 상세 모달 -->
    <CustomerReceivedCouponDetailModal
      :is-visible="showReceivedCouponModal"
      :coupon="selectedReceivedCoupon"
      @close="closeReceivedCouponModal"
      @showQR="handleShowQR"
      @useCoupon="handleUseCoupon"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import CustomerCouponCard from '@/components/CustomerCouponCard.vue'
import CustomerReceivedCouponCard from '@/components/CustomerReceivedCouponCard.vue'
import CustomerCouponModal from '@/components/CustomerCouponModal.vue'
import CustomerReceivedCouponDetailModal from '@/components/CustomerReceivedCouponDetailModal.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue'
import {
  getAvailableCoupons,
  getReceivedCoupons,
  claimCoupon,
  useCoupon,
} from '@/api/customer-coupon.js'
import togethershopLogo from '@/assets/images/togethershop_logo.png'

export default {
  name: 'CouponPage',
  components: {
    CustomerTopBar,
    CustomerCouponCard,
    CustomerReceivedCouponCard,
    CustomerCouponModal,
    CustomerReceivedCouponDetailModal,
    CustomerBottomNavigation,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activeTab = ref('available')
    const loading = ref(false)
    const searchQuery = ref('')
    const showModal = ref(false)
    const selectedCoupon = ref(null)
    const showReceivedCouponModal = ref(false)
    const selectedReceivedCoupon = ref(null)

    const availableCoupons = ref([])
    const businessCoupons = ref([])

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    }

    const receivedCoupons = ref([])

    // API에서 데이터 로드
    const loadCoupons = async () => {
      loading.value = true
      try {
        // 토큰 확인
        const token = localStorage.getItem('access_token')
        const userType = localStorage.getItem('user_type')
        console.log('현재 토큰 상태:', { token: !!token, userType })
        
        if (!token) {
          console.warn('토큰이 없습니다. 로그인이 필요합니다.')
          // API 실패 시 예시 데이터 사용 (개발용)
          console.log('토큰 없음으로 인해 예시 데이터 사용')
          return
        }
        
        // 고객이 아닌 경우 경고
        if (userType !== 'customer') {
          console.warn(`현재 사용자 타입이 '${userType}'입니다. 고객으로 로그인해야 합니다.`)
          // API 실패 시 예시 데이터 사용 (개발용)
          console.log('잘못된 사용자 타입으로 인해 예시 데이터 사용')
          return
        }

        // 실제 API 호출
        const availableData = await getAvailableCoupons()
        const receivedData = await getReceivedCoupons()

        // API 응답 데이터로 업데이트
        console.log('availableData:', availableData)
        if (availableData && Array.isArray(availableData) && availableData.length > 0) {
          // BusinessWithPartnersCouponsDTO 구조에 맞게 데이터 처리
          const businessWithPartnersCoupons = availableData
          
          // 매장별로 쿠폰을 그룹화
          businessCoupons.value = businessWithPartnersCoupons.map(businessWithPartners => {
            const business = businessWithPartners.business
            const partnersCoupons = businessWithPartners.couponsByPartners || []
            
            // 모든 파트너의 쿠폰들을 하나의 배열로 합치기
            const allCoupons = []
            partnersCoupons.forEach(partnerCoupons => {
              const partnerBusiness = partnerCoupons.partnerBusiness
              const coupons = partnerCoupons.coupons || []
              
              // CouponTemplateDTO를 CustomerCouponCard에 맞는 형태로 변환
              const transformedCoupons = coupons.map(coupon => ({
                id: coupon.templateId,
                templateId: coupon.templateId,
                storeName: coupon.businessName || partnerBusiness.businessName,
                category: coupon.businessCategory || partnerBusiness.businessCategory,
                // title: `${coupon.discountValue}% 할인쿠폰`, orginal
                title: `${coupon.description} 쿠폰`, //이게 출력되는곳 여기를 수정해야함
                expiryDate: formatDate(coupon.endDate),
                remainingCount: coupon.currentQuantity,
                isClaimed: false,
                businessId: coupon.businessId,
                partnerBusinessId: coupon.partnerBusinessId,
                description: coupon.description,
                termsAndConditions: coupon.termsAndConditions,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                discountValue: coupon.discountValue,
                maxUsePerCustomer: coupon.maxUsePerCustomer,
                isActive: coupon.isActive,
                acceptedByRequester: coupon.acceptedByRequester,
                acceptedByRecipient: coupon.acceptedByRecipient,
                roomId: coupon.roomId,
                createdAt: coupon.createdAt
              }))
              
              allCoupons.push(...transformedCoupons)
            })
            
            return {
              businessId: business.businessId,
              businessName: business.businessName,
              businessCategory: business.businessCategory,
              phoneNumber: business.phoneNumber,
              address: business.address,
              coupons: allCoupons
            }
          })
          
          // 기존 availableCoupons는 호환성을 위해 유지 (모든 쿠폰을 평면화)
          const allFlattenedCoupons = []
          businessWithPartnersCoupons.forEach(businessWithPartners => {
            const partnersCoupons = businessWithPartners.couponsByPartners || []
            partnersCoupons.forEach(partnerCoupons => {
              const partnerBusiness = partnerCoupons.partnerBusiness
              const coupons = partnerCoupons.coupons || []
              
              coupons.forEach(coupon => {
                allFlattenedCoupons.push({
                  id: coupon.templateId,
                  templateId: coupon.templateId,
                  storeName: coupon.businessName || partnerBusiness.businessName,
                  category: coupon.businessCategory || partnerBusiness.businessCategory,
                  // title: `${coupon.discountValue}% 할인쿠폰`, orginal
                  title: `${coupon.description} 쿠폰`, //이게 출력되는곳 여기를 수정해야함
                  expiryDate: formatDate(coupon.endDate),
                  remainingCount: coupon.currentQuantity,
                  isClaimed: false,
                  businessId: coupon.businessId,
                  partnerBusinessId: coupon.partnerBusinessId,
                  description: coupon.description,
                  termsAndConditions: coupon.termsAndConditions,
                  startDate: coupon.startDate,
                  endDate: coupon.endDate,
                  discountValue: coupon.discountValue,
                  maxUsePerCustomer: coupon.maxUsePerCustomer,
                  isActive: coupon.isActive,
                  acceptedByRequester: coupon.acceptedByRequester,
                  acceptedByRecipient: coupon.acceptedByRecipient,
                  roomId: coupon.roomId,
                  createdAt: coupon.createdAt
                })
              })
            })
          })
          availableCoupons.value = allFlattenedCoupons
        }
        
        // 받은 쿠폰 데이터 처리
        console.log('receivedData:', receivedData)
        if (receivedData && Array.isArray(receivedData) && receivedData.length > 0) {
          // 받은 쿠폰 데이터를 CustomerReceivedCouponCard에 맞는 형태로 변환
          receivedCoupons.value = receivedData.map(coupon => {
            // 만료일까지 남은 일수 계산
            const calculateDaysLeft = (expireDate) => {
              if (!expireDate) return 'D-0'
              const today = new Date()
              const expire = new Date(expireDate)
              const diffTime = expire - today
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              return diffDays > 0 ? `D-${diffDays}` : '만료됨'
            }

            return {
              id: coupon.couponId,
              couponId: coupon.couponId,
              templateId: coupon.templateId,
              couponCode: coupon.couponCode,
              storeName: coupon.businessName,
              category: coupon.businessCategory,
              title: `${coupon.description} 쿠폰`,
              expiryDate: formatDate(coupon.expireDate),
              daysLeft: calculateDaysLeft(coupon.expireDate),
              isClaimed: true,
              status: coupon.status,
              issueDate: coupon.issueDate,
              usedDate: coupon.usedDate,
              pinCode: coupon.pinCode,
              qrCodeData: coupon.qrCodeData
            }
          })
        }

        console.log('쿠폰 데이터 로드 완료')
      } catch (error) {
        console.error('쿠폰 데이터 로드 실패:', error)
        console.error('에러 상세:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
        
        // 403 에러인 경우 특별 처리
        if (error.response?.status === 403) {
          console.error('403 Forbidden: 인증이 거부되었습니다. 다음을 확인해주세요:')
          console.error('1. 고객으로 로그인했는지 확인')
          console.error('2. 토큰이 유효한지 확인')
          console.error('3. 서버에서 해당 API를 허용하는지 확인')
          
          // 토큰 제거 후 로그인 페이지로 리다이렉트 (선택사항)
          // localStorage.removeItem('access_token')
          // localStorage.removeItem('refresh_token')
          // localStorage.removeItem('user_type')
          // router.push('/login')
        }
        
        // API 실패 시 예시 데이터 사용 (개발용)
        console.log('API 실패로 인해 예시 데이터 사용')
      } finally {
        loading.value = false
      }
    }

    // 쿠폰 발급 처리 (모달 열기)
    const handleClaimCoupon = (couponId) => {
      // businessCoupons에서 쿠폰 찾기
      let coupon = null
      for (const business of businessCoupons.value) {
        coupon = business.coupons.find((c) => c.templateId === couponId || c.id === couponId)
        if (coupon) break
      }
      
      // fallback으로 availableCoupons에서도 찾기
      if (!coupon) {
        coupon = availableCoupons.value.find((c) => c.templateId === couponId || c.id === couponId)
      }
      
      if (coupon && coupon.remainingCount > 0) {
        selectedCoupon.value = {
          ...coupon,
          storeAvatar: togethershopLogo, // Togethershop 로고
        }
        console.log('selectedCoupon:', selectedCoupon.value)
        console.log('storeAvatar:', selectedCoupon.value.storeAvatar)
        showModal.value = true
      }
    }

    // 모달 닫기
    const closeModal = () => {
      showModal.value = false
      selectedCoupon.value = null
    }

    // 쿠폰 다운로드 처리
    const handleDownload = async (coupon) => {
      try {
        // 실제 API 호출 (templateId 사용)
        const couponId = coupon.templateId || coupon.id
        await claimCoupon(couponId)

        // 성공 시 로컬 상태 업데이트
        // businessCoupons에서 업데이트
        for (const business of businessCoupons.value) {
          const couponIndex = business.coupons.findIndex((c) => c.templateId === couponId || c.id === couponId)
          if (couponIndex !== -1) {
            // 발급된 쿠폰은 발급 완료 상태로 변경
            business.coupons[couponIndex].remainingCount--
            business.coupons[couponIndex].isClaimed = true
            
            // 같은 매장의 다른 쿠폰들을 비활성화
            business.coupons.forEach((c, index) => {
              if (index !== couponIndex && c.businessId === coupon.businessId) {
                c.isDisabled = true
              }
            })
            break
          }
        }
        
        // availableCoupons에서도 업데이트
        const couponIndex = availableCoupons.value.findIndex((c) => c.templateId === couponId || c.id === couponId)
        if (couponIndex !== -1) {
          availableCoupons.value[couponIndex].remainingCount--
          availableCoupons.value[couponIndex].isClaimed = true
          
          // 같은 매장의 다른 쿠폰들을 비활성화
          availableCoupons.value.forEach((c, index) => {
            if (index !== couponIndex && c.businessId === coupon.businessId) {
              c.isDisabled = true
            }
          })
        }

        console.log('쿠폰 다운로드 성공:', coupon.title)

        // 모달 닫기
        closeModal()

        // 받은 쿠폰 목록 새로고침
        await loadReceivedCoupons()
      } catch (error) {
        console.error('쿠폰 다운로드 실패:', error)
        // 에러 처리 (토스트 메시지 등)
      }
    }

    // 검색 필터링
    const filteredReceivedCoupons = computed(() => {
      if (!searchQuery.value) {
        return receivedCoupons.value
      }
      return receivedCoupons.value.filter(
        (coupon) =>
          coupon.storeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          coupon.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    })

    // 받은 쿠폰 목록 로드
    const loadReceivedCoupons = async () => {
      try {
        const params = {
          search: searchQuery.value,
          page: 1,
          limit: 50,
        }
        const receivedData = await getReceivedCoupons(params)

        console.log('loadReceivedCoupons receivedData:', receivedData)
        if (receivedData && Array.isArray(receivedData) && receivedData.length > 0) {
          // 받은 쿠폰 데이터를 CustomerReceivedCouponCard에 맞는 형태로 변환
          receivedCoupons.value = receivedData.map(coupon => {
            // 만료일까지 남은 일수 계산
            const calculateDaysLeft = (expireDate) => {
              if (!expireDate) return 'D-0'
              const today = new Date()
              const expire = new Date(expireDate)
              const diffTime = expire - today
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              return diffDays > 0 ? `D-${diffDays}` : '만료됨'
            }

            return {
              id: coupon.couponId,
              couponId: coupon.couponId,
              templateId: coupon.templateId,
              couponCode: coupon.couponCode,
              storeName: coupon.businessName,
              category: coupon.businessCategory,
              title: `${coupon.description} 쿠폰`,
              expiryDate: formatDate(coupon.expireDate),
              daysLeft: calculateDaysLeft(coupon.expireDate),
              isClaimed: true,
              status: coupon.status,
              issueDate: coupon.issueDate,
              usedDate: coupon.usedDate,
              pinCode: coupon.pinCode,
              qrCodeData: coupon.qrCodeData
            }
          })
        }
      } catch (error) {
        console.error('받은 쿠폰 목록 로드 실패:', error)
      }
    }

    // 받은 쿠폰 카드 클릭 핸들러
    const handleReceivedCouponClick = (couponId) => {
      // 로컬 데이터로만 모달 열기
      const coupon = receivedCoupons.value.find((c) => c.id === couponId)
      if (coupon) {
        selectedReceivedCoupon.value = {
          ...coupon,
          storeAvatar: togethershopLogo, // Togethershop 로고
        }
        showReceivedCouponModal.value = true
      }
    }

    // 받은 쿠폰 모달 닫기
    const closeReceivedCouponModal = () => {
      showReceivedCouponModal.value = false
      selectedReceivedCoupon.value = null
    }

    // QR 코드 표시
    const handleShowQR = (coupon) => {
      console.log('QR 코드 표시:', coupon)
      // 추후 QR 코드 모달이나 페이지로 이동
    }

    // 쿠폰 사용 처리
    const handleUseCoupon = async (coupon) => {
      try {
        // 실제 API 호출
        await useCoupon(coupon.id)

        // 성공 시 로컬 상태 업데이트
        const couponIndex = receivedCoupons.value.findIndex((c) => c.id === coupon.id)
        if (couponIndex !== -1) {
          // 쿠폰을 사용된 상태로 변경하거나 목록에서 제거
          receivedCoupons.value.splice(couponIndex, 1)
        }

        console.log('쿠폰 사용 완료:', coupon.title)

        // 모달 닫기
        closeReceivedCouponModal()

        // 받은 쿠폰 목록 새로고침
        await loadReceivedCoupons()
      } catch (error) {
        console.error('쿠폰 사용 실패:', error)
        // 에러 처리 (토스트 메시지 등)
      }
    }

    // 검색어 변경 시 받은 쿠폰 목록 새로고침
    watch(searchQuery, () => {
      if (activeTab.value === 'received') {
        loadReceivedCoupons()
      }
    })

    // 라우트 변경 감지
    watch(() => route.query.tab, (newTab) => {
      if (newTab === 'received') {
        activeTab.value = 'received'
      } else {
        activeTab.value = 'available'
      }
    })

    // URL 쿼리 파라미터 처리
    const initializeActiveTab = () => {
      const tabParam = route.query.tab
      if (tabParam === 'received') {
        activeTab.value = 'received'
      } else {
        activeTab.value = 'available'
      }
    }

    // 탭 변경 시 URL 업데이트
    const updateTab = (tab) => {
      activeTab.value = tab
      router.push({
        path: '/customer/coupon',
        query: { tab: tab }
      })
    }

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      initializeActiveTab()
      loadCoupons()
    })

    return {
      activeTab,
      loading,
      searchQuery,
      showModal,
      selectedCoupon,
      showReceivedCouponModal,
      selectedReceivedCoupon,
      availableCoupons,
      businessCoupons,
      receivedCoupons,
      filteredReceivedCoupons,
      handleClaimCoupon,
      handleReceivedCouponClick,
      closeModal,
      handleDownload,
      closeReceivedCouponModal,
      handleShowQR,
      handleUseCoupon,
      loadReceivedCoupons,
      loadCoupons,
      formatDate,
      updateTab,
    }
  },
}
</script>

<style>
@import '../styles/customer-coupon.css';
</style>
