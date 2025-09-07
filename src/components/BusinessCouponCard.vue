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
          <span>{{ coupon.participants }}/{{ coupon.maxParticipants }} 사용</span>
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
          <span>{{ coupon.participants }}/{{ coupon.maxParticipants }} 사용</span>
        </div>
        <div class="business-coupon-card__stat-item">
          <span class="material-symbols-outlined">schedule</span>
          <span>{{ coupon.expiredText }}</span>
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
  </div>
</template>

<script>
export default {
  name: 'BusinessCouponCard',
  props: {
    coupon: {
      type: Object,
      required: true,
    },
  },
  emits: ['chatContinue', 'openAnalysis'],
  setup(props, { emit }) {
    const handleChatContinue = () => {
      emit('chatContinue', props.coupon.id)
    }
    const openAnalysis = () => {
      // 가능한 여러 키를 고려: template_id / templateId / id
      emit('openAnalysis', props.coupon)
    }

    return {
      handleChatContinue,
      openAnalysis,
    }
  },
}
</script>

<style scoped>
@import '../styles/business-coupon.css';
</style>
