<!-- /src/pages/StoreDetailPage.vue -->
<template>
  <div class="store-detail-page">
    <!-- 상단 헤더 -->
    <header class="header">
      <button class="icon-btn" aria-label="뒤로" @click="router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="#111"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="title">{{ store?.name || '매장 상세' }}</div>
      <div class="spacer"></div>
    </header>

    <!-- 히어로 이미지 -->
    <div class="hero">
      <img :src="store?.images?.[0] || '/images/default-store.jpg'" alt="" />
    </div>

    <!-- 기본 정보 -->
    <section class="base">
      <div class="name-row">
        <h1 class="name">{{ store?.name }}</h1>
        <span class="category">{{ getCategoryName(store?.type) }}</span>
      </div>

      <!-- 평점/거리 라인 -->
      <div class="meta-row">
        <div class="rating-chip">
          <svg width="14" height="14" viewBox="0 0 12 12" class="star" aria-hidden="true">
            <path
              d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.44L6 8.885 2.91 10.51 3.5 7.07 1 4.635l3.455-.505L6 1Z"
            />
          </svg>
          <b>{{ fmtRating(displayRating) }}</b>
          <span class="count">({{ store?.reviewCount ?? storeReviews.length }})</span>
        </div>
      </div>
    </section>
    <!-- 탭(세그먼트) -->
    <div class="segmented-wrap">
      <SegmentedTabs
        v-model="activeTab"
        :tabs="[
          { label: '매장정보', value: 'info' },
          { label: '제휴가게', value: 'partner' },
        ]"
      />
    </div>

    <!-- 상세 정보 -->
    <section class="info" v-show="activeTab === 'info'">
      <div class="info-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2C8 2 4 5 4 9c0 7 8 13 8 13s8-6 8-13c0-4-4-7-8-7Z"
            stroke="#6B7280"
            stroke-width="1.5"
          />
          <circle cx="12" cy="9" r="2.5" fill="#6B7280" />
        </svg>
        <span class="info-text">{{ store?.address || '주소 정보 없음' }}</span>
      </div>
      <div class="info-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 6v6l4 2"
            stroke="#6B7280"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="9" stroke="#6B7280" stroke-width="1.5" />
        </svg>
        <span class="info-text">{{ store?.openHours || '영업시간 정보 없음' }}</span>
      </div>
      <div class="info-row">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22 16.92v2a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3.11 4.18 2 2 0 0 1 5.1 2h2a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.18a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92Z"
            stroke="#6B7280"
            stroke-width="1.5"
          />
        </svg>
        <template v-if="store?.phone">
          <a class="info-text link" :href="`tel:${store.phone}`">{{ store.phone }}</a>
        </template>
        <span v-else class="info-text">전화번호 정보 없음</span>
      </div>

      <!-- 구분선 -->
      <hr class="divider" />

      <!-- 리뷰 -->
      <section class="reviews">
        <div class="reviews-head">
          <h2>
            리뷰 <span class="count">{{ storeReviews.length }}</span>
          </h2>
          <button class="write-link" type="button" @click="openReview">리뷰 작성</button>
        </div>

        <!-- 리뷰 목록 -->
        <div v-if="storeReviews.length" class="review-list">
          <article v-for="r in storeReviews" :key="r.id" class="review-card">
            <div class="avatar">{{ r.userInitial }}</div>
            <div class="content">
              <div class="row1">
                <strong class="user">{{ r.userName }}</strong>
                <div class="stars" aria-label="별점">
                  {{ '★★★★★'.slice(0, r.rating).padEnd(5, '☆') }}
                </div>
              </div>
              <p class="text" v-html="r.comment.replace(/\n/g, '<br>')"></p>
              <div class="date">{{ r.createdAt }}</div>
            </div>
          </article>
        </div>
        <div v-else class="empty">아직 리뷰가 없습니다.</div>
      </section>
    </section>
    <!-- 제휴가게 탭 -->
    <section class="partner" v-if="activeTab === 'partner'">
      <!-- 맵은 탭 전환 시 새로 마운트되도록 v-if 사용 (카카오맵 사이즈 문제 방지) -->
      <div class="partner-map-wrap" v-if="activeTab === 'partner'">
        <StoreMap
          :stores="partnerStoresWithBase"
          :selected-store="selectedPartner"
          :center="storeCenter"
          :show-search="false"
          :panel-expanded="false"
          :show-panel="false"
          :show-user-marker="false"
          @select-store="(s) => (selectedPartner = s)"
          @update:panelExpanded="(v) => (partnerPanelExpanded = v)"
        />
      </div>

      <div v-if="!partnerStores.length" class="empty">제휴가게 정보가 없습니다.</div>
    </section>
    <ReviewModal />
    <CustomerBottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue' // ⬅ onMounted, watch 추가
