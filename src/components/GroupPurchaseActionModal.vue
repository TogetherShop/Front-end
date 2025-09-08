<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="action-modal" @click.stop>
      <div class="modal-content">
        <!-- 닫기 버튼 -->
        <button class="close-button" @click="closeModal">
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- 확인 메시지 -->
        <div class="confirmation-section">
          <h3 class="confirmation-title">{{ modalConfig.title }}</h3>

          <div class="item-info">
            <p class="item-detail">가격: {{ formatPrice(item?.price || 500000) }}</p>
            <p class="item-detail">수량: 100개</p>
            <p class="item-description">{{ modalConfig.description }}</p>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <button 
          :class="['action-button', modalConfig.buttonClass]" 
          @click="confirmAction" 
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? modalConfig.loadingText : modalConfig.buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['join', 'cancel'].includes(value)
  },
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const loading = ref(false)

const modalConfig = computed(() => {
  if (props.type === 'join') {
    return {
      title: '공동 구매 참여 하시겠습니까?',
      description: '공동구매 진행 단계\n선결(인원모집 단계) → 계좌 안내 → 입금 확인 → 공동구매 시작',
      buttonText: '참여하기',
      loadingText: '참여 중...',
      buttonClass: 'join-button'
    }
  } else {
    return {
      title: '정말 취소하시겠습니까?',
      description: '취소하시면 다시 참여하실 수 없습니다.\n신중하게 결정해 주세요.',
      buttonText: '취소하기',
      loadingText: '취소 중...',
      buttonClass: 'cancel-button'
    }
  }
})

const closeModal = () => {
  emit('close')
}

const confirmAction = async () => {
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('confirm', props.item)
  } catch (error) {
    console.error('액션 실패:', error)
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return `${price.toLocaleString()}원`
}
</script>

<style scoped>
@import '@/styles/group-purchase-action-modal.css';
</style>
