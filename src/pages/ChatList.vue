<template>
  <div class="card">
    <div
      class="row"
      style="justify-content: space-between; align-items: center; margin-bottom: 16px"
    >
      <h3 style="margin: 0">내 채팅</h3>
      <div style="display: flex; gap: 8px">
        <button class="btn" @click="$router.push('/chats/new')">새 채팅</button>
        <button class="btn ghost" @click="refresh">새로고침</button>
      </div>
    </div>

    <div v-if="loading">로딩 중...</div>
    <div v-else-if="rooms.length === 0" style="text-align: center; color: #64748b; padding: 40px">
      <div style="margin-bottom: 16px">채팅방이 없습니다.</div>
      <button class="btn" @click="$router.push('/chats/new')">새 채팅 시작하기</button>
    </div>
    <div v-else style="display: grid; gap: 8px">
      <div
        v-for="r in rooms"
        :key="r.roomId"
        class="row"
        style="
          justify-content: space-between;
          align-items: center;
          border: 1px solid #2a2f36;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
        "
        @click="openRoom(r.roomId)"
      >
        <div>
          <div style="font-weight: 700; margin-bottom: 4px">
            {{ r.otherShop }}
          </div>
          <div class="badge" :style="{ borderColor: statusColor(r.status) }">
            {{ label(r.status) }}
          </div>
        </div>
        <button class="btn" @click.stop="openRoom(r.roomId)">열기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/api'
import { useRouter } from 'vue-router'

const rooms = ref([])
const loading = ref(false)
const router = useRouter()

const label = (s) =>
  ({
    WAITING: '대기중',
    IN_NEGOTIATION: '협의중',
    COMPLETED: '협의완료',
    REJECTED: '거절됨',
  })[s] || s

const statusColor = (s) =>
  ({
    WAITING: '#64748b',
    IN_NEGOTIATION: '#22c55e',
    COMPLETED: '#5eead4',
    REJECTED: '#ef4444',
  })[s] || '#64748b'

const refresh = async () => {
  loading.value = true
  try {
    // 백엔드의 실제 API 경로 사용
    const { data } = await api.get('/api/partnership/rooms')
    rooms.value = data
  } catch (e) {
    console.error('채팅방 목록 로드 오류:', e)
  } finally {
    loading.value = false
  }
}

const openRoom = (roomId) => router.push(`/chats/${roomId}`)

onMounted(refresh)
</script>