import { useRoute, useRouter } from 'vue-router'
import { useStoresStore } from '@/stores/stores'
import SegmentedTabs from '@/components/SegmentedTabs.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue' // ⬅ 추가
import StoreMap from '@/components/StoreMap.vue' // ⬅ 추가
import { useReviewsStore } from '@/stores/reviews' // ⬅ 추가
import ReviewModal from '@/components/ReviewModal.vue' // ⬅ 추가

const route = useRoute()
const router = useRouter()
const storesStore = useStoresStore()
const reviewsStore = useReviewsStore() // ⬅ 추가

const id = computed(() => route.params.id?.toString() ?? null)
const store = computed(() => storesStore.stores.find((s) => s.id === id.value) || null)
const activeTab = ref('info')

const getCategoryName = (t) =>
  ({ restaurant: '음식점', cafe: '카페', retail: '소매점', store: '매장' })[t] || '매장'
const fmtRating = (r) => (typeof r === 'number' ? r.toFixed(1) : '0.0')

/** 리뷰 데이터 연동 */
const storeReviews = computed(() => reviewsStore.reviewsByStore(id.value))
const avgFromReviews = computed(() => Number(reviewsStore.averageRating(id.value)))

// 페이지 상단의 평점은 DB 값이 있으면 우선 사용, 없으면 리뷰 평균 표시
const displayRating = computed(() => (store.value?.rating ?? avgFromReviews.value) || 0)

// 최초 진입/매장 변경 시 해당 매장 리뷰 로딩 (중복 로딩 방지 로직은 store에서 처리)
const loadReviews = () => {
  if (!id.value) return
  reviewsStore.fetchReviews(id.value)
}
onMounted(loadReviews)
watch(id, loadReviews)

// // 데모용 더미 리뷰 (백엔드 연결 시 교체)
// const dummyReviews = [
//   {
//     id: 1,
//     user: '사용자1',
//     userInitial: 'U1',
//     text: '맛있고 친절해요. 소바가 정말 맛있습니다. 다시 방문하고 싶어요!',
//     date: '2일 전',
//   },
//   {
//     id: 2,
//     user: '사용자2',
//     userInitial: 'U2',
//     text: '사장님이 친절해요! 또 올게요~',
//     date: '3일 전',
//   },
// ]

const storeCenter = computed(() => {
  const s = store.value
  return s?.lat && s?.lng ? { lat: s.lat, lng: s.lng } : { lat: 37.5173, lng: 127.0473 }
})

// Haversine 거리(m)
const distM = (a, b) => {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return Infinity
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1))
}

// 기준: 현재 매장 중심 반경 2km & 쿠폰 보유(=제휴 가게 가정)
const PARTNER_RADIUS_M = 2000

const partnerStores = computed(() => {
  const base = store.value
  if (!base) return []
  const center = { lat: base.lat, lng: base.lng }
  return (storesStore.stores || [])
    .filter(
      (s) =>
        s?.id !== base.id &&
        s?.lat &&
        s?.lng &&
        s?.hasDiscount === true &&
        distM(center, { lat: s.lat, lng: s.lng }) <= PARTNER_RADIUS_M,
    )
    .map((s) => {
      const d = Math.round(distM(center, { lat: s.lat, lng: s.lng }))
      return { ...s, distance: d, walkTime: Math.max(1, Math.round(d / 67)) } // 대략 4km/h
    })
    .sort((a, b) => a.distance - b.distance)
})

// ✅ 현재 매장을 맵 마커로도 함께 보여주기 위한 가짜(프론트 전용) 마커
const baseMarker = computed(() => {
  const s = store.value
  if (!s?.lat || !s?.lng) return null
  // id 충돌 방지용 prefix, 구분을 위한 flag(isBase)
  return { ...s, id: `base-${s.id}`, isBase: true }
})

// ✅ 제휴가게 + 현재 매장 마커를 함께 전달
const partnerStoresWithBase = computed(() => {
  const arr = partnerStores.value || []
  return baseMarker.value ? [baseMarker.value, ...arr] : arr
})

