<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="participants-modal" @click.stop>
      <div class="modal-content">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">공동구매 신청자</h3>
          <button class="close-button" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- 안내 문구 -->
        <div class="info-notice">
          입금 확인 되었을 때만 승인 버튼을 눌러주세요
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>참여자 목록을 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="participants.length === 0" class="empty-state">
          <p>아직 참여 신청자가 없습니다.</p>
        </div>

        <!-- 참여자 리스트 -->
        <div v-else class="participants-list">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="participant-card"
          >
            <div class="participant-info">
              <div class="participant-name">{{ participant.businessName }}</div>
              <div class="participant-details">
                <span class="material-symbols-outlined store-icon">storefront</span>
                <span class="participant-service">{{ participant.businessCategory || '' }}</span>
                <span class="participant-amount">₩ {{ formatPrice(item?.targetMoney || 0) }}</span>
              </div>
            </div>

            <div class="participant-actions">
              <button
                v-if="participant.status === 'APPLIED'"
                class="approve-btn"
                @click="approveParticipant(participant)"
                :disabled="approvingId === participant.id"
              >
                {{ approvingId === participant.id ? '처리중...' : '승인' }}
              </button>
              <button
                v-else-if="participant.status === 'CONFIRMED'"
                class="approved-btn"
                disabled
              >
                승인완료
              </button>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 0"
            @click="loadPage(currentPage - 1)"
          >
            이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage >= totalPages - 1"
            @click="loadPage(currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProjectParticipants, approveParticipant as approveParticipantAPI } from '@/api/group-purchase'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'approve'])

// 반응형 데이터
const participants = ref([])
const loading = ref(false)
const approvingId = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = ref(20)

// 참여자 목록 로드
const loadParticipants = async () => {
  if (!props.item?.projectId && !props.item?.id) {
    console.error('프로젝트 ID가 없습니다.')
    return
  }

  try {
    loading.value = true
    const projectId = props.item.projectId || props.item.id

    const response = await getProjectParticipants(projectId, {
      page: currentPage.value,
      size: pageSize.value
    })

    if (response.success && response.data) {
      participants.value = response.data.map(participant => ({
        ...participant
        // 기본값 제거 - API에서 받은 데이터 그대로 사용
      }))
      totalPages.value = response.totalPages || 1
    } else if (Array.isArray(response)) {
      // 응답이 배열인 경우
      participants.value = response.map(participant => ({
        ...participant
        // 기본값 제거 - API에서 받은 데이터 그대로 사용
      }))
      totalPages.value = 1
    }
  } catch (error) {
    console.error('참여자 목록 로드 실패:', error)
    participants.value = []
  } finally {
    loading.value = false
  }
}

// 페이지 변경
const loadPage = async (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    await loadParticipants()
  }
}

// 참여자 승인
const approveParticipant = async (participant) => {
  try {
    approvingId.value = participant.id // 백엔드 DDL: id 필드 사용

    const response = await approveParticipantAPI(participant.id) // 백엔드 DDL: id 필드 사용

    if (response.success) {
      // 로컬 상태 업데이트 (백엔드 DDL 기준)
      participant.status = 'CONFIRMED'

      // 부모 컴포넌트에 이벤트 전달
      emit('approve', participant.id)

      console.log('승인 완료:', participant.businessName)
    } else {
      console.error('승인 실패:', response.message)
      alert(response.message || '승인에 실패했습니다.')
    }
  } catch (error) {
    console.error('승인 처리 중 오류:', error)
    alert('승인 처리 중 오류가 발생했습니다.')
  } finally {
    approvingId.value = null
  }
}

// 모달 닫기
const closeModal = () => {
  emit('close')
}

// 가격 포맷팅
const formatPrice = (price) => {
  return price ? price.toLocaleString() : '0'
}

// 컴포넌트 마운트 시 참여자 목록 로드
onMounted(() => {
  loadParticipants()
})
</script>

<style scoped>
@import '@/styles/group-purchase-participants-modal.css';

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.approve-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
