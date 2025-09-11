<template>
  <div class="business-coupon-card">
    <!-- 활성 쿠폰 -->
    <div
      v-if="coupon.status === 'active'"
      class="business-coupon-card__container business-coupon-card__container--active"
    >
      <div class="business-coupon-card__header">
        <div class="business-coupon-card__info">
          <div class="business-coupon-card__title-wrapper">
            <h6 class="business-coupon-card__title">{{ coupon.title }}</h6>
            <span
              class="business-coupon-card__status-badge business-coupon-card__status-badge--active"
              >활성</span
            >
          </div>
          <p class="business-coupon-card__description">{{ coupon.description }}</p>
        </div>
        <span
          v-if="coupon.templateId"
          class="material-symbols-outlined business-coupon-card__chart-icon"
          @click="openAnalysis"
          title="쿠폰 분석 보기"
          style="cursor: pointer"
          >bar_chart</span
        >
      </div>

      <div class="business-coupon-card__stats">
        <div class="business-coupon-card__stat-item">
          <span class="material-symbols-outlined">file_download</span>
          <span>{{ usedQuantity }}/{{ coupon.totalQuantity || coupon.maxParticipants }} 사용</span>
        </div>
        <div class="business-coupon-card__stat-item">
          <span class="material-symbols-outlined">schedule</span>
          <span>{{ coupon.remainingDays }}일 남음</span>
        </div>
      </div>

      <div class="business-coupon-card__usage-section">
        <div class="business-coupon-card__usage-label">사용률</div>
        <div class="business-coupon-card__usage-bar-container">
          <div class="business-coupon-card__usage-bar">
            <div
              class="business-coupon-card__usage-progress"
              :style="{ width: coupon.progress + '%' }"
            ></div>
          </div>
          <span class="business-coupon-card__usage-percentage">{{ coupon.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 협의중 쿠폰 -->
    <div
      v-else-if="coupon.status === 'exchanging'"
      class="business-coupon-card__container business-coupon-card__container--exchanging"
    >
      <div class="business-coupon-card__header">
        <div class="business-coupon-card__info">
          <div class="business-coupon-card__title-wrapper">
            <h6 class="business-coupon-card__title">{{ coupon.title }}</h6>
            <span
              class="business-coupon-card__status-badge business-coupon-card__status-badge--exchanging"
              >협의중</span
            >
          </div>
          <div class="business-coupon-card__time">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ coupon.timeAgo }}</span>
          </div>
        </div>
      </div>

      <button class="business-coupon-card__chat-button" @click="handleChatContinue">
        <span class="material-symbols-outlined">chat</span>
        채팅 계속
      </button>
    </div>

    <!-- 만료된 쿠폰 -->
    <div v-else class="business-coupon-card__container business-coupon-card__container--expired">
      <div class="business-coupon-card__header">
        <div class="business-coupon-card__info">
          <div class="business-coupon-card__title-wrapper">
            <h6 class="business-coupon-card__title">{{ coupon.title }}</h6>
            <span
              class="business-coupon-card__status-badge business-coupon-card__status-badge--expired"
              >만료</span
            >
          </div>
          <p class="business-coupon-card__description">{{ coupon.description }}</p>
        </div>
        <span
          v-if="coupon.templateId"
          class="material-symbols-outlined business-coupon-card__chart-icon"
          @click="openAnalysis"
          title="쿠폰 분석 보기"
          style="cursor: pointer"
          >bar_chart</span
        >
      </div>

      <div class="business-coupon-card__stats">
        <div class="business-coupon-card__stat-item">
          <span class="material-symbols-outlined">file_download</span>
          <span>{{ usedQuantity }}/{{ coupon.totalQuantity || coupon.maxParticipants }} 사용</span>
        </div>
        <div class="business-coupon-card__stat-item">
          <span class="material-symbols-outlined">schedule</span>
          <span>{{ coupon.expiredText || '만료됨' }}</span>
        </div>
      </div>

      <div class="business-coupon-card__usage-section">
        <div class="business-coupon-card__usage-label">사용률</div>
        <div class="business-coupon-card__usage-bar-container">
          <div class="business-coupon-card__usage-bar">
            <div
              class="business-coupon-card__usage-progress"
              :style="{ width: coupon.progress + '%' }"
            ></div>
          </div>
          <span class="business-coupon-card__usage-percentage">{{ coupon.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- 디버그 정보 (개발용) -->
    <div
      v-if="showDebugInfo"
      class="debug-info"
      style="margin-top: 10px; font-size: 12px; color: #666"
    >
      <details>
        <summary>디버그 정보</summary>
        <pre>{{ JSON.stringify(coupon, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'BusinessCouponCard',
  props: {
    coupon: {
      type: Object,
      required: true,
    },
    showDebugInfo: {
      type: Boolean,
      default: false, // 개발 중에는 true로 설정해서 데이터 확인
    },
  },
  emits: ['chatContinue', 'openAnalysis'],
  setup(props, { emit }) {
    const router = useRouter()
    // 사용량 계산: totalQuantity - currentQuantity
    const usedQuantity = computed(() => {
      if (props.coupon.totalQuantity && props.coupon.currentQuantity !== undefined) {
        return props.coupon.totalQuantity - props.coupon.currentQuantity
      }
      // fallback: participants 필드가 있으면 사용
      return props.coupon.participants || 0
    })

    const handleChatContinue = () => {
      emit('chatContinue', props.coupon.id)
    }

    const openAnalysis = () => {
      if (!props.coupon.templateId) return

      router.push({
        name: 'BusinessCouponAnalysis',
        params: { templateId: props.coupon.templateId },
      })
    }

    return {
      usedQuantity,
      handleChatContinue,
      openAnalysis,
    }
  },
}
</script>

<style scoped>
@import '../styles/business-coupon.css';

.debug-info {
  border: 1px dashed #ccc;
  padding: 8px;
  border-radius: 4px;
  background: #f9f9f9;
}

.debug-info details {
  margin: 0;
}

.debug-info pre {
  margin: 8px 0 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 11px;
}
</style>
