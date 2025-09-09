<!-- /src/components/StoreMap.vue -->
<template>
  <div class="store-map">
    <div class="map-container">
      <div v-if="isLoading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>지도 로딩 중...</p>
      </div>
      <div id="kakao-map" class="kakao-map" ref="mapElRef"></div>
    </div>

    <!-- 검색창 (부모가 v-model:searchQuery로 연동) -->
    <div class="map-overlay" v-if="showSearch">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" />
        </svg>
        <input
          type="text"
          :value="localSearch"
          @input="onInput"
          placeholder="매장명 검색"
          class="search-input"
        />
      </div>
    </div>

    <!-- 바텀시트 -->
    <div class="nearby-stores-panel" :class="panelClass" :style="panelStyle">
      <!-- ⬇ 헤더 분리 -->
      <StorePanelHeader
        :selected="selected"
        :panel-expanded="panelExpanded"
        @toggle="togglePanel"
        @close="closeDetail"
        @header-click="onHeaderClick"
      />
      <div class="panel-content">
        <!-- ⬇ 디테일 카드 분리 -->
        <template v-if="selected">
          <StoreDetailCard :store="selected" />
        </template>

        <!-- 리스트 -->
        <template v-else>
          <template v-if="panelStores.length">
            <StoreCard
              v-for="store in panelStores"
              :key="store.id"
              :store="store"
              @click="handleSelectFromList(store)"
            />
          </template>
          <div v-else class="empty-state">주변에 매장이 없습니다.</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import markerIconUrl from '@/assets/images/togethershop_cursor.png'
import StoreCard from '@/components/StoreCard.vue'
import StorePanelHeader from '@/components/StorePanelHeader.vue'
import StoreDetailCard from '@/components/StoreDetailCard.vue'
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useLocationStore } from '@/stores/location'

/* props / emits */
const props = defineProps({
  stores: { type: Array, default: () => [] }, // 부모에서 이미 필터된 목록을 받음
  selectedStore: { type: Object, default: null },
  center: { type: Object, default: () => ({ lat: 37.5173, lng: 127.0473 }) },
  searchQuery: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
  panelExpanded: { type: Boolean, default: false },
})
const emit = defineEmits(['selectStore', 'mapReady', 'update:searchQuery', 'update:panelExpanded'])

/* 상태 */
const isLoading = ref(true)
const map = ref(null)
const mapElRef = ref(null)
const markers = ref([])
const currentLocationMarker = ref(null)
const infoWindow = ref(null)

/* 패널 상태: selected 유무 + panelExpanded 불린만 사용 */
const selected = computed(() => props.selectedStore)
const panelClass = computed(() => ({
  'is-expanded': !selected.value && props.panelExpanded,
  'is-detail': !!selected.value,
}))
const panelStyle = computed(() => ({})) // 변수 계산 없이 심플하게

/* 검색 입력 → 부모에 위임 */
const localSearch = ref(props.searchQuery)
watch(
  () => props.searchQuery,
  (v) => (localSearch.value = v),
)
const onInput = (e) => emit('update:searchQuery', e.target.value)

/* 리스트: 단순히 거리순 상위 50개 (부모가 이미 필터함) */
const panelStores = computed(() =>
  (props.stores || [])
    .slice()
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 50),
)

// // 카테고리 한글명 매핑
// const getCategoryName = (type) => {
//   const map = {
//     restaurant: '음식점',
//     cafe: '카페',
//     retail: '소매점',
//     store: '매장',
//   }
//   return map[type] || '매장'
// }

/* 지도 로딩 대기 */
const waitForKakaoMaps = () =>
  new Promise((resolve, reject) => {
    if (typeof kakao !== 'undefined' && kakao.maps) return resolve()
    let tries = 0
    const timer = setInterval(() => {
      tries++
      if (typeof kakao !== 'undefined' && kakao.maps) {
        clearInterval(timer)
        resolve()
      } else if (tries > 50) {
        clearInterval(timer)
        reject(new Error('카카오맵 API 로드 실패'))
      }
    }, 100)
  })

/* 마커 생성/정리 */
const clearMarkers = () => {
  markers.value.forEach((m) => m.setMap(null))
  markers.value = []
}

const createStoreMarkers = () => {
  if (!map.value) return
  clearMarkers()
  ;(props.stores || []).forEach((store) => {
    if (!Number.isFinite(store.lat) || !Number.isFinite(store.lng)) return
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(store.lat, store.lng),
      image: new kakao.maps.MarkerImage(markerIconUrl, new kakao.maps.Size(48, 48), {
        offset: new kakao.maps.Point(24, 24),
      }),
      zIndex: 3,
    })
    kakao.maps.event.addListener(marker, 'click', () => {
      emit('selectStore', store)
      emit('update:panelExpanded', true)
      showStoreInfo(store, marker)
      centerSelectedOnMap(store)
    })
    marker.setMap(map.value)
    markers.value.push(marker)
  })
}

const showStoreInfo = (store, marker) => {
  if (!infoWindow.value) return
  infoWindow.value.setContent(`
    <div style="padding:10px;min-width:220px;">
      <div style="font-weight:700;margin-bottom:4px;">${store.name}</div>
      <div style="font-size:12px;color:#444;margin-bottom:6px;">${store.address ?? ''}</div>
      <div style="font-size:12px;color:#666;">${store.distance}m • 도보 ${store.walkTime}분</div>
      ${store.hasDiscount ? '<div style="color:#017F58;font-size:12px;margin-top:5px;">🎫 할인 쿠폰 사용 가능</div>' : ''}
    </div>
  `)
  infoWindow.value.open(map.value, marker)
}
const closeInfoWindow = () => infoWindow.value?.close()

