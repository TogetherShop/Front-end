<template>
  <div class="position-relative min-vh-100">
    <div class="container d-flex flex-column bg-white min-vh-100 shadow mx-auto app-wrapper p-0">
      <BusinessTopBar />

      <div class="container-fluid px-4 py-4">
        <div v-if="isLoading" class="loading-wrapper" role="status" aria-live="polite">
          <div class="spinner" aria-label="로딩 중"></div>
          <p class="loading-text">데이터 불러오는 중...</p>
        </div>

        <template v-else>
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
        </template>
      </div>

      <BusinessBottomNavigation />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import BusinessTopBar from '@/components/BusinessTopBar.vue'
import BusinessBottomNavigation from '@/components/BusinessBottomNav.vue'
import { fetchHomeSummary, fetchProfileSummary } from '@/api/business'

export default {
  name: 'Home',
  components: { BusinessTopBar, BusinessBottomNavigation },
  setup() {
    const businessName = ref('')
    const togetherScore = ref(0)
    const rankPercent = ref(15)
    const partners = ref([])
    const loadingPartners = ref(false)
    const loadingHeader = ref(false)

    const pillClassMap = {
      활성: 'pill--active',
      협의중: 'pill--pending',
      종료: 'pill--inactive',
    }

    const loadProfileHeader = async () => {
      try {
        loadingHeader.value = true
        const res = await fetchProfileSummary()
        businessName.value = res?.businessName ?? ''
        const ts = res?.togetherScore
        togetherScore.value = typeof ts === 'number' ? Math.round(ts) : Math.round(Number(ts) || 0)
        if (typeof res?.rankPercent === 'number') {
          rankPercent.value = res.rankPercent
        }
      } catch (e) {
        businessName.value = ''
      } finally {
        loadingHeader.value = false
      }
    }

    const loadPartners = async () => {
      try {
        loadingPartners.value = true
        const res = await fetchHomeSummary()
        const list = Array.isArray(res?.partners) ? res.partners : []
        partners.value = list.map((p) => ({
          ...p,
          pillClass: pillClassMap[p.statusLabel] || '',
        }))
      } catch (e) {
        partners.value = []
      } finally {
        loadingPartners.value = false
      }
    }

    const load = async () => {
      await Promise.allSettled([loadProfileHeader(), loadPartners()])
    }

    const isLoading = computed(() => loadingHeader.value || loadingPartners.value)

    onMounted(load)
    return {
      businessName,
      togetherScore,
      rankPercent,
      partners,
      loadingPartners,
      isLoading,
    }
  },
}
</script>

<style src="@/styles/business-home-page.css"></style>
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
