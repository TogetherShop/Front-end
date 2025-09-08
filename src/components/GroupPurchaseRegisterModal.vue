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
            <label for="title" class="form-label">공동구매 할 물품 명칭</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="quantity" class="form-label">총 수량</label>
            <input
              id="quantity"
              v-model="formData.quantity"
              type="number"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="maxParticipants" class="form-label">모집 인원 수</label>
            <input
              id="maxParticipants"
              v-model="formData.maxParticipants"
              type="number"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="totalPrice" class="form-label">총 금액</label>
            <input
              id="totalPrice"
              v-model="formData.totalPrice"
              type="number"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="accountNumber" class="form-label">공동구매시 계좌번호</label>
            <input
              id="accountNumber"
              v-model="formData.accountNumber"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="deadline" class="form-label">입금주</label>
            <input
              id="deadline"
              v-model="formData.deadline"
              type="date"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="finalDate" class="form-label">마감일</label>
            <input
              id="finalDate"
              v-model="formData.finalDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <!-- 등록 버튼 -->
          <button type="submit" class="register-button" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? '등록 중...' : '등록하기' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['close', 'confirm'])

const loading = ref(false)

const formData = reactive({
  title: '',
  quantity: '',
  maxParticipants: '',
  totalPrice: '',
  accountNumber: '',
  deadline: '',
  finalDate: ''
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = async () => {
  loading.value = true

  try {
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('confirm', formData)
  } catch (error) {
    console.error('등록 실패:', error)
    alert('등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/group-purchase-register-modal.css';
</style>
