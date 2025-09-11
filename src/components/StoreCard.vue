<template>
  <div class="store-card" @click="handleClick">
    <div class="store-image">
      <img
        :src="store.images?.[0] || '/images/default-store.jpg'"
        :alt="store.name"
        @error="handleImageError"
      />
    </div>

    <div class="store-info">
      <div class="store-header">
        <h3 class="store-name">{{ store.name }}</h3>
      </div>

      <div class="store-category">{{ getCategoryName(store.type) }}</div>
      <div class="store-address">{{ store.address || '주소 정보 없음' }}</div>

      <div class="store-meta">
        <div class="distance-info">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1C7.30622 1 8.55859 1.51953 9.48047 2.44141C10.4023 3.36328 10.9219 4.61565 10.9219 5.92188C10.9219 8.26562 6 11 6 11S1.07812 8.26562 1.07812 5.92188C1.07812 4.61565 1.59766 3.36328 2.51953 2.44141C3.44141 1.51953 4.69378 1 6 1Z"
              stroke="#737373"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="6" cy="6" r="1.5" fill="#737373" />
          </svg>
          <span>{{ store.distance }}m • 도보 {{ store.walkTime }}분</span>
        </div>

        <div class="rating-info">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
              fill="#737373"
            />
          </svg>
          <span>{{ store.rating }} ({{ store.reviewCount }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props 정의
const props = defineProps({
  store: {
    type: Object,
    required: true,
  },
})

// Emits 정의
const emit = defineEmits(['click', 'getCoupon'])

// 메서드들
const getCategoryName = (type) => {
  const categories = {
    restaurant: '음식점',
    cafe: '카페',
    retail: '소매점',
  }
  return categories[type] || '매장'
}

const handleImageError = (event) => {
  event.target.src = '/images/default-store.jpg'
}

const handleClick = () => {
  emit('click', props.store)
}
</script>

<style scoped>
.store-card {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 16px;
  /* 여백 넉넉하게 */
  padding: 12px;
  /* 카드 간 명확한 분리감 */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

/* 살짝 떠오르는 효과 */
.store-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 3px 14px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.06);
  border-color: #e5e7eb;
}

/* 이미지 더 큼직하고 둥근 사각형으로 */
.store-image {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 14px; /* 텍스트와 간격 */
  flex-shrink: 0;
}
.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 내용 패딩/간격 여유 있게 */
.store-info {
  flex: 1;
  padding: 4px 4px 4px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; /* 긴 글줄줄이 방지 */
}

.store-address {
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 긴 주소 말줄임 */
}

.store-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

/* 제목 살짝 키우고 두껍게 */
.store-name {
  color: #0a0a0a;
  font-family: 'Pretendard-Bold', Helvetica, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 26px;
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 카테고리는 은은하게 */
.store-category {
  color: #6b7280;
  font-family: 'Pretendard-Regular', Helvetica, sans-serif;
  font-size: 13px;
  line-height: 18px;
}

/* 메타 정보 간격 더 넓게 */
.store-meta {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 2px;
}
.distance-info,
.rating-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #737373;
  font-family: 'Geist-Regular', Helvetica, sans-serif;
  font-size: 12.5px;
  line-height: 18px;
}

/* (옵션) 쿠폰 버튼 유지 */
.coupon-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #171717;
  border: none;
  border-radius: 10px;
  color: #f9f9f9;
  height: 32px;
  padding: 0 10px;
  font-family: 'Noto Sans KR-Medium', Helvetica, sans-serif;
  font-size: 12px;
  transition:
    background-color 0.18s ease,
    transform 0.12s ease;
}
.coupon-button:hover {
  background: #2a2a2a;
}
.coupon-button:active {
  transform: scale(0.97);
}
</style>
