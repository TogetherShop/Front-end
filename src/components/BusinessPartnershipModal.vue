<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="partnership-modal" @click.stop>
      <div class="modal-content">
        <!-- 확인 메시지 -->
        <div class="confirmation-section">
          <h3 class="confirmation-title">해당 가게에 제휴 요청하시겠습니까?</h3>
        </div>

        <!-- 확인 버튼 -->
        <button class="confirm-button" @click="confirmPartnership" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '요청 중...' : '요청 하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  store: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const loading = ref(false)

const closeModal = () => {
  emit('close')
}

const confirmPartnership = async () => {
  loading.value = true

  try {
    // 잠시 대기 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('confirm', props.store)
  } catch (error) {
    console.error('제휴 요청 실패:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/business-partnership-modal.css';
</style>
