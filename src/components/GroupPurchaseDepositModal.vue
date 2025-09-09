<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="deposit-modal" @click.stop>
      <div class="modal-content">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">공동 구매 입금 정보</h3>
          <button class="close-button" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>입금 정보를 불러오는 중...</p>
        </div>

        <!-- 입금 정보 -->
        <div v-else class="deposit-info">
          <div class="info-item">
            <span class="info-label">입금 금액: {{ formatPrice(depositInfo.targetMoney) }}원</span>
          </div>
          <div class="info-item">
            <span class="info-label">입금주: {{ depositInfo.accountHost }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">계좌번호: {{ depositInfo.accountNumber }}</span>
          </div>
          <div v-if="depositInfo.endDate" class="info-item">
            <span class="info-label">마감일: {{ formatDate(depositInfo.endDate) }}</span>
          </div>
        </div>

        <!-- 안내 문구 -->
        <div class="notice">
          <p>위 계좌로 입금 후 주최자의 승인을 기다려주세요.</p>
          <p>입금 확인 후 승인이 완료됩니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getProjectDetail } from '@/api/group-purchase'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const projectDetail = ref(null)

// 입금 정보 계산
const depositInfo = computed(() => {
  if (projectDetail.value?.data) {
    return projectDetail.value.data
  }

  // 프로젝트 상세 정보가 없으면 전달받은 item에서 정보 추출
  return {
    targetMoney: props.item?.targetMoney || props.item?.price || 0,
    accountHost: props.item?.accountHost || '정보 없음',
    accountNumber: props.item?.accountNumber || '정보 없음',
    endDate: props.item?.endDate || null
  }
})

// 프로젝트 상세 정보 로드
const loadProjectDetail = async () => {
  if (!props.item?.projectId && !props.item?.id) {
    console.error('프로젝트 ID가 없습니다.')
    return
  }

  try {
    loading.value = true
    const projectId = props.item.projectId || props.item.id

    const response = await getProjectDetail(projectId)

    if (response.success) {
      projectDetail.value = response
    }
  } catch (error) {
    console.error('프로젝트 상세 정보 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 가격 포맷팅
const formatPrice = (price) => {
  if (!price) return '0'
  return price.toLocaleString()
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '정보 없음'

  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}.${month}.${day} ${hours}:${minutes}`
  } catch (error) {
    return dateString
  }
}

// 모달 닫기
const closeModal = () => {
  emit('close')
}

// 컴포넌트 마운트 시 프로젝트 상세 정보 로드
onMounted(() => {
  loadProjectDetail()
})
</script>

<style scoped>
@import '@/styles/group-purchase-deposit-modal.css';

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 150px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  text-align: center;
}

.notice p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
