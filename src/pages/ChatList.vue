<template>
  <div class="screen">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="arrow-back-ios" @click="$router.back()">←</div>
        <div class="title">회원 검색</div>
      </div>

      <!-- Search Box -->
      <div class="search-container">
        <div class="search-box">
          <div class="search-icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <input
            v-model="query"
            @input="search"
            placeholder="회원 이름 검색..."
            style="border: none; outline: none; flex: 1"
          />
        </div>
      </div>
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
      <!-- 로딩 / 결과 없음 표시 -->
      <div v-if="loading" class="loading-text">로딩 중...</div>
      <div v-else-if="query && users.length === 0" class="no-result">검색 결과가 없습니다.</div>

      <!-- 검색 결과 리스트 -->
      <div class="chat-list" v-else>
        <div
          class="chat-item"
          v-for="user in users"
          :key="user.id"
          @click="startChat(user.id)"
          :disabled="loading"
        >
          <div class="chat-header">
            <div class="store-name-container">
              <div class="store-name">{{ user.businessName }}</div>
              <div class="store-info">
                <div class="online-status">{{ user.businessType }}</div>
                <div class="rating">
                  <div class="star">★</div>
                  <div class="rating-score">{{ user.togetherIndex || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="status-badge rejected">
              <div class="status-text">{{ user.status }}</div>
            </div>
          </div>
          <div class="store-category" v-if="user.businessCategory">{{ user.businessCategory }}</div>
          <div class="message-container">
            <div class="message-text">{{ user.lastMessage }}안녕하세요</div>
            <div class="time-badge">
              <div class="time-text">{{ user.lastMessageTime }}3시간 전</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 오류 메시지 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api/api'
import { useRouter } from 'vue-router'

const query = ref('')
const users = ref([])
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const hasToken = computed(() => !!localStorage.getItem('access_token'))
const currentUser = computed(() => localStorage.getItem('username') || '')
const selectedFilter = ref('전체')

let searchTimer = null

const search = async () => {
  if (!query.value.trim()) {
    users.value = []
    return
  }

  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const { data } = await api.get('/api/users', { params: { q: query.value.trim() } })
      // 예: lastMessage, lastMessageTime, rating 같은 추가 필드 매핑
      users.value = data.map((user) => ({
        ...user,
        lastMessage: user.lastMessage || '',
        lastMessageTime: user.lastMessageTime || '',
        rating: user.rating || 0,
      }))
    } catch (e) {
      console.error(e)
      users.value = []
      errorMessage.value = `검색 오류: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`
    } finally {
      loading.value = false
    }
  }, 300)
}

const startChat = async (userId) => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.post(`/api/partnership/request/${userId}`)
    router.push(`/business/chats/${data.roomId}`)
  } catch (e) {
    console.error(e)
    if (e.response?.status === 403) {
      errorMessage.value = '권한이 없습니다. 로그인을 확인해주세요.'
    } else if (e.response?.status === 401) {
      errorMessage.value = '인증이 필요합니다. 다시 로그인해주세요.'
    } else if (e.response?.status === 404) {
      errorMessage.value = 'API를 찾을 수 없습니다.'
    } else {
      errorMessage.value = `오류: ${e.response?.status || ''} ${e.response?.data?.message || e.message}`
    }
  } finally {
    loading.value = false
  }
}
const selectFilter = (filter) => {
  selectedFilter.value = filter
}
</script>

<style scoped>
.screen {
  align-items: start;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
}

.container {
  background-color: #ffffff;
  width: 390px;
  min-height: 1082px;
  display: flex;
  flex-direction: column;
}

/* Header */
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
  color: #000000;
  cursor: pointer;
}

.title {
  color: #000000;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 20px;
  font-weight: 500;
  line-height: 27px;
  text-align: center;
}

/* Search Container */
.search-container {
  padding: 0 20px;
  margin-bottom: 16px;
}

.search-box {
  width: 100%;
  background-color: #ffffff;
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
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border: 1px solid #666;
  border-radius: 50%;
}

.search-handle {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 4px;
  height: 4px;
  background-color: #666;
  transform: rotate(45deg);
}

.search-text {
  color: var(--);
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 15px;
  font-weight: 400;
  line-height: normal;
}

/* Filter Buttons */
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

/* Chat List */
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
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.store-name-container {
  display: flex;
  align-items: center;
  gap: 8px; /* 이름과 평점/오프라인 사이 간격 */
}
.store-name {
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.status-badge {
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
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

.status-badge.waiting {
  background-color: #f1f3f5;
  color: #495057;
}

.status-text {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  color: #000000;
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

.time-badge::before {
  content: '●';
  color: #e63946; /* 빨간 점 */
  font-size: 10px;
}

.time-text {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  color: #666666;
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
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  color: #666666;
}

.star {
  color: #ffd700;
  font-size: 14px;
}

.online-status {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  color: #666666;
}

.loading-text,
.no-result,
.error-message {
  text-align: center;
  margin: 12px 0;
  font-size: 14px;
}
.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 8px;
}
</style>
