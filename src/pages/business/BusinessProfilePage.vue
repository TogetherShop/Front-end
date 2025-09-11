<template>
  <div class="page">
    <div class="app app--card">
      <BusinessTopBar />

      <div class="content">
        <!-- 로딩 스피너 -->
        <div v-if="loadingProfile" class="loading-wrapper" role="status" aria-live="polite">
          <div class="spinner" aria-label="로딩 중"></div>
          <p class="loading-text">데이터 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="profileError" class="loading-wrapper">
          <p class="loading-text">{{ profileError }}</p>
          <button class="actionlink" @click="loadProfile">
            <span class="material-symbols-outlined icon-16">refresh</span> 다시 시도
          </button>
        </div>

        <!-- 실제 화면 -->
        <template v-else>
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
                  <div class="metric__value">
                    ₩{{ numberWithCommas(metrics.monthSalesIncrease) }}
                  </div>
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
                  <button v-else-if="req.status === 'reject'" class="chip chip--danger">
                    거절
                  </button>
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
                  <button v-if="req.status === 'accept'" class="chip chip--ok">수락</button>
                  <button v-else-if="req.status === 'reject'" class="chip chip--danger">
                    거절
                  </button>
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
        </template>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'
import { fetchProfileSummary } from '@/api/business'

export default {
  name: 'BusinessProfilePage',
  components: { BusinessTopBar, BusinessBottomNavigation },
  data() {
    return {
      profile: {
        imageUrl: '',
        storeName: '매장명',
        rankPercent: 0,
        category: '업종',
        address: '주소',
        togetherScore: 0,
        accumulatedDonations: 0,
      },
      metrics: {
        monthSalesIncrease: 131000,
        newCustomersThisMonth: 45,
        couponsUsedToday: 20,
        csat: 4.7,
      },
      sentRequests: [],
      receivedRequests: [],
      groupApply: [],
      groupOwned: [],
      loadingProfile: false,
      profileError: null,
    }
  },
  mounted() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        this.loadingProfile = true
        this.profileError = null

        const data = await fetchProfileSummary()

        // 프로필
        const name = data?.businessName ?? this.profile.storeName
        const category = data?.businessCategory ?? this.profile.category
        const address = data?.address ?? this.profile.address
        const together = data?.togetherScore ?? this.profile.togetherScore

        this.profile = {
          ...this.profile,
          storeName: name,
          category,
          address,
          imageUrl: data?.profileImageUrl ?? this.profile.imageUrl,
          togetherScore:
            typeof together === 'number'
              ? Math.round(together)
              : Math.round(Number(together)) || this.profile.togetherScore,
          rankPercent: data?.rankPercent ?? this.profile.rankPercent,
          accumulatedDonations:
            typeof data?.accumulatedDonations === 'number'
              ? data.accumulatedDonations
              : this.profile.accumulatedDonations,
        }

        // 메트릭
        if (data?.metrics) {
          this.metrics = { ...this.metrics, ...data.metrics }
        }

        // 제휴 요청함
        if (Array.isArray(data?.sentRequests)) this.sentRequests = data.sentRequests
        if (Array.isArray(data?.receivedRequests)) this.receivedRequests = data.receivedRequests

        // 공동구매
        if (Array.isArray(data?.groupApply)) this.groupApply = data.groupApply
        if (Array.isArray(data?.groupOwned)) this.groupOwned = data.groupOwned
      } catch (e) {
        console.error('[Profile] load error', e)
        this.profileError = '프로필 정보를 불러오지 못했어요.'
      } finally {
        this.loadingProfile = false
      }
    },
    numberWithCommas(x) {
      return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    percent(item) {
      const joined = Number(item?.joined ?? 0)
      const target = Number(item?.target ?? 0)
      if (!target) return 0
      return Math.round((joined / target) * 100)
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

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #ddd;
  border-top-color: #017f58;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style src="@/styles/business-profile-page.css" scoped></style>
