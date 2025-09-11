<!-- /src/pages/CustomerHomePage.vue -->
<template>
  <div class="store-search-page">
    <!-- 상단바 고정 -->
    <CustomerTopBar class="topbar" />

    <!-- 지도가 상단바 높이만큼 아래로 시작 -->
    <div class="map-section">
      <StoreMap
        v-if="!locationError"
        :stores="filteredStores"
        :selected-store="selectedStore"
        :center="mapCenter"
        v-model:searchQuery="searchQuery"
        v-model:panelExpanded="bottomExpanded"
        @select-store="handleSelectStore"
        @map-ready="handleMapReady"
        @viewport-change="handleViewportChange"
      />
      <div v-else class="error-section">
        <p>위치 정보를 가져올 수 없습니다</p>
        <p class="error-detail">{{ locationError }}</p>
        <button @click="retryLoad" class="retry-button">다시 시도</button>
      </div>
    </div>

    <CustomerBottomNavigation />
    <ReviewModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import CustomerBottomNavigation from '@/components/CustomerBottomNavigation.vue'
import StoreMap from '@/components/StoreMap.vue'
import ReviewModal from '@/components/ReviewModal.vue'
import { useLocationStore } from '@/stores/location'
import { useStoresStore } from '@/stores/stores'

const locationStore = useLocationStore()
const storesStore = useStoresStore()
const { currentLocation, locationError } = storeToRefs(locationStore)
const { filteredStores } = storeToRefs(storesStore)

const searchQuery = ref('')
const selectedStore = ref(null)
const mapReady = ref(false)
const bottomExpanded = ref(false)

const mapCenter = computed(() => {
  if (currentLocation.value?.latitude) {
    return { lat: currentLocation.value.latitude, lng: currentLocation.value.longitude }
  }
  return { lat: 37.5173, lng: 127.0473 }
})

watch(searchQuery, (v) => {
  // 실시간 검색 반영
  storesStore.setSearchQuery(v)
})

const handleSelectStore = (store) => {
  selectedStore.value = store
  bottomExpanded.value = true
}
const handleMapReady = () => {
  mapReady.value = true
}

const handleViewportChange = async ({ center /*, level, bounds */ }) => {
  // 선택된 가게 상세는 닫고 목록 모드로
  selectedStore.value = null
  bottomExpanded.value = true
  // 현재 내 위치가 아니라 '지도 중심' 기준으로 새로 불러오기
  await storesStore.fetchNearbyStores(center.lat, center.lng)
  // 검색어 필터는 기존과 동일하게 storesStore 내부/filteredStores에서 반영됨
}

const loadNearbyStores = async () => {
  if (currentLocation.value?.latitude) {
    await storesStore.fetchNearbyStores(
      currentLocation.value.latitude,
      currentLocation.value.longitude,
    )
  }
}

const retryLoad = async () => {
  await locationStore.getCurrentLocation()
  await loadNearbyStores()
}

onMounted(async () => {
  await locationStore.getCurrentLocation()
  await loadNearbyStores()
})

watch(
  () => currentLocation.value,
  async (n, o) => {
    if (n?.latitude && (!o?.latitude || n.latitude !== o.latitude || n.longitude !== o.longitude)) {
      await loadNearbyStores()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.store-search-page {
  font-family: 'Pretendard', sans-serif;
  --topbar-h: 56px;
  display: flex;
  flex-direction: column;
  height: 100vh; /* ← 고정 높이 */
  overflow: hidden; /* ← 스크롤 차단 */
  background: #fff;
  /* padding-bottom: 0; ← 여백 제거(이게 페이지 스크롤 원인) */
  padding-bottom: var(--bottom-nav-height, 64px);
}

/* 고정 상단바 */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: #fff;
}

/* 지도는 상단바 아래부터 시작 */
.map-section {
  height: calc(100vh - var(--topbar-h));
  margin-top: var(--topbar-h);
  position: relative;
  background: #f5f5f5;
}

.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  gap: 16px;
  color: #ef4444;
}
.retry-button {
  padding: 8px 16px;
  background: #017f58;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
