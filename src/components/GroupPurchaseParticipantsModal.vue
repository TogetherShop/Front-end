<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="participants-modal" @click.stop>
      <div class="modal-content">
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title">공동구매 신청자</h3>
          <button class="close-button" @click="closeModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- 안내 문구 -->
        <div class="info-notice">
          입금 확인 되었을 때만 승인 버튼을 눌러주세요
        </div>

        <!-- 참여자 리스트 -->
        <div class="participants-list">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="participant-card"
          >
            <div class="participant-info">
              <div class="participant-name">{{ participant.name }}</div>
              <div class="participant-details">
                <span class="material-symbols-outlined store-icon">storefront</span>
                <span class="participant-service">{{ participant.serviceType }}</span>
                <span class="participant-amount">$ {{ formatPrice(participant.amount) }}</span>
              </div>
            </div>

            <div class="participant-actions">
              <button
                v-if="participant.status === 'pending'"
                class="approve-btn"
                @click="approveParticipant(participant)"
              >
                승인
              </button>
              <button
                v-else-if="participant.status === 'approved'"
                class="approved-btn"
                disabled
              >
                승인완료
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// 샘플 참여자 데이터 (Image 1과 일치)
const participants = ref([
  {
    id: 1,
    name: '가가가',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'approved'
  },
  {
    id: 2,
    name: '나나나',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'pending'
  },
  {
    id: 3,
    name: '다다다',
    serviceType: '다다 서비스',
    amount: 500000,
    status: 'approved'
  },
  {
    id: 4,
    name: '라라라',
    serviceType: '라라 서비스',
    amount: 500000,
    status: 'approved'
  },
  {
    id: 5,
    name: '나나나',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'pending'
  },
  {
    id: 6,
    name: '나나나',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'pending'
  },
  {
    id: 7,
    name: '나나나',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'approved'
  },
  {
    id: 8,
    name: '나나나',
    serviceType: '가가 서비스',
    amount: 500000,
    status: 'approved'
  }
])

const closeModal = () => {
  emit('close')
}

const approveParticipant = (participant) => {
  participant.status = 'approved'
  console.log('승인:', participant.name)
}

const formatPrice = (price) => {
  return price.toLocaleString()
}
</script>

<style scoped>
@import '@/styles/group-purchase-participants-modal.css';
</style>
