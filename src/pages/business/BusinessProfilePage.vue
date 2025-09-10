<template>
  <div class="page">
    <div class="app app--card">
      <BusinessTopBar />

      <div class="content">
        <!-- 프로필 카드 -->
        <section class="card">
          <div class="card__body card__body--has-actions">
            <div class="card__actions card__actions--stack">
              <button class="actionlink actionlink--logout">
                <span class="material-symbols-outlined icon-16">logout</span> 로그아웃
              </button>
              <button class="actionlink">
                <span class="material-symbols-outlined icon-16">edit</span> 수정
              </button>
            </div>

            <div class="profile profile--has-actions">
              <div class="avatar">
                <img v-if="profile.imageUrl" :src="profile.imageUrl" alt="profile" />
                <div v-else class="avatar__fallback">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </div>

              <div class="profile__main">
                <div class="profile__row">
                  <h6 class="profile__name">{{ profile.storeName }}</h6>
                  <span class="badge badge--success">
                    <span class="material-symbols-outlined icon-16">military_tech</span>
                    상위 {{ profile.rankPercent }}%
                  </span>
                </div>
                <div class="profile__meta">
                  {{ profile.category }}&nbsp;&nbsp;{{ profile.address }}
                </div>
              </div>
            </div>

            <div class="divider divider--tight"></div>

            <div class="kpis">
              <div class="kpi">
                <div class="kpi__value kpi__value--primary">{{ profile.togetherScore }}</div>
                <div class="kpi__label">함께 지수</div>
              </div>
              <div class="kpi__vr"></div>
              <div class="kpi">
                <div class="kpi__value">{{ profile.accumulatedDonations }}</div>
                <div class="kpi__label">누적 제휴</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 성과 대시보드 -->
        <section class="section">
          <h6 class="section__title">성과 대시보드</h6>
          <div class="grid grid--2">
            <div class="metric">
              <div class="metric__icon metric__icon--up">
                <span class="material-symbols-outlined">trending_up</span>
              </div>
              <div class="metric__body">
                <div class="metric__value">₩{{ numberWithCommas(metrics.monthSalesIncrease) }}</div>
                <div class="metric__label">이번 달 매출 증가</div>
              </div>
            </div>

            <div class="metric">
              <div class="metric__icon">
                <span class="material-symbols-outlined">group_add</span>
              </div>
              <div class="metric__body">
                <div class="metric__value">{{ metrics.newCustomersThisMonth }}</div>
                <div class="metric__label">이번 달 신규 고객</div>
              </div>
            </div>

            <div class="metric">
              <div class="metric__icon metric__icon--coupon">
                <span class="material-symbols-outlined">card_giftcard</span>
              </div>
              <div class="metric__body">
                <div class="metric__value">{{ metrics.couponsUsedToday }}</div>
                <div class="metric__label">오늘 쿠폰 사용</div>
              </div>
            </div>

            <div class="metric">
              <div class="metric__icon metric__icon--grade">
                <span class="material-symbols-outlined">grade</span>
              </div>
              <div class="metric__body">
                <div class="metric__value">{{ metrics.csat }}</div>
                <div class="metric__label">고객 만족도</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 제휴 요청 -->
        <section class="section">
          <div class="section__head">
            <h6 class="section__title">제휴 요청함</h6>
            <button class="link">
              전체 보기 <span class="material-symbols-outlined icon-16">chevron_right</span>
            </button>
          </div>

          <div class="card">
            <div class="listhead">내가 보낸 요청</div>

            <div v-for="(req, idx) in sentRequests" :key="'s-' + idx" class="request">
              <div class="request__left">
                <div class="avatar avatar--sm">
                  <div class="avatar__fallback"></div>
                </div>
                <div>
                  <div class="request__name">{{ req.partner }}</div>
                  <div class="muted small">{{ req.daysAgo }}일 전</div>
                </div>
              </div>
              <div class="request__right">
                <button v-if="req.status === 'accept'" class="chip chip--ok">수락</button>
                <button v-else-if="req.status === 'wait'" class="chip chip--wait">대기</button>
                <button class="iconbtn">
                  <i class="material-symbols-outlined chat-icon">chat_bubble</i>
                </button>
              </div>
            </div>

            <div class="divider--thin"></div>

            <div class="listhead list__tail">나에게 온 요청</div>
            <div v-for="(req, idx) in receivedRequests" :key="'r-' + idx" class="request">
              <div class="request__left">
                <div class="avatar avatar--sm">
                  <div class="avatar__fallback"></div>
                </div>
                <div>
                  <div class="request__name">{{ req.partner }}</div>
                  <div class="muted small">{{ req.daysAgo }}일 전</div>
                </div>
              </div>
              <div class="request__right">
                <button v-if="req.status === 'reject'" class="chip chip--danger">거절</button>
                <button v-else-if="req.status === 'wait'" class="chip chip--wait">대기</button>
                <button class="iconbtn">
                  <i class="material-symbols-outlined chat-icon">chat_bubble</i>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 공동구매 관리 -->
        <section class="section section--bottom">
          <div class="section__head">
            <h6 class="section__title">공동 구매 관리</h6>
            <button class="link">
              전체 보기 <span class="material-symbols-outlined icon-16">chevron_right</span>
            </button>
          </div>

          <div class="card">
            <div class="listhead">공구 신청 내역</div>

            <div v-for="(item, idx) in groupApply" :key="'ga-' + idx" class="group">
              <div class="group__left">
                <div class="group__title">{{ item.title }}</div>
                <div class="group__meta">
                  <span class="meta">
                    <span class="material-symbols-outlined icon-16">person</span>
                    {{ item.joined }}/{{ item.target }}명 ({{ percent(item) }}%)
                  </span>
                  <span class="meta">
                    <span class="material-symbols-outlined icon-16">event</span>
                    D-{{ item.dday }}
                  </span>
                </div>
              </div>
              <span class="status" :class="statusClass(item.status)">
                {{ statusLabel(item.status) }}
              </span>
            </div>

            <hr class="divider--thin" />

            <div class="listhead list__tail">공구 등록 내역</div>
            <div v-for="(item, idx) in groupOwned" :key="'go-' + idx" class="group">
              <div class="group__left">
                <div class="group__title">{{ item.title }}</div>
                <div class="group__meta">
                  <span class="meta">
                    <span class="material-symbols-outlined icon-16">person</span>
                    {{ item.joined }}/{{ item.target }}명 ({{ percent(item) }}%)
                  </span>
                  <span class="meta">
                    <span class="material-symbols-outlined icon-16">event</span>
                    D-{{ item.dday }}
                  </span>
                </div>
              </div>
              <span class="status" :class="statusClass(item.status)">
                {{ statusLabel(item.status) }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'

export default {
  name: 'BusinessProfilePage',
  components: { BusinessTopBar, BusinessBottomNavigation },
  data() {
    return {
      profile: {
        imageUrl: '',
        storeName: '수상 공인',
        rankPercent: 10,
        category: '카페',
        address: '강남구 삼성동',
        togetherScore: 45,
        accumulatedDonations: 7,
      },
      metrics: {
        monthSalesIncrease: 131000,
        newCustomersThisMonth: 45,
        couponsUsedToday: 20,
        csat: 4.7,
      },
      sentRequests: [
        { partner: '베이커리 달콤', daysAgo: 1, status: 'accept' },
        { partner: '베이커리 상콤', daysAgo: 3, status: 'wait' },
      ],
      receivedRequests: [
        { partner: '헤어샵', daysAgo: 1, status: 'reject' },
        { partner: '네네 치킨', daysAgo: 3, status: 'wait' },
      ],
      groupApply: [
        { title: '포장재 1000개 공동구매', joined: 6, target: 10, dday: 3, status: 'recruit' },
        { title: '포장재 1000개 공동구매', joined: 6, target: 10, dday: 0, status: 'fail' },
      ],
      groupOwned: [
        { title: '포장재 1000개 공동구매', joined: 6, target: 10, dday: 0, status: 'pending' },
        { title: '포장재 1000개 공동구매', joined: 10, target: 10, dday: 0, status: 'success' },
      ],
    }
  },
  methods: {
    numberWithCommas(x) {
      return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    percent(item) {
      return Math.round((item.joined / item.target) * 100)
    },
    statusClass(st) {
      return (
        {
          recruit: 'status--recruit',
          fail: 'status--fail',
          pending: 'status--pending',
          success: 'status--success',
        }[st] || ''
      )
    },
    statusLabel(st) {
      return { recruit: '모집중', fail: '실패', pending: '승인대기', success: '성공' }[st] || st
    },
  },
}
</script>

<style src="@/styles/business-profile-page.css" scoped></style>
