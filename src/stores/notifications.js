import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCustomerNotifications } from '@/api/customer-notification'
import { getBusinessNotifications } from '@/api/business-notification'

export const useNotificationStore = defineStore('notifications', () => {
  const hasUnreadNotifications = ref(false)
  const unreadCount = ref(0)
  const userType = ref(null)

  // 읽지 않은 알림이 있는지 확인하는 computed
  const hasUnread = computed(() => hasUnreadNotifications.value)
  const count = computed(() => unreadCount.value)

  // 알림 상태 확인 함수
  const checkNotificationStatus = async (type) => {
    try {
      userType.value = type
      let notifications = []

      if (type === 'customer') {
        notifications = await getCustomerNotifications()
      } else if (type === 'business') {
        notifications = await getBusinessNotifications()
      }

      if (Array.isArray(notifications)) {
        // READ나 CLICKED가 아닌 알림들을 카운트
        const unreadNotifications = notifications.filter(notification => 
          notification.status !== 'READ' && notification.status !== 'CLICKED'
        )
        
        unreadCount.value = unreadNotifications.length
        hasUnreadNotifications.value = unreadCount.value > 0
        
        console.log('알림 상태 확인:', {
          total: notifications.length,
          unread: unreadCount.value,
          hasUnread: hasUnreadNotifications.value
        })
      } else {
        unreadCount.value = 0
        hasUnreadNotifications.value = false
      }
    } catch (error) {
      console.error('알림 상태 확인 실패:', error)
      // 에러 시에도 배지는 표시하지 않음
      unreadCount.value = 0
      hasUnreadNotifications.value = false
    }
  }

  // 알림을 읽음 처리했을 때 호출
  const markAsRead = () => {
    if (unreadCount.value > 0) {
      unreadCount.value -= 1
      hasUnreadNotifications.value = unreadCount.value > 0
    }
  }

  // 모든 알림을 읽음 처리했을 때 호출
  const markAllAsRead = () => {
    unreadCount.value = 0
    hasUnreadNotifications.value = false
  }

  // 로그아웃 시 상태 초기화
  const clearNotifications = () => {
    hasUnreadNotifications.value = false
    unreadCount.value = 0
    userType.value = null
  }

  return {
    hasUnreadNotifications,
    unreadCount,
    userType,
    hasUnread,
    count,
    checkNotificationStatus,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }
})
