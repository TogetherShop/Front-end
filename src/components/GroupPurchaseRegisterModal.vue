<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="register-modal" @click.stop>
      <div class="modal-content">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">공동구매 작성</h3>
          <button class="close-button" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- 폼 -->
        <form @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="title" class="form-label">공동구매 제목</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="예: 카페 원두 공동구매"
              required
            />
          </div>

          <div class="form-group">
            <label for="description" class="form-label">설명</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="공동구매에 대한 상세 설명을 입력하세요"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="targetQuantity" class="form-label">목표 수량</label>
              <input
                id="targetQuantity"
                v-model.number="formData.targetQuantity"
                type="number"
                class="form-input"
                min="1"
                required
              />
            </div>

            <div class="form-group">
              <label for="targetMoney" class="form-label">목표 금액 (원)</label>
              <input
                id="targetMoney"
                v-model.number="formData.targetMoney"
                type="number"
                class="form-input"
                min="1000"
                step="1000"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="accountNumber" class="form-label">계좌번호</label>
            <input
              id="accountNumber"
              v-model="formData.accountNumber"
              type="text"
              class="form-input"
              placeholder="예: 123-456-789012"
              required
            />
          </div>

          <div class="form-group">
            <label for="accountHost" class="form-label">입금주</label>
            <input
              id="accountHost"
              v-model="formData.accountHost"
              type="text"
              class="form-input"
              placeholder="예: 홍길동"
              required
            />
          </div>

          <div class="form-group">
            <label for="endDate" class="form-label">마감일</label>
            <input
              id="endDate"
              v-model="formData.endDate"
              type="date"
              class="form-input"
              :min="minDateTime"
              required
            />
          </div>

          <!-- 등록 버튼 -->
          <button type="submit" class="register-button" :disabled="loading || !isFormValid">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '등록 중...' : '등록하기' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { createProject } from '@/api/group-purchase'

const emit = defineEmits(['close', 'confirm'])

const loading = ref(false)

const formData = reactive({
  title: '',
  description: '',
  targetQuantity: null,
  targetMoney: null,
  accountNumber: '',
  accountHost: '',
  endDate: '',
})

// 최소 날짜/시간 (현재 시간 + 1시간)
const minDateTime = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return now.toISOString().slice(0, 16)
})

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    formData.title.trim() &&
    formData.description.trim() &&
    formData.targetQuantity > 0 &&
    formData.targetMoney > 0 &&
    formData.accountNumber.trim() &&
    formData.accountHost.trim() &&
    formData.endDate
  )
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('모든 필드를 올바르게 입력해주세요.')
    return
  }

  loading.value = true

  try {
    // API 명세서에 맞춰 데이터 변환
    const projectData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      targetQuantity: formData.targetQuantity,
      targetMoney: formData.targetMoney,
      accountNumber: formData.accountNumber.trim(),
      accountHost: formData.accountHost.trim(),
      endDate: formData.endDate,
    }

    // API 호출
    const response = await createProject(projectData)

    if (response.success) {
      emit('confirm', response.data)
    } else {
      throw new Error(response.message || '등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('공동구매 등록 실패:', error)

    let errorMessage = '등록에 실패했습니다. 다시 시도해주세요.'

    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || '입력 정보를 확인해주세요.'
    } else if (error.response?.status === 401) {
      errorMessage = '로그인이 필요합니다.'
    }

    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// 초기 설정
onMounted(() => {
  // 기본 마감일을 7일 후로 설정
  const defaultEndDate = new Date()
  defaultEndDate.setDate(defaultEndDate.getDate() + 7)
  defaultEndDate.setHours(23, 59, 0, 0)
  formData.endDate = defaultEndDate.toISOString().slice(0, 16)
})
</script>

<style scoped>
@import '@/styles/group-purchase-register-modal.css';

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
