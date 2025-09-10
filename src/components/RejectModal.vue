<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3>거절 사유</h3>
      <textarea
        v-model="reason"
        placeholder="거절 사유를 입력해주세요 (선택사항)"
        rows="3"
      ></textarea>
      <div class="modal-actions">
        <button class="confirm" @click="confirm">거절</button>
        <button class="cancel" @click="close">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
})

const emit = defineEmits(['close', 'confirm'])

const reason = ref('')

// 부모가 visible false로 바꾸면 내부 리셋
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) reason.value = ''
  },
)

const close = () => emit('close')
const confirm = () => emit('confirm', reason.value || '사유 없음')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal {
  background: red;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 320px;
  min-height: 120px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
.modal h3 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #374151;
}
.modal textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  resize: vertical;
  font-size: 14px;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.confirm {
  flex: 1;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-weight: bold;
  cursor: pointer;
}
.cancel {
  flex: 1;
  background: #e5e7eb;
  border: none;
  border-radius: 6px;
  padding: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>
