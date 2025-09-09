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
            <h4 class="item-title">{{ item?.title || '공동구매 프로젝트' }}</h4>
            <p class="item-detail">목표 금액: ₩ {{ formatPrice(item?.targetMoney || item?.price || 0) }}</p>
            <p class="item-detail">목표 수량: {{ item?.targetQuantity || 0 }}명</p>
            <p class="item-detail">현재 참여: {{ item?.currentQuantity || 0 }}명</p>
            <p v-if="item?.endDate" class="item-detail">마감일: {{ formatDate(item?.endDate) }}</p>
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
    // 부모 컴포넌트에서 실제 API 호출을 처리
    emit('confirm', props.item)
    // loading 상태는 부모 컴포넌트에서 관리하므로 여기서는 즉시 false로 설정
    loading.value = false
  } catch (error) {
    console.error('액션 실패:', error)
    loading.value = false
  }
}

const formatPrice = (price) => {
  if (!price) return '0'
  return price.toLocaleString()
}

const formatDate = (dateString) => {
  if (!dateString) return ''

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
</script>

<style scoped>
@import '@/styles/group-purchase-action-modal.css';

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
