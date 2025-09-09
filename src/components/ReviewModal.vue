<template>
  <!-- 모달 오버레이 -->
  <div v-if="reviewModal.isOpen" class="modal-overlay" @click="closeModal">
    <!-- 모달 콘텐츠 -->
    <div class="modal-content" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">리뷰 작성</h2>
        <button @click="closeModal" class="close-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- 매장 정보 -->
      <div class="store-info">
        <span class="store-name">{{ reviewModal.storeName }}</span>
      </div>

      <!-- 별점 입력 -->
      <div class="rating-section">
        <label class="section-label">별점</label>
        <div class="star-rating">
          <button
            v-for="star in 5"
            :key="star"
            @click="setRating(star)"
            class="star-button"
            :class="{ active: star <= reviewModal.rating }"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 1L12.09 6.26L18 7.27L14 11.14L15.18 17.02L10 14.77L4.82 17.02L6 11.14L2 7.27L7.91 6.26L10 1Z"
                :fill="star <= reviewModal.rating ? '#FFD700' : 'none'"
                :stroke="star <= reviewModal.rating ? '#FFD700' : '#D1D5DB'"
                stroke-width="1"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 후기 입력 -->
      <div class="comment-section">
        <label class="section-label">후기</label>
        <textarea
          v-model="reviewModal.comment"
          placeholder="매장에 대한 솔직한 후기를 작성해주세요."
          class="comment-textarea"
          maxlength="500"
        ></textarea>
        <div class="character-count">{{ reviewModal.comment.length }}/500</div>
      </div>

      <!-- 모달 액션 버튼 -->
      <div class="modal-actions">
        <button @click="submitReview" :disabled="!canSubmit || isSubmitting" class="submit-button">
          <div v-if="isSubmitting" class="loading-spinner"></div>
          <span>{{ isSubmitting ? '등록 중...' : '등록하기' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useReviewsStore } from '@/stores/reviews'

const reviewsStore = useReviewsStore()

// 스토어에서 상태 가져오기 - storeToRefs 사용
const { reviewModal, isSubmitting } = storeToRefs(reviewsStore)

// 제출 가능 여부 확인
const canSubmit = computed(() => {
  return reviewModal.value.rating > 0 && reviewModal.value.comment.trim().length > 0
})

// 별점 설정
const setRating = (rating) => {
  reviewsStore.setRating(rating)
}

// 모달 닫기
const closeModal = () => {
  if (isSubmitting.value) return
  reviewsStore.closeReviewModal()
}

// 리뷰 제출
const submitReview = async () => {
  const success = await reviewsStore.submitReview()
  if (success) {
    // 성공시 추가 액션 (토스트 메시지 등)
    console.log('리뷰가 성공적으로 등록되었습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: #f8f8f8;
  border: 1px solid #cdcdcd;
  border-radius: 12px;
  box-shadow:
    0px 1px 2px -1px rgba(0, 0, 0, 0.1),
    0px 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 358px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 25px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-title {
  color: #212121;
  font-family: 'Pretendard-SemiBold', Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #222222;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: opacity 0.2s ease;
}

.close-button:hover {
  opacity: 0.7;
}

.store-info {
  padding: 0 25px;
  margin-top: 6px;
}

.store-name {
  color: #666;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 28px;
}

.rating-section,
.comment-section {
  padding: 0 25px;
  margin-bottom: 20px;
}

.section-label {
  display: block;
  color: #6f797a;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  margin-bottom: 8px;
}

.star-rating {
  display: flex;
  gap: 4px;
}

.star-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s ease;
}

.star-button:hover {
  transform: scale(1.1);
}

.star-button:active {
  transform: scale(0.95);
}

.comment-textarea {
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 16px;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 14px;
  line-height: 20px;
  resize: none;
  min-height: 135px;
  box-sizing: border-box;
}

.comment-textarea:focus {
  outline: none;
  border-color: #017f58;
  box-shadow: 0 0 0 2px rgba(1, 127, 88, 0.1);
}

.comment-textarea::placeholder {
  color: #9ca3af;
}

.character-count {
  text-align: right;
  color: #6b7280;
  font-size: 12px;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  margin-top: 8px;
}

.modal-actions {
  padding: 16px 25px 25px;
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #006c35;
  border: none;
  border-radius: 6px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 16px;
  font-family: 'Pretendard-Medium', Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;
  transition: background-color 0.2s ease;
  min-width: 66px;
  justify-content: center;
}

.submit-button:hover:not(:disabled) {
  background-color: #005a2d;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
