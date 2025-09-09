<template>
  <div class="screen">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="arrow-back-ios" @click="$router.back()">←</div>
        <div class="title">제휴 채팅</div>
      </div>

      <!-- Search Box -->
      <div class="search-container">
        <div class="search-box">
          <div class="search-icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <input
            v-model="query"
            placeholder="매장명 검색"
            style="border: none; outline: none; flex: 1"
          />
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="filter-buttons">
        <div
          v-for="filter in ['전체', '대기', '협의중', '협의완료', '거절']"
          :key="filter"
          class="filter-button"
          :class="{ active: selectedFilter === filter }"
          @click="selectFilter(filter)"
        >
          <div class="filter-text">{{ filter }}</div>
        </div>
      </div>

      <!-- Chat List -->
      <div class="chat-list">
        <div
          v-for="room in filteredRooms"
          :key="room.roomId"
          class="chat-item"
          @click="openRoom(room)"
        >
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">{{ room.otherShop }}</div>
              <div class="store-info">
                <div class="online-status">{{ room.otherUserCategory || '오프라인' }}</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">0</div>
                </div>
              </div>
            </div>

            <div class="status-badge" :class="statusClass(room.status)">
              <div class="status-text">{{ statusText(room.status) }}</div>
            </div>
          </div>

          <div class="store-category">{{ room.otherUserCategory }}</div>

          <div class="message-container">
            <div class="message">
              <div class="message-text">{{ room.createdAt | formatTime }}</div>
            </div>
            <div class="time-badge">
              <div class="time-text">{{ room.createdAt | timeAgo }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/api'

// 상태 매핑
const statusMap = {
  WAITING: '대기',
  NEGOTIATING: '협의중',
  COMPLETED: '협의완료',
  REJECTED: '거절',
}
const statusClassMap = {
  WAITING: 'waiting',
  NEGOTIATING: 'negotiating',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
}

const router = useRouter()
const query = ref('')
const rooms = ref([])
const loading = ref(false)
const errorMessage = ref('')
const selectedFilter = ref('전체')
let searchTimer = null

const fetchRooms = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.get('/api/partnership/rooms')
    rooms.value = data
  } catch (e) {
    console.error(e)
    errorMessage.value = '채팅방 불러오기 오류'
  } finally {
    loading.value = false
  }
}

onMounted(fetchRooms)

// 필터 & 검색 적용
const filteredRooms = computed(() => {
  return rooms.value.filter((room) => {
    const matchesQuery = room.otherShop.toLowerCase().includes(query.value.trim().toLowerCase())
    const matchesFilter =
      selectedFilter.value === '전체' || statusMap[room.status] === selectedFilter.value
    return matchesQuery && matchesFilter
  })
})

watch(query, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchRooms, 300)
})

const openRoom = (room) => {
  if (room.roomId) router.push(`/business/chats/${room.roomId}`)
}

const selectFilter = (filter) => {
  selectedFilter.value = filter
}

const statusClass = (status) => statusClassMap[status] || ''
const statusText = (status) => statusMap[status] || status

// 시간 포맷 필터
const formatTime = (dateStr) => new Date(dateStr).toLocaleString()
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return `${Math.floor(diff)}초 전`
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
</script>

<script>
export default {
  filters: {
    formatTime: (val) => (val ? new Date(val).toLocaleString() : ''),
    timeAgo: (val) => {
      if (!val) return ''
      const diff = (Date.now() - new Date(val)) / 1000
      if (diff < 60) return `${Math.floor(diff)}초 전`
      if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
      if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
      return `${Math.floor(diff / 86400)}일 전`
    },
  },
}
</script>

<style scoped>
/* 기존 스타일 그대로 사용 */
.screen {
  align-items: start;
  background-color: #fff;
  display: flex;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
}
.container {
  background-color: #fff;
  width: 390px;
  min-height: 1082px;
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  padding: 22px 20px;
  gap: 12px;
}
.arrow-back-ios {
  width: 20px;
  height: 20px;
  font-size: 16px;
  color: #000;
  cursor: pointer;
}
.title {
  color: #000;
  font-family: 'Pretendard-Medium';
  font-size: 20px;
  font-weight: 500;
  line-height: 27px;
  text-align: center;
}
.search-container {
  padding: 0 20px;
  margin-bottom: 16px;
}
.search-box {
  width: 100%;
  background-color: #fff;
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 41px;
  display: flex;
  align-items: center;
  padding: 0 17px;
  gap: 10px;
}
.search-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.filter-buttons {
  display: flex;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 30px;
}

.filter-button.active .filter-text {
  background-color: var(--);
  border-color: #f0fdf4;
  color: #ffffff;
}
.filter-button .filter-text {
  background-color: #ffffff; /* 기본 흰색 */
  border: 1px solid #f8f8f8;
  border-radius: 5px;
  box-shadow: 0px 1px 2px #0000001a;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  color: #000;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
}

/* 선택된 버튼 */
.filter-button.active .filter-text {
  background-color: #017f58;
  color: #ffffff;
  border: 1px solid #017f58;
}

.chat-list {
  flex: 1;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.08);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.store-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
.store-name {
  font-family: 'Pretendard-Medium';
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
.status-badge {
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.waiting {
  background-color: #f1f3f5;
  color: #495057;
}
.status-badge.negotiating {
  background-color: #e6f0ff;
  color: #1e64ff;
}
.status-badge.completed {
  background-color: #e9f7ef;
  color: #28a745;
}
.status-badge.rejected {
  background-color: #fdecea;
  color: #dc3545;
}
.store-category {
  font-size: 13px;
  color: #777;
}
.message-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.message {
  flex: 1;
  border-radius: 8px;
  margin-right: 10px;
  min-width: 0px;
}
.message-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.time-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}
.time-text {
  font-family: 'Pretendard-Regular';
  font-size: 12px;
  font-weight: 400;
  color: #666;
  white-space: nowrap;
}
.store-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
}
.rating-score {
  font-family: 'Pretendard-Regular';
  font-size: 12px;
  color: #666;
}
.star {
  color: #ffd700;
  font-size: 14px;
}
.online-status {
  font-family: 'Pretendard-Regular';
  font-size: 12px;
  font-weight: 400;
  color: #666;
}
.error-message {
  text-align: center;
  margin: 12px 0;
  font-size: 14px;
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
}
</style>
