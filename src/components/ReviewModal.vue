<!-- /src/components/ReviewModal.vue -->
<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useReviewsStore } from '@/stores/reviews'

const reviewsStore = useReviewsStore()
const { reviewModal, isSubmitting } = storeToRefs(reviewsStore)

const canSubmit = computed(
  () => reviewModal.value.rating > 0 && reviewModal.value.comment.trim().length > 0,
)

const setRating = (rating) => reviewsStore.setRating(rating)
const closeModal = () => {
  if (!isSubmitting.value) reviewsStore.closeReviewModal()
}
const submitReview = async () => {
  const ok = await reviewsStore.submitReview()
  if (ok) console.log('리뷰가 성공적으로 등록되었습니다.')
}

// ESC 닫기 + 바디 스크롤 잠금
const onKey = (e) => {
  if (e.key === 'Escape') closeModal()
}
onMounted(() => {
  document.addEventListener('keydown', onKey)
  if (reviewModal.value.isOpen) document.body.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="reviewModal.isOpen" class="modal-overlay" @click="closeModal">
    <div
      class="modal-content"
      @click.stop
      role="dialog"
      aria-modal="true"
      aria-labelledby="rv-title"
    >
      <!-- 헤더: 디자인처럼 '리뷰 작성' + 매장이름 -->
      <div class="modal-header">
        <div class="title-wrap">
          <h2 id="rv-title" class="modal-title">리뷰 작성</h2>
          <span class="store-name-inline">{{ reviewModal.storeName }}</span>
        </div>
        <button @click="closeModal" class="close-button" aria-label="닫기">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 별점 -->
      <div class="rating-section">
        <label class="section-label">별점</label>
        <div class="star-rating" aria-label="별점 선택">
          <button
            v-for="star in 5"
            :key="star"
            @click="setRating(star)"
            class="star-button"
            :class="{ active: star <= reviewModal.rating }"
            :aria-label="`${star}점`"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
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

      <!-- 후기 -->
      <div class="comment-section">
        <label class="section-label">후기</label>
        <textarea
          v-model="reviewModal.comment"
          placeholder="매장에 대한 솔직한 후기를 작성해주세요."
          class="comment-textarea"
          maxlength="500"
        />
        <div class="character-count">{{ reviewModal.comment.length }}/500</div>
      </div>

      <!-- 액션 -->
      <div class="modal-actions">
        <button @click="submitReview" :disabled="!canSubmit || isSubmitting" class="submit-button">
          <div v-if="isSubmitting" class="loading-spinner"></div>
          <span>{{ isSubmitting ? '등록 중...' : '등록하기' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.modal-content {
  background: #fff;
  border: 1px solid #dcdcdc;
  border-radius: 16px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #212121;
}
.store-name-inline {
  color: #666;
  font-size: 14px;
}
.close-button {
  background: none;
  border: 0;
  cursor: pointer;
  color: #222;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-section,
.comment-section {
  padding: 0 24px;
  margin: 16px 0;
}
.section-label {
  display: block;
  color: #6f797a;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}
.star-rating {
  display: flex;
  gap: 6px;
}
.star-button {
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  transition: transform 0.08s;
}
.star-button:hover {
  transform: scale(1.1);
}

.comment-textarea {
  width: 100%;
  min-height: 140px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
  resize: none;
}
.comment-textarea:focus {
  outline: none;
  border-color: #017f58;
  box-shadow: 0 0 0 2px rgba(1, 127, 88, 0.12);
}
.comment-textarea::placeholder {
  color: #9ca3af;
}
.character-count {
  text-align: right;
  color: #6b7280;
  font-size: 12px;
  margin-top: 8px;
}

.modal-actions {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
}
.submit-button {
  background: #006c35;
  color: #fff;
  border: 0;
  border-radius: 8px;
  height: 40px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.submit-button:hover:not(:disabled) {
  background: #005a2d;
}
.submit-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
