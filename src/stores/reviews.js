// /src/stores/reviews.js
import { defineStore } from 'pinia'
import { useStoresStore } from '@/stores/stores' // ✨ 추가

function toYMD(datetimeString) {
  if (!datetimeString) return ''
  const d = new Date(datetimeString)
  if (Number.isNaN(d.getTime())) return String(datetimeString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [], // [{ id, storeId, userName, userInitial, rating(정수★), ratingRaw(실수), comment, createdAt }]
    loadedStoreIds: {}, // { [storeId]: true }
    isLoading: false,
    isSubmitting: false,
    reviewModal: { isOpen: false, storeId: null, storeName: '', rating: 0, comment: '' },
  }),

  getters: {
    reviewsByStore: (state) => (storeId) => state.reviews.filter((r) => r.storeId === storeId),

    // 평균은 ratingRaw(실수) 우선 사용, 없으면 rating(정수) 사용
    averageRating: (state) => (storeId) => {
      const arr = state.reviews.filter((r) => r.storeId === storeId)
      if (!arr.length) return 0
      const sum = arr.reduce((a, r) => a + Number(r.ratingRaw ?? r.rating ?? 0), 0)
      return Math.round((sum / arr.length) * 10) / 10 // number
    },
  },

  actions: {
    async fetchReviews(storeId) {
      if (!storeId || this.loadedStoreIds[storeId]) return
      this.isLoading = true
      try {
        const raw = localStorage.getItem('access_token') || ''
        const token = raw.replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '')

        const res = await fetch(`/api/stores/${encodeURIComponent(storeId)}/reviews`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) throw new Error('리뷰를 불러오지 못했습니다')

        const data = await res.json()
        const mapped = Array.isArray(data)
          ? data.map((r) => {
              const ratingRaw = Number(r.rating ?? 0) // 예: 4.2
              const ratingInt = Math.max(0, Math.min(5, Math.round(ratingRaw))) // ★ 표시용 정수
              const userName = r.displayName || (r.customerId ? `고객#${r.customerId}` : '익명')
              return {
                id: String(r.id),
                storeId: String(storeId),
                userName,
                userInitial: userName.slice(0, 1).toUpperCase(),
                rating: ratingInt,
                ratingRaw,
                comment: r.content ?? '',
                createdAt: toYMD(r.createdAt),
              }
            })
          : []

        // 기존 데이터와 합치되, 동일 id 중복 제거
        const existing = this.reviews.filter((rv) => rv.storeId !== String(storeId))
        const dedupIds = new Set()
        const merged = [...existing, ...mapped].filter((rv) => {
          if (dedupIds.has(rv.id)) return false
          dedupIds.add(rv.id)
          return true
        })
        this.reviews = merged
        this.loadedStoreIds[storeId] = true
      } catch (e) {
        console.error('[reviews] fetch error:', e)
      } finally {
        this.isLoading = false
      }
    },

    openReviewModal(storeId, storeName) {
      this.reviewModal = { isOpen: true, storeId, storeName, rating: 0, comment: '' }
      document.body.style.overflow = 'hidden' // 모달 열릴 때 스크롤 잠금(선택)
    },
    closeReviewModal() {
      this.reviewModal = { isOpen: false, storeId: null, storeName: '', rating: 0, comment: '' }
      document.body.style.overflow = '' // 스크롤 해제
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
        const storeId = this.reviewModal.storeId
        const raw = localStorage.getItem('access_token') || ''
        const token = raw.replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '')

        const res = await fetch(`/api/stores/${encodeURIComponent(storeId)}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            rating: Number(this.reviewModal.rating), // 백엔드 Double(0~5)
            content: this.reviewModal.comment.trim(),
            // 운영에서는 customerId를 보내지 말고 서버에서 인증으로 추출
          }),
        })
        if (!res.ok) throw new Error('리뷰 작성 실패')

        // 백엔드가 ReviewCreateResponse 반환한다고 가정(이전 답변)
        // { id, businessId, customerId, rating, content, createdAt, displayName, updatedAvg, updatedCount }
        let saved = null
        try {
          saved = await res.json()
        } catch {
          /* 바디 없음 대응 */
        }

        // 1) 리스트에 새 리뷰 추가(낙관적 UI)
        const ratingRaw = Number(saved?.rating ?? this.reviewModal.rating ?? 0)
        const ratingInt = Math.max(0, Math.min(5, Math.round(ratingRaw)))
        const userName =
          saved?.displayName || (saved?.customerId ? `고객#${saved.customerId}` : '나')

        this.reviews.unshift({
          id: String(saved?.id ?? Date.now()),
          storeId: String(saved?.businessId ?? storeId),
          userName,
          userInitial: userName.slice(0, 1).toUpperCase(),
          rating: ratingInt, // 별(정수)
          ratingRaw, // 실수 원본
          comment: saved?.content ?? this.reviewModal.comment,
          createdAt: toYMD(saved?.createdAt ?? new Date().toISOString()),
        })

        // 2) 상단 평균/총개수 즉시 동기화
        const storesStore = useStoresStore()
        const updatedAvg =
          typeof saved?.updatedAvg === 'number'
            ? saved.updatedAvg
            : this.averageRating(String(storeId)) // 백엔드가 평균을 안 주면 로컬 평균으로 fallback
        const updatedCount =
          typeof saved?.updatedCount === 'number'
            ? saved.updatedCount
            : (storesStore.stores.find((s) => s.id === String(storeId))?.reviewCount ??
              this.reviews.filter((r) => r.storeId === String(storeId)).length)

        storesStore.patchRating(String(storeId), Number(updatedAvg), Number(updatedCount))

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
