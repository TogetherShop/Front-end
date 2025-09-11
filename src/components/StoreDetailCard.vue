<!-- /src/components/StoreDetailCard.vue -->
<template>
  <div class="detail-card" @click="$emit('open', store)">
    <!-- 제목/카테고리 -->
    <div class="detail-title-row">
      <h2 class="detail-name">{{ store.name }}</h2>
      <span class="detail-category">{{ categoryName }}</span>
    </div>

    <!-- 메타: 거리/도보/평점 -->
    <div class="detail-meta">
      <div class="meta">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M6 1c1.306 0 2.559.52 3.48 1.441A4.49 4.49 0 0 1 10.922 5.922C10.922 8.266 6 11 6 11S1.078 8.266 1.078 5.922c0-1.306.52-2.559 1.441-3.48A4.49 4.49 0 0 1 6 1Z"
            stroke="#737373"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="6" cy="6" r="1.5" fill="#737373" />
        </svg>
        <span
          ><b>{{ store.distance }}</b
          >m · 도보 {{ store.walkTime }}분</span
        >
      </div>

      <div class="meta rating">
        <svg
          width="14"
          height="14"
          viewBox="0 0 12 12"
          fill="currentColor"
          class="star"
          aria-hidden="true"
        >
          <path
            d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.44L6 8.885 2.91 10.51 3.5 7.07 1 4.635l3.455-.505L6 1Z"
          />
        </svg>
        <span>
          <b>{{ displayRating }}</b>
          <small>({{ store.reviewCount ?? 0 }})</small>
        </span>
      </div>
    </div>

    <!-- 이미지 그리드 -->
    <div class="detail-images">
      <img class="img-main" :src="store.images?.[0] || '/images/default-store.jpg'" alt="" />
      <div class="img-col">
        <img :src="getDetailImage(1)" alt="" />
        <img :src="getDetailImage(2)" alt="" />
      </div>
    </div>

    <!-- (옵션) 쿠폰 배지 -->
    <div v-if="store.hasDiscount" class="detail-discount">🎫 할인 쿠폰 사용 가능</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  store: { type: Object, required: true },
})
defineEmits(['open'])

const categoryName = computed(() => {
  const map = { restaurant: '음식점', cafe: '카페', retail: '소매점', store: '매장' }
  return map[props.store?.type] || '매장'
})
const displayRating = computed(() => {
  const r = props.store?.rating ?? 0
  return Number.isFinite(r) && r.toFixed ? r.toFixed(1) : r || '0.0'
})

// business_id에 따라 detail 이미지 경로 생성
const getDetailImage = (imageNumber) => {
  const businessId = props.store?.id
  if (!businessId) return '/images/default-store.jpg'
  
  // business_id_숫자.jpg 형태로 이미지 경로 생성
  return `/src/assets/images/thumbnail/${businessId}_${imageNumber}.jpg`
}
</script>

<style scoped>
.detail-card {
  padding: 14px 6px 16px;
  cursor: pointer;
}
.detail-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 2px 2px 8px;
}
.detail-name {
  margin: 0;
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  color: #0a0a0a;
}
.detail-category {
  font-size: 13px;
  color: #6b7280;
}
.detail-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin: 0 2px 12px;
}
.meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #737373;
  font-size: 13px;
}
.meta b {
  font-weight: 700;
  color: #111827;
}
.meta.rating {
  color: #111827;
}
.meta.rating .star {
  color: var(--primary-color, #017f58);
}
.meta small {
  font-size: 12px;
  color: #6b7280;
}
.detail-images {
  display: flex;
  gap: 15px;
}
.detail-images .img-main {
  width: 62%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 16px;
  background: #f3f4f6;
}
.detail-images .img-col {
  width: 38%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-images .img-col img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 16px;
  background: #f3f4f6;
}
.detail-discount {
  margin-top: 10px;
  color: var(--primary-color, #017f58);
  font-size: 13px;
  font-weight: 600;
}
</style>