// StoreMap과 바인딩할 상태
const selectedPartner = ref(null)
const partnerPanelExpanded = ref(true)

/** 모달 열기 */
const openReview = () => {
  if (!store.value) return
  reviewsStore.openReviewModal(id.value, store.value.name || '매장')
}

// ✅ 파트너 탭 들어갈 때 현재 매장을 기본 선택 & 센터 고정
watch(
  () => activeTab.value,
  (v) => {
    if (v === 'partner' && baseMarker.value) {
      selectedPartner.value = baseMarker.value
    }
  },
  { immediate: true },
)
</script>

<style scoped>
:root {
  --primary: #10b981;
  --text-strong: #111827;
  --text: #374151;
  --muted: #6b7280;
  --line: #e5e7eb;
}

.store-detail-page {
  background: #fff;
  min-height: 100vh;
  padding-bottom: var(--bottom-nav-height, 72px);
}

/* 헤더 */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 6px;
}
.title {
  font-weight: 700;
  font-size: 21px;
}
.spacer {
  width: 22px;
}

/* 히어로 */
.hero {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f4f4f4;
}
.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 기본 정보 */
.base {
  padding: 14px 16px 8px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0a0a0a;
}
.category {
  font-size: 12px;
  color: var(--muted);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.rating-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-strong);
}
.rating-chip .star {
  fill: var(--primary);
}
.rating-chip b {
  font-weight: 800;
}
.rating-chip .count {
  color: #9ca3af;
  margin-left: 2px;
}
.segmented-wrap {
  padding: 10px 16px 0;
}

/* 매장 정보 */
.info {
  padding: 12px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 17px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.info-text {
  font-size: 14px;
  color: var(--text);
}
.link {
  color: var(--primary);
  text-decoration: underline;
}

/* 구분선 */
.divider {
  display: block;
  height: 0;
  margin: 5px 0;
  border: none;
  border-top: 1px solid #e9e9ef !important;
  opacity: 1 !important; /* 부트스트랩 reset 대비 */
  background: transparent;
}

/* 리뷰 */
.reviews {
  padding: 6px 16px 20px;
}
.reviews-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.reviews-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}
.count {
  color: var(--muted);
  font-weight: 700;
}
.write-link {
  background: transparent;
  border: none;
  color: #017f58;
  font-weight: 700;
  font-size: 13px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
/* 카드 컨테이너 */
.review-card {
  display: grid;
  grid-template-columns: 36px 1fr; /* 아바타, 내용 */
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #eaecf0; /* 더 밝은 보더 */
  border-radius: 16px; /* 둥글게 */
  background: #fff;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    /* 부드러운 그림자 */ 0 1px 3px rgba(17, 24, 39, 0.04);
  min-height: 96px; /* 기본 높이(디자인에 맞게 조정) */
}

/* 왼쪽 아바타 원 */
.review-card .avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #6b7280;
  flex-shrink: 0;
}

/* 오른쪽 내용 영역 */
.review-card .content {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr auto; /* row1, 본문, 날짜 */
}

.review-card .row1 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.review-card .user {
  font-weight: 700;
  font-size: 14px;
  color: #111827;
}

/* 별점(텍스트로 ★★★★★ 사용 중) */
.review-card .stars {
  color: #f59e0b; /* 노란 별 */
  font-size: 12px;
  letter-spacing: 1px; /* 별 간격 */
  transform: translateY(-1px);
}

/* 본문 텍스트 */
.review-card .text {
  margin: 6px 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}

/* 날짜 */
.review-card .date {
  color: #9ca3af;
  font-size: 12px;
  align-self: end; /* 항상 아래쪽 */
}

.empty {
  padding: 20px;
  color: #9ca3af;
  text-align: center;
}
/* 제휴가게 섹션 */
.partner {
  padding: 8px 0 0;
}
.partner-title {
  padding: 0 16px;
  margin: 8px 0 10px;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}
.partner-map-wrap {
  height: 25vh; /* 기존보다 살짝 낮게 */
  min-height: 230px; /* 모바일에서도 답답하지 않게 */
  max-height: 520px; /* 데스크톱에서 과하게 길어지는 것 방지 */
  padding: 0 12px; /* 좌우 살짝 여백 (디자인 맞춤) */
}

/* 필요 시 내용 없을 때 */
.partner .empty {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
}
</style>
