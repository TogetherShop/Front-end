import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
    isLoading: false,
    isSubmitting: false,
    reviewModal: {
      isOpen: false,
      storeId: null,
      storeName: '',
      rating: 0,
      comment: '',
    },
  }),

  getters: {
    reviewsByStore: (state) => (storeId) => {
      return state.reviews.filter((review) => review.storeId === storeId)
    },

    averageRating: (state) => (storeId) => {
      const storeReviews = state.reviews.filter((review) => review.storeId === storeId)
      if (storeReviews.length === 0) return 0

      const sum = storeReviews.reduce((acc, review) => acc + review.rating, 0)
      return (sum / storeReviews.length).toFixed(1)
    },
  },

  actions: {
    async fetchReviews(storeId) {
      this.isLoading = true

      try {
        // 실제 API 호출 대신 더미 데이터
        await new Promise((resolve) => setTimeout(resolve, 500))

        const dummyReviews = [
          {
            id: 1,
            storeId: storeId,
            userName: '사용자1',
            userInitial: 'U1',
            rating: 5,
            comment: '맛있고 친절해요. 소바가 정말 맛있습니다.\n다시 방문하고 싶어요!',
            createdAt: '2일 전',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 2,
            storeId: storeId,
            userName: '사용자1',
            userInitial: 'U1',
            rating: 4,
            comment: '사장님이 친절해요!\n또 올게요~',
            createdAt: '3일 전',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ]

        this.reviews = [...this.reviews, ...dummyReviews]
      } catch (error) {
        console.error('리뷰를 가져오는데 실패했습니다:', error)
      } finally {
        this.isLoading = false
      }
    },

    openReviewModal(storeId, storeName) {
      this.reviewModal = {
        isOpen: true,
        storeId,
        storeName,
        rating: 0,
        comment: '',
      }
    },

    closeReviewModal() {
      this.reviewModal = {
        isOpen: false,
        storeId: null,
        storeName: '',
        rating: 0,
        comment: '',
      }
    },

    setRating(rating) {
      this.reviewModal.rating = rating
    },

    setComment(comment) {
      this.reviewModal.comment = comment
    },

    async submitReview() {
      if (this.reviewModal.rating === 0 || !this.reviewModal.comment.trim()) {
        alert('별점과 후기를 모두 입력해주세요.')
        return false
      }

      this.isSubmitting = true

      try {
        // 실제 API 호출
        await new Promise((resolve) => setTimeout(resolve, 1000))

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
      } catch (error) {
        console.error('리뷰 작성에 실패했습니다:', error)
        alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.')
        return false
      } finally {
        this.isSubmitting = false
      }
    },
  },
})
