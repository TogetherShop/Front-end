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

        <!-- 입금 정보 -->
        <div class="deposit-info">
          <div class="info-item">
            <span class="info-label">입금 금액: 500,000원</span>
          </div>
          <div class="info-item">
            <span class="info-label">입금주: 홍길동</span>
          </div>
          <div class="info-item">
            <span class="info-label">계좌번호: 1234-5678-9012</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
@import '@/styles/group-purchase-deposit-modal.css';
</style>
