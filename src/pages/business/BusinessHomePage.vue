<template>
  <div class="position-relative min-vh-100">
    <div class="container d-flex flex-column bg-white min-vh-100 shadow mx-auto app-wrapper p-0">
      <BusinessTopBar />

      <div class="container-fluid px-3 py-3">
        <!-- 함께지수 카드 -->
        <section class="mb-3">
          <div class="score-card">
            <div class="score-card__top">
              <div>
                <div class="score-card__title">함께지수</div>
                <div style="opacity: 0.9; font-size: 13px; margin-top: 2px">
                  {{ businessName }}
                </div>
              </div>

              <div class="score-card__rank" v-if="rankPercent !== null">
                <div class="rank-label">상위</div>
                <div class="rank-value">{{ rankPercent }}%</div>
              </div>
            </div>

            <div class="score-card__bottom">
              <div class="score">{{ togetherScore }}</div>
              <div class="score-max">/ 100</div>
            </div>
          </div>
        </section>

        <!-- 제휴 리스트 -->
        <section class="section">
          <div class="section__header">
            <h2 class="section__title">진행 중인 제휴</h2>
            <button class="see-all">전체보기 <span class="chev">›</span></button>
          </div>

          <div class="partners">
            <article
              class="partner-card"
              v-for="p in partners"
              :key="(p.id ?? '') + (p.detail ?? '')"
            >
              <div class="avatar" aria-hidden="true"></div>
              <div class="partner-main">
                <div class="partner-head">
                  <div class="partner-name">{{ p.name }}</div>
                  <span class="pill" :class="p.pillClass">{{ p.statusLabel }}</span>
                </div>
                <div class="partner-desc">{{ p.detail }}</div>
              </div>
              <button class="icon-btn" aria-label="대화">
                <i class="material-symbols-outlined chat-icon">chat_bubble</i>
              </button>
            </article>

            <div
              v-if="!loadingPartners && partners.length === 0"
              class="muted"
              style="padding: 8px"
            >
              제휴 내역이 없습니다.
            </div>
          </div>
        </section>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'
import { fetchHomeSummary, fetchProfileSummary } from '@/api/business'

export default {
  name: 'Home',
  components: { BusinessTopBar, BusinessBottomNavigation },
  setup() {
    const businessName = ref('')
    const togetherScore = ref(0)
    const rankPercent = ref(15) // 응답에 있으면 덮어씀
    const partners = ref([])
    const loadingPartners = ref(false)

    const pillClassMap = {
      활성: 'pill--active',
      협의중: 'pill--pending',
      종료: 'pill--inactive',
    }

    const loadProfileHeader = async () => {
      // 프로필 페이지에서 잘 뜨는 데이터 그대로 재사용
      const res = await fetchProfileSummary()
      businessName.value = res?.businessName ?? ''
      const ts = res?.togetherScore
      togetherScore.value = typeof ts === 'number' ? Math.round(ts) : Math.round(Number(ts) || 0)
      if (typeof res?.rankPercent === 'number') {
        rankPercent.value = res.rankPercent
      }
    }

    const loadPartners = async () => {
      // 홈 전용(파트너 리스트) — 실패해도 화면 깨지지 않게 안전 처리
      try {
        loadingPartners.value = true
        const res = await fetchHomeSummary()
        const list = Array.isArray(res?.partners) ? res.partners : []
        partners.value = list.map((p) => ({
          ...p,
          pillClass: pillClassMap[p.statusLabel] || '',
        }))
      } catch (e) {
        console.error('[Home] partners fetch failed', e)
        partners.value = []
      } finally {
        loadingPartners.value = false
      }
    }

    const load = async () => {
      // 헤더 카드와 파트너 리스트를 병렬로 가져온다
      await Promise.allSettled([loadProfileHeader(), loadPartners()])
    }

    onMounted(load)
    return {
      businessName,
      togetherScore,
      rankPercent,
      partners,
      loadingPartners,
      pillClassMap,
    }
  },
}
</script>

<style src="@/styles/business-home-page.css"></style>
