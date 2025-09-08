<template>
  <div class="position-relative min-vh-100">
    <div class="container d-flex flex-column bg-white min-vh-100 shadow mx-auto app-wrapper p-0">
      <BusinessTopBar />

      <div class="container-fluid px-3 py-3">
        <!-- 함께지수 카드 -->
        <section class="mb-3">
          <div class="score-card">
            <div class="score-card__top">
              <div class="score-card__title">함께지수</div>
              <div class="score-card__rank">
                <div class="rank-label">상위</div>
                <div class="rank-value">15%</div>
              </div>
            </div>
            <div class="score-card__bottom">
              <div class="score">48</div>
              <div class="score-max">/ 100</div>
            </div>
          </div>
        </section>

        <!-- 오늘의 현황 (슬라이드/캐러셀) -->
        <section class="section">
          <h2 class="section__title">오늘의 현황</h2>
          <div class="metrics-slider">
            <article class="metric-card" v-for="(m, i) in metrics" :key="i">
              <div class="metric-card__top">
                <div class="metric-icon" :style="{ color: m.iconColor }">
                  <i class="material-symbols-outlined">{{ m.icon }}</i>
                </div>
                <div class="metric-diff" :class="m.diffClass">{{ m.diff }}</div>
              </div>
              <div class="metric-value">{{ m.value }}</div>
              <div class="metric-label">{{ m.label }}</div>
            </article>
          </div>
        </section>

        <!-- 제휴 리스트 -->
        <section class="section">
          <div class="section__header">
            <h2 class="section__title">진행 중인 제휴</h2>
            <button class="see-all">전체보기 <span class="chev">›</span></button>
          </div>
          <div class="partners">
            <article class="partner-card" v-for="(p, i) in partners" :key="i">
              <div class="avatar" aria-hidden="true"></div>
              <div class="partner-main">
                <div class="partner-head">
                  <div class="partner-name">{{ p.name }}</div>
                  <span class="pill" :class="p.pillClass">{{ p.status }}</span>
                </div>
                <div class="partner-desc">{{ p.detail }}</div>
              </div>
              <button class="icon-btn" aria-label="대화">
                <i class="material-symbols-outlined chat-icon">chat_bubble</i>
              </button>
            </article>
          </div>
        </section>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'

export default {
  name: 'Home',
  components: {
    BusinessTopBar,
    BusinessBottomNavigation,
  },
  setup() {
    const metrics = ref([
      {
        icon: 'featured_seasonal_and_gifts',
        value: '87',
        label: '쿠폰 사용',
        diff: '+12%',
        diffClass: 'diff--up',
        iconColor: '#0b8a4b',
      },
      {
        icon: 'group',
        value: '156',
        label: '신규 고객',
        diff: '+8%',
        diffClass: 'diff--up-blue',
        iconColor: '#2563eb',
      },
      {
        icon: 'moving',
        value: '94.2%',
        label: '쿠폰 사용률',
        diff: '-2%',
        diffClass: 'diff--down',
        iconColor: '#0b8a4b',
      },
      {
        icon: 'handshake',
        value: '12',
        label: '활성 제휴',
        diff: '+3',
        diffClass: 'diff--up-purple',
        iconColor: '#7c3aed',
      },
    ])

    const partners = ref([
      {
        name: '피자마루',
        status: '활성',
        pillClass: 'pill--active',
        detail: '피자 15% 할인 ↔ 음료 10% 할인',
      },
      {
        name: '베이커리 달콤',
        status: '협의중',
        pillClass: 'pill--pending',
        detail: '빵 10% 할인 ↔ 음료 15% 할인',
      },
    ])

    return { metrics, partners }
  },
}
</script>

<style>
/* 전역 변수 */
:root {
  --emerald-700: #047857;
  --text-strong: #111827;
  --text-muted: #6b7280;
  --card-bg: #f8f8f8;
  --border: #e5e7eb;
}
</style>

<style scoped>
.app-wrapper {
  max-width: 430px;
}

/* Score card */
.score-card {
  background: var(--emerald-700);
  color: #fff;
  border-radius: 12px;
  padding: 18px;
}
.score-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.score-card__title {
  opacity: 0.95;
}
.score-card__rank {
  text-align: right;
}
.rank-label {
  font-size: 13px;
  opacity: 0.9;
}
.rank-value {
  font-size: 24px;
  font-weight: 500;
  line-height: 1.1;
}
.score-card__bottom {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.score {
  font-size: 40px;
  font-weight: 600;
  line-height: 1;
}
.score-max {
  opacity: 0.9;
}

/* Section */
.section {
  margin-top: 22px;
}
.section__title {
  font-size: 18px;
  color: var(--text-strong);
  margin-bottom: 10px;
}
.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.see-all {
  background: none;
  border: none;
  color: #4b5563;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.chev {
  font-size: 18px;
  line-height: 1;
}

/* 오늘의 현황 슬라이더 */
.metrics-slider {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.metrics-slider::-webkit-scrollbar {
  display: none;
}

/* 정사각형 메트릭 카드 */
.metric-card {
  flex: 0 0 auto;
  width: 120px;
  height: 120px;
  scroll-snap-align: start;

  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
}
.metric-card__top {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.metric-icon {
  display: inline-flex;
  line-height: 1;
}
.metric-icon .material-symbols-outlined {
  font-size: 20px;
}
.metric-diff {
  font-size: 12px;
  font-weight: 700;
}
.metric-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}
.metric-label {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
}

.diff--up {
  color: #00693b;
}
.diff--up-blue {
  color: #155dfc;
}
.diff--up-purple {
  color: #9810fa;
}
.diff--down {
  color: #e7000b;
}

/* Partners */
.partners {
  display: grid;
  gap: 12px;
}
.partner-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  flex: 0 0 auto;
}
.partner-main {
  flex: 1 1 auto;
  min-width: 0;
}
.partner-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.partner-name {
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.partner-desc {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-muted);
}
.pill {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
}
.pill--active {
  background: #065f46;
  color: #fff;
}
.pill--pending {
  background: #ffedd5;
  color: #c2410c;
}

/* 채팅 아이콘 버튼 */
.icon-btn {
  border: none;
  outline: none;
  background: transparent;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 8px;
}
.chat-icon {
  font-size: 16px;
  line-height: 1;
  color: #6b7280;
}
</style>
