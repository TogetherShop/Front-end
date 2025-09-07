<template>
  <div v-if="show" class="toast-overlay">
    <div class="success-toast">
      <div class="toast-content">
        <div class="success-icon">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <span class="success-message">제휴 요청 되었습니다!</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['hide'])

// 자동으로 토스트 숨기기
watch(() => props.show, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      emit('hide')
    }, props.duration)
  }
})
</script>

<style scoped>
@import '@/styles/business-success-toast.css';
</style>
