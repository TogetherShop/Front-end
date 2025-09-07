<template>
  <div class="card" style="max-width: 600px; margin: 40px auto">
    <div
      class="row"
      style="justify-content: space-between; align-items: center; margin-bottom: 20px"
    >
      <h3 style="margin: 0">회원 검색</h3>
      <button class="btn ghost" @click="$router.push('/chats')">채팅 목록</button>
    </div>

    <!-- 디버깅 정보 -->
    <div
      style="
        background: #f1f5f9;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 12px;
      "
    >
      <div>토큰: {{ hasToken ? '있음' : '없음' }}</div>
      <div>사용자명: {{ currentUser }}</div>
    </div>

    <input
      v-model="query"
      @input="search"
      placeholder="회원 이름 검색..."
      style="margin-bottom: 16px"
    />

    <div v-if="loading">로딩 중...</div>
    <div
      v-else-if="query && users.length === 0"
      style="text-align: center; color: #64748b; padding: 20px"
    >
      검색 결과가 없습니다.
    </div>
    <div v-else style="display: grid; gap: 8px">
      <div
        v-for="user in users"
        :key="user.id"
        class="row"
        style="
          justify-content: space-between;
          align-items: center;
          border: 1px solid #ccc;
          padding: 12px;
          border-radius: 12px;
        "
      >
        <div>
          <div style="font-weight: 600">{{ user.username }}</div>
          <div v-if="user.shopName" style="font-size: 14px; color: #64748b">
            {{ user.shopName }}
          </div>
          <div style="font-size: 12px; color: #94a3b8">ID: {{ user.id }}</div>
        </div>
        <button class="btn" @click="startChat(user.id)" :disabled="loading">채팅 시작</button>
      </div>
    </div>

    <!-- 오류 메시지 표시 -->
    <div
      v-if="errorMessage"
      style="
        background: #fee2e2;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-top: 16px;
      "
    >
      {{ errorMessage }}
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

// 디버깅용 정보
const hasToken = computed(() => !!localStorage.getItem('access_token'))
const currentUser = computed(() => localStorage.getItem('username') || '')

// 디바운스를 위한 타이머
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
      console.log('검색 요청:', `/api/users?q=${query.value.trim()}`)
      const { data } = await api.get('/api/users', {
        params: { q: query.value.trim() },
      })
      console.log('검색 결과:', data)
      users.value = data
    } catch (e) {
      console.error('검색 오류:', e)
      console.error('응답:', e.response)
      users.value = []
      errorMessage.value = `검색 오류: ${e.response?.status} ${
        e.response?.data?.message || e.message
      }`
    } finally {
      loading.value = false
    }
  }, 300)
}

// 채팅방 생성 - 백엔드 API에 맞게 수정
const startChat = async (userId) => {
  loading.value = true
  errorMessage.value = ''

  try {
    console.log('채팅방 생성 시도 - userId:', userId)
    // 백엔드의 실제 API 경로 사용: POST /api/partnership/request/{recipientId}
    const { data } = await api.post(`/api/partnership/request/${userId}`)
    console.log('채팅방 생성 성공:', data)
    router.push(`/chats/${data.roomId}`)
  } catch (e) {
    console.error('채팅방 생성 오류:', e)

    if (e.response?.status === 403) {
      errorMessage.value = '권한이 없습니다. 로그인을 확인해주세요.'
    } else if (e.response?.status === 401) {
      errorMessage.value = '인증이 필요합니다. 다시 로그인해주세요.'
    } else if (e.response?.status === 404) {
      errorMessage.value = 'API를 찾을 수 없습니다. 백엔드를 확인해주세요.'
    } else {
      errorMessage.value = `오류: ${e.response?.status} ${e.response?.data?.message || e.message}`
    }
  } finally {
    loading.value = false
  }
}

// 토큰 재발급 시도
const refreshAuth = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      errorMessage.value = '리프레시 토큰이 없습니다. 다시 로그인해주세요.'
      router.push('/login')
      return
    }

    const { data } = await api.post('/api/auth/refresh', { refreshToken })
    localStorage.setItem('access_token', data.accessToken)
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken)
    }
    errorMessage.value = '토큰이 갱신되었습니다. 다시 시도해주세요.'
  } catch (e) {
    console.error('토큰 갱신 실패:', e)
    errorMessage.value = '토큰 갱신에 실패했습니다. 다시 로그인해주세요.'
    router.push('/login')
  }
}
</script>
