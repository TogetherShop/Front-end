<template>
  <div class="business-coupon-analysis-page">
    <div class="container">
      <!-- 헤더 -->
      <div class="header">
        <button class="back-btn" @click="goBack">
          <i class="material-symbols-outlined">arrow_back_ios</i>
        </button>
      </div>

      <!-- 쿠폰 정보 -->
      <div class="coupon-info">
        <div class="coupon-title-section">
          <h2 class="coupon-title">{{ couponDetail.title }}</h2>
          <span
            class="status-badge"
            :class="{ 'status-badge--expired': couponDetail.status !== 'active' }"
          >
            {{ couponDetail.status === 'active' ? '활성' : '만료' }}
          </span>
        </div>
        <div class="coupon-meta">
          <span class="meta-item">{{ couponDetail.description }}</span>
        </div>
        <div class="coupon-stats">
          <div class="stat-item">
            <i class="material-symbols-outlined">file_download</i>
            <span
              >{{ couponDetail.totalQuantity - couponDetail.currentQuantity }}/{{
                couponDetail.totalQuantity
              }}
              사용</span
            >
          </div>
          <div class="stat-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>
              {{
                couponDetail.status === 'expired'
                  ? '만료됨'
                  : couponDetail.remainingDays + '일 남음'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">분석 데이터를 불러오는 중...</p>
      </div>

      <!-- 차트 컨테이너 -->
      <div v-else class="charts-wrapper">
        <!-- 일별 쿠폰 사용량 -->
        <div class="chart-card">
          <h3 class="chart-title">일별 쿠폰 사용량 (30일)</h3>
          <div class="chart-container">
            <v-chart :option="dailyOption" autoresize />
          </div>
        </div>

        <!-- 쿠폰 누적 다운로드/사용량 -->
        <div class="chart-card">
          <h3 class="chart-title">쿠폰 누적 다운로드/사용량 (30일)</h3>
          <div class="chart-container">
            <v-chart :option="cumulativeOption" autoresize />
          </div>
        </div>

        <!-- 하단 네비게이션 -->
        <BusinessBottomNav />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BusinessBottomNav from '@/components/BusinessBottomNav.vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { getCouponAnalysis } from '@/api/business-coupon'

echarts.use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

// Mock 데이터
const MOCK = {
  business: {
    business_id: 1,
    business_name: '피자마루',
    business_category: '음식점',
    together_index: 85.5,
  },
}

export default {
  name: 'BusinessCouponAnalysis',
  components: { VChart, BusinessBottomNav },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)

    const business = reactive({ ...MOCK.business })
    const couponDetail = reactive({
      id: null,
      templateId: null,
      title: '',
      description: '',
      maxParticipants: 0,
      progress: 0,
      remainingDays: 0,
      status: '',
      businessName: '',
      discountValue: 0,
      timeAgo: '',
      chatActive: false,
      currentQuantity: 0,
      totalQuantity: 0,
      termsAndConditions: '',
    })

    const dailyData = reactive({ dates: [], use: [], issued: [], used: [] })
    const performanceData = reactive({
      coupon_issued_count: 0,
      coupon_used_count: 0,
      coupon_usage_rate: 0,
      total_revenue: 0,
    })

    const totalIssued = computed(() => performanceData.coupon_issued_count)
    const totalUsed = computed(() => performanceData.coupon_used_count)
    const conversionRate = computed(() =>
      totalIssued.value > 0 ? ((totalUsed.value / totalIssued.value) * 100).toFixed(1) : 0,
    )

    const goBack = () => router.back()

    const dailyOption = computed(() => ({
      color: ['#4caf50'],
      grid: { left: '5%', right: '5%', bottom: '15%', top: '5%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 12 },
        formatter: (params) => `${params[0].axisValueLabel}: ${params[0].data}회 사용`,
      },
      xAxis: {
        type: 'category',
        data: dailyData.dates,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#ccc',
          interval: (i) => i === 0 || i === dailyData.dates.length - 1,
          fontFamily: 'Pretendard, sans-serif',
        },
      },

      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: [
        {
          name: '일별 사용',
          type: 'line',
          data: dailyData.use,
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: '#4caf50' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(76,175,80,0.4)' },
              { offset: 1, color: 'rgba(76,175,80,0)' },
            ]),
          },
          symbol: 'none',
        },
      ],
    }))

    const cumulativeOption = computed(() => ({
      color: ['#9ccc65', '#017f58'],
      grid: { left: '5%', right: '5%', bottom: '15%', top: '5%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
      },
      legend: { data: ['다운로드(누적)', '사용(누적)'], bottom: 0 },
      xAxis: {
        type: 'category',
        data: dailyData.dates,
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#ccc',
          interval: (i) => i === 0 || i === dailyData.dates.length - 1,
          fontFamily: 'Pretendard, sans-serif',
        },
      },

      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: [
        {
          name: '다운로드(누적)',
          type: 'line',
          data: dailyData.issued,
          smooth: true,
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(156,204,101,0.4)' },
              { offset: 1, color: 'rgba(156,204,101,0)' },
            ]),
          },
          symbol: 'none',
        },
        {
          name: '사용(누적)',
          type: 'line',
          data: dailyData.used,
          smooth: true,
          lineStyle: { width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(1,127,88,0.4)' },
              { offset: 1, color: 'rgba(1,127,88,0)' },
            ]),
          },
          symbol: 'none',
        },
      ],
    }))

    const loadData = async () => {
      loading.value = true
      try {
        const templateId = route.params.templateId || 1
        const result = await getCouponAnalysis(templateId)
        if (result?.couponDetail) {
          Object.assign(couponDetail, result.couponDetail)
          couponDetail.remainingDays = result.couponDetail.remainingDays ?? 0
          couponDetail.progress = result.couponDetail.progress ?? 0
          couponDetail.status = result.couponDetail.status ?? 'inactive'
          couponDetail.businessName = result.couponDetail.businessName ?? ''

          dailyData.dates =
            result.dailyUsage?.map((d) => {
              const date = new Date(d.date)
              return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
            }) ?? []
          dailyData.use = result.dailyUsage?.map((d) => d.count) ?? []
          dailyData.issued = result.dailyCumulative?.map((d) => d.issued) ?? []
          dailyData.used = result.dailyCumulative?.map((d) => d.used) ?? []

          performanceData.coupon_issued_count = result.totalIssued
          performanceData.coupon_used_count = result.totalUsed
          performanceData.coupon_usage_rate = result.usageRate
          performanceData.total_revenue = result.totalRevenue
        }
      } catch (err) {
        console.warn('쿠폰 분석 API 호출 실패 → mock 유지', err?.message)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadData)

    return {
      loading,
      dailyOption,
      cumulativeOption,
      goBack,
      business,
      couponDetail,
      performanceData,
      totalIssued,
      totalUsed,
      conversionRate,
    }
  },
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.business-coupon-analysis-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  min-height: 100vh;
  font-family: 'Pretendard', sans-serif;
}
.container {
  max-width: 430px;
  margin: 0 auto;
  background-color: #fff;
  position: relative;
  min-height: 100vh;
  padding-bottom: 70px;
}
.header {
  padding: 16px;
  background: #fff;
}
.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.back-btn:active {
  transform: scale(0.95);
}
.coupon-info {
  background: #fff;
  padding: 0 20px 20px;
  margin-bottom: 12px;
}
.coupon-title-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.coupon-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0;
}
.status-badge {
  padding: 3px 8px;
  background: #dcfce7;
  color: #016630;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #b9f8cf;
}
.status-badge--expired {
  background: #f8f8f8;
  color: #3a3a3a;
  border: 1px solid #cecece;
}
.coupon-meta {
  margin-bottom: 12px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 13px;
}
.coupon-stats {
  display: flex;
  gap: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}
.stat-item .material-symbols-outlined {
  font-size: 16px;
  color: #4caf50;
}
.charts-wrapper {
  padding: 0 16px;
}
.chart-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px 24px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #b9f8cf;
}
.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 24px 0;
}
.chart-container {
  height: 220px;
  margin: 0 -8px;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid transparent;
  border-radius: 50%;
  background: linear-gradient(135deg, #81c784 0%, #4caf50 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0);
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-text {
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}
</style>
