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
          <h2 class="coupon-title">{{ couponTemplate.template_name }}</h2>
          <span class="status-badge">{{ couponTemplate.is_active ? '활성' : '만료' }}</span>
        </div>
        <div class="coupon-meta">
          <span class="meta-item">{{ business.business_name }}에서 제공</span>
        </div>
        <div class="coupon-stats">
          <div class="stat-item">
            <i class="material-symbols-outlined">file_download</i>
            <span>{{ totalUsed }}/{{ totalIssued }} 사용</span>
          </div>
          <div class="stat-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ couponTemplate.valid_days }}일 남음</span>
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

// 반드시 renderer 등록
echarts.use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

export default {
  name: 'BusinessCouponAnalysis',
  components: { VChart, BusinessBottomNav },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(false)

    // 사업자 정보 (businesses 테이블)
    const business = reactive({
      business_id: 1,
      business_name: '피자마루',
      business_category: '음식점',
      together_index: 85.5,
    })

    // 쿠폰 템플릿 정보 (coupon_templates 테이블)
    const couponTemplate = reactive({
      template_id: 1,
      business_id: 1,
      template_name: '피자 15% 할인',
      discount_type: 'PERCENTAGE',
      discount_value: 15,
      valid_days: 30,
      max_issue_count: 1000,
      is_active: true,
    })

    // 30일간 일별 데이터 (coupons 테이블 기반)
    const dailyData = {
      dates: [
        '11-01',
        '11-02',
        '11-03',
        '11-04',
        '11-05',
        '11-06',
        '11-07',
        '11-08',
        '11-09',
        '11-10',
        '11-11',
        '11-12',
        '11-13',
        '11-14',
        '11-15',
        '11-16',
        '11-17',
        '11-18',
        '11-19',
        '11-20',
        '11-21',
        '11-22',
        '11-23',
        '11-24',
        '11-25',
        '11-26',
        '11-27',
        '11-28',
        '11-29',
        '11-30',
      ],
      // 일별 발급 수 (ISSUED status)
      issued: [
        3, 2, 4, 5, 3, 8, 6, 2, 3, 4, 3, 5, 7, 5, 3, 4, 2, 3, 4, 6, 8, 3, 2, 3, 4, 3, 5, 4, 3, 2,
      ],
      // 일별 사용 수 (USED status)
      used: [
        0, 1, 2, 2, 1, 4, 3, 1, 2, 2, 1, 3, 4, 3, 2, 2, 1, 2, 2, 3, 5, 2, 1, 2, 2, 2, 3, 2, 2, 1,
      ],
    }

    // 누적 계산
    const getCumulative = (arr) => {
      const cumulative = []
      let sum = 0
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i]
        cumulative.push(sum)
      }
      return cumulative
    }

    // 성과 리포트 데이터 (performance_reports 테이블 기반)
    const performanceData = reactive({
      coupon_issued_count: 124,
      coupon_used_count: 67,
      coupon_usage_rate: 54.03,
      new_customer_count: 45,
      returning_customer_count: 22,
      average_rating: 4.3,
      review_count: 28,
    })

    const totalIssued = computed(() => dailyData.issued.reduce((a, b) => a + b, 0))
    const totalUsed = computed(() => dailyData.used.reduce((a, b) => a + b, 0))
    const conversionRate = computed(() =>
      totalIssued.value > 0 ? ((totalUsed.value / totalIssued.value) * 100).toFixed(1) : 0,
    )
    const avgUsageTime = computed(() => '3.2') // 평균 사용 시간 (고정값)

    const goBack = () => router.back()

    const SERIES_COLORS = ['#9ccc65', '#017F58']

    const dailyOption = computed(() => ({
      color: [SERIES_COLORS[1]],
      grid: { left: '3%', right: '3%', bottom: '12%', top: '5%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 12 },
        formatter: (params) => {
          const p = params && params[0]
          if (!p) return ''
          return `${p.axisValueLabel}: ${p.data}회 사용`
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      xAxis: {
        type: 'category',
        data: dailyData.dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#f0f0f0', width: 2 } },
        axisTick: { show: false },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          interval: 4, // 5일마다 표시
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: true, lineStyle: { color: '#f8f8f8', type: 'dashed' } },
      },
      series: [
        {
          name: '일별 사용',
          type: 'line',
          data: dailyData.used,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3 },
          areaStyle: { origin: 'start', opacity: 0.06 },
        },
      ],
    }))

    const cumulativeOption = computed(() => ({
      color: SERIES_COLORS,
      grid: { left: '3%', right: '3%', bottom: '18%', top: '5%', containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: { color: '#333', fontSize: 12 },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      legend: {
        data: ['다운로드(누적)', '사용(누적)'],
        bottom: 0,
        textStyle: { color: '#666' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
      },
      xAxis: {
        type: 'category',
        data: dailyData.dates,
        axisLine: { lineStyle: { color: '#f0f0f0', width: 2 } },
        axisTick: { show: false },
        axisLabel: {
          color: '#666',
          fontSize: 11,
          interval: 4, // 5일마다 표시
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: true, lineStyle: { color: '#f8f8f8', type: 'dashed' } },
      },
      series: [
        {
          name: '다운로드(누적)',
          type: 'line',
          smooth: true,
          data: getCumulative(dailyData.issued),
          symbol: 'none',
          lineStyle: { width: 2 },
        },
        {
          name: '사용(누적)',
          type: 'line',
          smooth: true,
          data: getCumulative(dailyData.used),
          symbol: 'none',
          lineStyle: { width: 3 },
        },
      ],
    }))

    onMounted(() => {
      loading.value = true
      // 실제로는 API 호출로 데이터를 가져옴
      setTimeout(() => {
        loading.value = false
      }, 500)
    })

    return {
      loading,
      dailyOption,
      cumulativeOption,
      goBack,
      business,
      couponTemplate,
      performanceData,
      totalIssued,
      totalUsed,
      conversionRate,
      avgUsageTime,
    }
  },
}
</script>

<style scoped>
.business-coupon-analysis-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  min-height: 100vh;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
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
