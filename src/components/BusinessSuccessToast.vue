<template>
  <div v-if="show" class="toast-overlay">
    <div class="success-toast">
      <div class="toast-content">
        <div class="success-icon">
          <span class="material-symbols-outlined">check</span>
        </div>
        <span class="success-message">{{ message }}</span>
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
  message: {
    type: String,
    default: '완료되었습니다!'
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
