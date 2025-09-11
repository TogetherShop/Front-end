// ✅ 꼭 추가
import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
    loadedStoreIds: {}, // { [storeId]: true }
    isLoading: false,
    isSubmitting: false,
    reviewModal: { isOpen: false, storeId: null, storeName: '', rating: 0, comment: '' },
  }),

  getters: {
    reviewsByStore: (state) => (storeId) => state.reviews.filter((r) => r.storeId === storeId),
    averageRating: (state) => (storeId) => {
      const arr = state.reviews.filter((r) => r.storeId === storeId)
      if (!arr.length) return 0
      const sum = arr.reduce((a, r) => a + r.rating, 0)
      return (sum / arr.length).toFixed(1)
    },
  },

  actions: {
    async fetchReviews(storeId) {
      if (!storeId || stateHasLoaded(this.loadedStoreIds, storeId)) return
      this.isLoading = true
      try {
        await new Promise((r) => setTimeout(r, 400)) // ← 실제 API 자리

        const dummy = [
          {
            id: 1,
            storeId,
            userName: '사용자1',
            userInitial: 'U1',
            rating: 5,
            comment: '맛있고 친절해요. 소바가 정말 맛있습니다.\n다시 방문하고 싶어요!',
            createdAt: '2일 전',
            date: new Date(Date.now() - 2 * 864e5),
          },
          {
            id: 2,
            storeId,
            userName: '사용자2',
            userInitial: 'U2',
            rating: 4,
            comment: '사장님이 친절해요!\n또 올게요~',
            createdAt: '3일 전',
            date: new Date(Date.now() - 3 * 864e5),
          },
        ]

        this.reviews = [...this.reviews, ...dummy]
        this.loadedStoreIds[storeId] = true // ✅ 로드 마킹
      } catch (e) {
        console.error('리뷰 로딩 실패:', e)
      } finally {
        this.isLoading = false
      }
    },

    openReviewModal(storeId, storeName) {
      this.reviewModal = { isOpen: true, storeId, storeName, rating: 0, comment: '' }
    },
    closeReviewModal() {
      this.reviewModal = { isOpen: false, storeId: null, storeName: '', rating: 0, comment: '' }
    },
    setRating(v) {
      this.reviewModal.rating = v
    },
    setComment(v) {
      this.reviewModal.comment = v
    },

    async submitReview() {
      if (this.reviewModal.rating === 0 || !this.reviewModal.comment.trim()) {
        alert('별점과 후기를 모두 입력해주세요.')
        return false
      }
      this.isSubmitting = true
      try {
        await new Promise((r) => setTimeout(r, 600)) // ← 실제 API 자리
        const newReview = {
          id: Date.now(),
          storeId: this.reviewModal.storeId,
          userName: '나',
          userInitial: '나',
          rating: this.reviewModal.rating,
          comment: this.reviewModal.comment,
          createdAt: '방금 전',
          date: new Date(),
        }
        this.reviews.unshift(newReview)
        this.closeReviewModal()
        return true
      } catch (e) {
        console.error('리뷰 작성 실패:', e)
        alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
        return false
      } finally {
        this.isSubmitting = false
      }
    },
  },
})

// 작은 유틸 (맵/Set 둘 다 대응하고 싶을 때)
function stateHasLoaded(mapOrSet, key) {
  if (!mapOrSet) return false
  if (mapOrSet instanceof Set) return mapOrSet.has(key)
  return !!mapOrSet[key]
}
