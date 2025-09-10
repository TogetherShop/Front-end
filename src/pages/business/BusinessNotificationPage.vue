<template>
  <div class="BusinessNotification">
    <!-- 상단 헤더 -->
    <div class="BusinessNotification__header">
      <button class="BusinessNotification__backButton" @click="goBack">
        <i class="material-symbols-outlined">arrow_back_ios</i>
      </button>
      <h1 class="BusinessNotification__title">알림</h1>
      <button 
        v-if="hasUnreadNotifications" 
        class="BusinessNotification__markAllReadButton" 
        @click="markAllAsRead"
      >
        모두 읽음
      </button>
    </div>
    
    <!-- 메인 콘텐츠 -->
    <main class="BusinessNotification__content">
      <div class="BusinessNotification__container">
        <!-- 로딩 상태 -->
        <div v-if="loading" class="BusinessNotification__loading">
          <div class="BusinessNotification__loadingSpinner">
            <i class="material-symbols-outlined">refresh</i>
          </div>
          <p class="BusinessNotification__loadingText">알림을 불러오는 중...</p>
        </div>
        
        <!-- 에러 상태 -->
        <div v-else-if="error" class="BusinessNotification__error">
          <div class="BusinessNotification__errorIcon">
            <i class="material-symbols-outlined">error_outline</i>
          </div>
          <h3 class="BusinessNotification__errorTitle">오류가 발생했습니다</h3>
          <p class="BusinessNotification__errorMessage">{{ error }}</p>
          <button class="BusinessNotification__retryButton" @click="fetchNotifications">
            다시 시도
          </button>
        </div>
        
        <!-- 알림이 있는 경우 -->
        <div v-else-if="groupedNotifications.length > 0" class="BusinessNotification__list">
          <div 
            v-for="group in groupedNotifications" 
            :key="group.date"
            class="BusinessNotification__dateGroup"
          >
            <!-- 날짜 헤더 -->
            <div class="BusinessNotification__dateHeader">
              {{ formatDate(group.date) }}
            </div>
            
            <!-- 해당 날짜의 알림들 -->
            <div class="BusinessNotification__items">
              <div 
                v-for="notification in group.notifications" 
                :key="notification.notificationId"
                class="BusinessNotification__item"
                :class="{ 
                  'BusinessNotification__item--unread': !notification.isRead,
                  'BusinessNotification__item--read': notification.isRead
                }"
                @click="handleNotificationClick(notification)"
              >
                <div class="BusinessNotification__itemContent">
                  <h3 class="BusinessNotification__itemTitle">{{ notification.title }}</h3>
                  <p class="BusinessNotification__itemMessage">{{ notification.message }}</p>
                </div>
                <div class="BusinessNotification__itemTime">
                  {{ formatTime(notification.sentAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 알림이 없는 경우 -->
        <div v-else class="BusinessNotification__empty">
          <div class="BusinessNotification__emptyIcon">
            <i class="material-symbols-outlined">notifications_none</i>
          </div>
          <h3 class="BusinessNotification__emptyTitle">알림이 없습니다</h3>
          <p class="BusinessNotification__emptyMessage">새로운 알림이 오면 여기에 표시됩니다.</p>
        </div>
      </div>
    </main>
    
    <!-- 하단 네비게이션 -->
    <BusinessBottomNav />
  </div>
</template>

<script>
import BusinessBottomNav from '@/components/BusinessBottomNav.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { 
  getBusinessNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationIcon,
  getNotificationColor,
  getNotificationTitle,
  formatNotificationDate,
  formatNotificationTime
} from '@/api/business-notification'

export default {
  name: 'BusinessNotificationPage',
  components: {
    BusinessBottomNav
  },
  setup() {
    const router = useRouter()
    const notifications = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    const goBack = () => {
      router.go(-1)
    }
    
    // NotificationStatus를 기반으로 읽음 상태 판단
    const isNotificationRead = (status) => {
      // READ 또는 CLICKED 상태면 읽음으로 간주
      return status === 'READ' || status === 'CLICKED'
    }
    
    // 알림 목록 조회
    const fetchNotifications = async () => {
      try {
        loading.value = true
        error.value = null
        const data = await getBusinessNotifications()
        
        // API 응답이 배열인지 확인
        if (Array.isArray(data)) {
          notifications.value = data.map(notification => ({
            ...notification,
            icon: getNotificationIcon(notification.notificationType),
            color: getNotificationColor(notification.notificationType),
            title: getNotificationTitle(notification.notificationType),
            isRead: isNotificationRead(notification.status) // status 필드를 기반으로 읽음 상태 판단
          }))
        } else {
          console.warn('API 응답이 배열이 아닙니다:', data)
          notifications.value = []
        }
      } catch (err) {
        console.error('알림 조회 실패:', err)
        
        // 에러 타입에 따른 메시지 설정
        if (err.response?.status === 401) {
          error.value = '로그인이 필요합니다.'
        } else if (err.response?.status === 403) {
          error.value = '접근 권한이 없습니다.'
        } else if (err.response?.status >= 500) {
          error.value = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          error.value = '네트워크 연결을 확인해주세요.'
        } else {
          error.value = '알림을 불러오는데 실패했습니다.'
        }
      } finally {
        loading.value = false
      }
    }
    
    // 읽지 않은 알림이 있는지 확인
    const hasUnreadNotifications = computed(() => {
      return notifications.value.some(notification => !notification.isRead)
    })
    
    // 날짜별로 그룹화된 알림
    const groupedNotifications = computed(() => {
      const groups = {}
      
      notifications.value.forEach(notification => {
        const date = new Date(notification.sentAt).toISOString().split('T')[0]
        if (!groups[date]) {
          groups[date] = {
            date: date,
            notifications: []
          }
        }
        groups[date].notifications.push(notification)
      })
      
      // 날짜순으로 정렬 (최신 날짜가 먼저)
      return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date))
    })
    
    // 알림 클릭 처리
    const handleNotificationClick = async (notification) => {
      try {
        // 읽지 않은 알림인 경우 서버에 클릭 처리 요청 (CLICKED 상태로 변경)
        if (!notification.isRead) {
          try {
            await markNotificationAsRead(notification.notificationId)
            console.log('알림 클릭 처리 성공:', notification.notificationId)
          } catch (readError) {
            console.error('알림 클릭 처리 실패:', readError)
            // 클릭 처리 실패해도 사용자 경험을 위해 계속 진행
          }
          
          // 로컬 상태도 읽음으로 변경 (CLICKED 상태로 간주)
          notification.isRead = true
          notification.status = 'CLICKED'
        }
        
        // 알림 타입에 따른 상세 처리
        switch (notification.notificationType) {
          case 'COUPON':
            router.push('/business/coupon')
            break
          case 'PARTNERSHIP':
            router.push('/business/partnership')
            break
          case 'GROUP_PURCHASE':
            router.push('/business/group-purchase')
            break
          case 'SYSTEM':
            // 시스템 알림은 특별한 처리가 없으므로 로그만 출력
            console.log('시스템 알림 클릭:', notification)
            break
          default:
            console.log('알 수 없는 알림 타입:', notification.notificationType)
        }
      } catch (err) {
        console.error('알림 처리 실패:', err)
        // 에러가 발생해도 사용자에게는 알리지 않고 로그만 출력
      }
    }
    
    // 날짜 포맷팅
    const formatDate = (dateString) => {
      return formatNotificationDate(dateString)
    }
    
    // 시간 포맷팅
    const formatTime = (date) => {
      return formatNotificationTime(date)
    }
    
    // 모든 알림을 읽음 처리
    const markAllAsRead = async () => {
      try {
        await markAllNotificationsAsRead()
        console.log('모든 알림 읽음 처리 성공')
        
        // 로컬 상태도 모두 읽음으로 변경 (READ 상태로 간주)
        notifications.value.forEach(notification => {
          notification.isRead = true
          notification.status = 'READ'
        })
      } catch (err) {
        console.error('모든 알림 읽음 처리 실패:', err)
        // 에러가 발생해도 사용자에게는 알리지 않고 로그만 출력
      }
    }
    
    // 컴포넌트 마운트 시 알림 목록 조회
    onMounted(() => {
      fetchNotifications()
    })
    
    return {
      goBack,
      notifications,
      loading,
      error,
      hasUnreadNotifications,
      groupedNotifications,
      handleNotificationClick,
      markAllAsRead,
      formatDate,
      formatTime
    }
  }
}
</script>

<style scoped>
@import '../../styles/business-notification.css';
</style>