/* 현재 위치 마커 */
const locationStore = useLocationStore()
const createCurrentLocationMarker = () => {
  const loc = locationStore.currentLocation
  if (!loc?.latitude || !loc?.longitude || !map.value) return
  if (currentLocationMarker.value) currentLocationMarker.value.setMap(null)
  currentLocationMarker.value = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(loc.latitude, loc.longitude),
    image: new kakao.maps.MarkerImage(
      'data:image/svg+xml;base64,' +
        btoa(
          `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
           <circle cx="10" cy="10" r="8" fill="#007AFF" stroke="white" stroke-width="2"/>
           <circle cx="10" cy="10" r="3" fill="white"/>
         </svg>`,
        ),
      new kakao.maps.Size(20, 20),
      { offset: new kakao.maps.Point(10, 10) },
    ),
  })
  currentLocationMarker.value.setMap(map.value)
}

/* 지도 초기화 (불필요 리스너 제거, 심플) */
const initializeMap = async () => {
  try {
    await waitForKakaoMaps()
    await nextTick()
    const el = mapElRef.value || document.getElementById('kakao-map')
    if (!el) throw new Error('지도 요소를 찾을 수 없습니다')

    map.value = new kakao.maps.Map(el, {
      center: new kakao.maps.LatLng(props.center.lat, props.center.lng),
      level: 3,
    })
    infoWindow.value = new kakao.maps.InfoWindow({ zIndex: 1 })

    kakao.maps.event.addListener(map.value, 'click', () => {
      emit('selectStore', null)
      closeInfoWindow()
    })

    createStoreMarkers()
    createCurrentLocationMarker()
    emit('mapReady', map.value)
  } catch (e) {
    console.error('지도 초기화 실패:', e)
  } finally {
    isLoading.value = false
  }
}

/* 선택 → 지도 중앙으로 살짝 올려 보이게 */
const centerSelectedOnMap = async (store) => {
  if (!map.value || !store?.lat || !store?.lng) return
  await nextTick()
  const ll = new kakao.maps.LatLng(store.lat, store.lng)
  map.value.setCenter(ll)
  // 디테일 모드일 때 아래 패널 만큼 위로 살짝 이동
  map.value.panBy(0, -Math.round(window.innerHeight * 0.25))
}

const handleSelectFromList = (store) => {
  emit('selectStore', store)
  emit('update:panelExpanded', true)
  centerSelectedOnMap(store)
}
const onHeaderClick = () => {
  // 상세 모드면 패널 토글하지 않음
  if (selected.value) return
  togglePanel()
}

const togglePanel = () => emit('update:panelExpanded', !props.panelExpanded)

const closeDetail = () => {
  emit('selectStore', null)
  emit('update:panelExpanded', true) // 목록 모드로 돌아갈 때는 펼쳐진 상태 유지
  closeInfoWindow()
}

/* watch (필요한 것만 유지) */
watch(
  () => props.stores,
  () => createStoreMarkers(),
  { deep: true },
)
watch(
  () => props.center,
  (c) => {
    if (map.value && c) map.value.setCenter(new kakao.maps.LatLng(c.lat, c.lng))
  },
)

onMounted(initializeMap)
</script>

<style scoped>
.store-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.kakao-map {
  width: 100%;
  height: 100%;
}

/* 로딩 */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #017f58;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 검색창 */
.map-overlay {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  width: min(720px, calc(100% - 24px));
  padding: 0 4px;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 0 14px;
  height: 44px;
}
.search-icon {
  margin-right: 10px;
  color: #6b7280;
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
}

/* 바텀시트 */
.nearby-stores-panel {
  --collapsedHeight: 170px;
  --expandedHeight: 65vh;
  --detailHeight: 60vh;
  --raise: var(--collapsedHeight);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 40;
  transform: translateY(calc(100% - var(--raise)));
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
  height: var(--collapsedHeight);
  overflow: hidden;
}
.nearby-stores-panel.is-expanded {
  --raise: var(--expandedHeight);
  height: var(--expandedHeight);
  overflow: visible;
}
.nearby-stores-panel.is-detail {
  --raise: var(--detailHeight);
  height: var(--detailHeight);
  overflow: hidden;
}

.panel-header {
  position: relative;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.panel-handle {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
}
.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
}

.panel-content {
  padding: 0 16px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.nearby-stores-panel.is-expanded .panel-content {
  padding: 0 16px 16px;
  overflow-y: auto;
}
.nearby-stores-panel.is-detail .panel-content {
  padding: 0 12px 12px;
  overflow: hidden;
}

/* 디테일 카드 */
.detail-card {
  padding: 8px 2px 12px;
}
.detail-images {
  display: flex;
  gap: 8px;
}
.detail-images .img-main {
  width: 58%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
}
.detail-images .img-col {
  width: 42%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-images .img-col img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
}
.detail-name {
  margin: 10px 2px 0;
  font-size: 20px;
  font-weight: 700;
}
.detail-category {
  margin: 2px 2px 6px;
  font-size: 14px;
  color: #666;
}
.detail-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin: 2px 2px 0;
}
.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #737373;
  font-size: 13px;
}
.meta.discount {
  color: #017f58;
}
.detail-address {
  margin: 2px 2px 6px;
  font-size: 13px;
  color: #555;
}
.empty-state {
  padding: 24px 8px;
  color: #6b7280;
  text-align: center;
}
</style>
