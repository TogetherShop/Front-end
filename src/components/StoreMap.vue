StoreMap.vue]
<!-- /src/components/StoreMap.vue -->
<template>
  <div class="store-map">
    <div class="map-container">
      <div v-if="isLoading" class="map-loading">
        <div class="loading-spinner"></div>
        <p>지도 로딩 중...</p>
      </div>
      <div v-else-if="initFailed" class="map-error">
        <p>지도를 불러오지 못했어요.</p>
        <p class="error-detail">{{ initErrorMsg }}</p>
        <button class="retry-button" @click="initializeMap">다시 시도</button>
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
    <div
      v-if="props.showPanel"
      class="nearby-stores-panel"
      :class="panelClass"
      :style="panelStyle"
      ref="panelRef"
    >
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
          <StoreDetailCard :store="selected" @open="openStoreDetail" />
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
import { useRouter } from 'vue-router'
import markerIconUrl from '@/assets/images/togethershop_cursor.png'
import StoreCard from '@/components/StoreCard.vue'
import StorePanelHeader from '@/components/StorePanelHeader.vue'
import StoreDetailCard from '@/components/StoreDetailCard.vue'
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useLocationStore } from '@/stores/location'
import { waitKakaoReady } from '@/utils/waitKakaoReady'

/* props / emits */
const props = defineProps({
  stores: { type: Array, default: () => [] }, // 부모에서 이미 필터된 목록을 받음
  selectedStore: { type: Object, default: null },
  center: { type: Object, default: () => ({ lat: 37.5173, lng: 127.0473 }) },
  searchQuery: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
  panelExpanded: { type: Boolean, default: false },
  showPanel: { type: Boolean, default: true }, // ⬅ 패널 숨기기 옵션
})
const emit = defineEmits([
  'selectStore',
  'mapReady',
  'update:searchQuery',
  'update:panelExpanded',
  'viewport-change',
])
/* 상태 */
const router = useRouter()
const isLoading = ref(true)
const map = ref(null)
const mapElRef = ref(null)
const markers = ref([])
const currentLocationMarker = ref(null)
const infoWindow = ref(null)
const panelRef = ref(null)
const initFailed = ref(false)
const initErrorMsg = ref('')

// ✅ 초기 1회만 화면 맞춤
const didInitialFit = ref(false)
// ✅ 첫 사용자 상호작용 전까지만 현재위치 마커 노출
const showCurrentLocationMarker = ref(true)
const userHasInteracted = ref(false)

// 초기 1회: 현재 위치 + 모든 매장을 화면에 보이도록
const fitOnceToAllMarkers = async () => {
  if (!map.value || didInitialFit.value) return
  await nextTick()
  const bounds = new kakao.maps.LatLngBounds()
  let added = 0

  const loc = locationStore.currentLocation
  if (loc?.latitude && loc?.longitude) {
    bounds.extend(new kakao.maps.LatLng(loc.latitude, loc.longitude))
    added++
  }
  ;(props.stores || []).forEach((s) => {
    if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) {
      bounds.extend(new kakao.maps.LatLng(s.lat, s.lng))
      added++
    }
  })
  if (added > 0) {
    // 패널/검색창 여백 감안하고 싶으면 padding 조절 가능
    map.value.setBounds(bounds /*, 32*/)
    didInitialFit.value = true
  }
}

// 사용자 상호작용(드래그/줌) → 부모에 뷰포트 전달
const emitViewportChange = () => {
  if (!map.value) return
  const c = map.value.getCenter()
  const b = map.value.getBounds()
  emit('viewport-change', {
    center: { lat: c.getLat(), lng: c.getLng() },
    level: map.value.getLevel(),
    bounds: {
      sw: { lat: b.getSouthWest().getLat(), lng: b.getSouthWest().getLng() },
      ne: { lat: b.getNorthEast().getLat(), lng: b.getNorthEast().getLng() },
    },
  })
}

// 드래그/줌 핸들러
const onUserViewportChange = () => {
  if (!userHasInteracted.value) return
  if (showCurrentLocationMarker.value && currentLocationMarker.value) {
    currentLocationMarker.value.setMap(null)
    showCurrentLocationMarker.value = false
  }
  emitViewportChange()
}

/* 패널 상태: selected 유무 + panelExpanded 불린만 사용 */
const selected = computed(() => props.selectedStore)
const panelClass = computed(() => ({
  'is-expanded': !selected.value && props.panelExpanded,
  'is-detail': !!selected.value,
}))
const panelStyle = computed(() => ({})) // 변수 계산 없이 심플하게

const openStoreDetail = (store) => {
  if (!store?.id) return
  router.push({ name: 'store-detail', params: { id: String(store.id) } })
}

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
  if (!showCurrentLocationMarker.value) return

  currentLocationMarker.value = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(loc.latitude, loc.longitude),
    // 이미지 지정 안 하면 카카오맵의 기본 마커가 사용됩니다.
    zIndex: 9999, // 가게 마커보다 위로
    clickable: false, // 현재 위치 마커는 클릭 불가(원하면 true로)
  })

  // currentLocationMarker.value = new kakao.maps.Marker({
  //   position: new kakao.maps.LatLng(loc.latitude, loc.longitude),
  //   image: new kakao.maps.MarkerImage(
  //     'data:image/svg+xml;base64,' +
  //       btoa(
  //         `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  //          <circle cx="10" cy="10" r="8" fill="#007AFF" stroke="white" stroke-width="2"/>
  //          <circle cx="10" cy="10" r="3" fill="white"/>
  //        </svg>`,
  //       ),
  //     new kakao.maps.Size(20, 20),
  //     { offset: new kakao.maps.Point(10, 10) },
  //   ),
  // })

  currentLocationMarker.value.setMap(map.value)
}

/* 지도 초기화 (불필요 리스너 제거, 심플) */
const initializeMap = async () => {
  if (map.value) return
  isLoading.value = true
  initFailed.value = false
  initErrorMsg.value = ''

  try {
    await waitKakaoReady()
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
    await fitOnceToAllMarkers()
    kakao.maps.event.addListener(map.value, 'dragstart', () => {
      userHasInteracted.value = true
    })
    kakao.maps.event.addListener(map.value, 'dragend', onUserViewportChange)
    kakao.maps.event.addListener(map.value, 'zoom_changed', onUserViewportChange)

    emit('mapReady', map.value)
  } catch (e) {
    console.error('지도 초기화 실패:', e)
    initFailed.value = true
    initErrorMsg.value = e?.message || '지도를 불러오지 못했습니다'
  } finally {
    isLoading.value = false
  }
}

const handleSelectFromList = (store) => {
  emit('selectStore', store)
  emit('update:panelExpanded', true)
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
// 패널 상태가 바뀌면 보이는 영역 중앙으로 재정렬
const relayoutOnly = async () => {
  if (!map.value) return
  map.value.relayout?.()
}

watch(
  () => props.panelExpanded,
  async () => {
    await nextTick()
    await relayoutOnly()
  },
)

// 2) 패널 애니메이션 종료 후 보정
onMounted(() => {
  panelRef.value?.addEventListener('transitionend', relayoutOnly, { passive: true })
  mapElRef.value?.addEventListener('pointerdown', () => (userHasInteracted.value = true), {
    once: true,
  })
})
onBeforeUnmount(() => {
  panelRef.value?.removeEventListener('transitionend', relayoutOnly)
})

watch(
  () => props.stores,

  () => {
    createStoreMarkers()
    fitOnceToAllMarkers()
  },
  { deep: true },
)

/* 현재 위치가 바뀌면 마커 갱신 & 화면 살짝 위로 올리기 */
watch(
  () => locationStore.currentLocation,
  (n) => {
    if (!n?.latitude || !n?.longitude || !map.value) return
    createCurrentLocationMarker()
    fitOnceToAllMarkers()
  },
  { deep: true },
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
  background: transparent;
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
  --collapsedHeight: 60px;
  --expandedHeight: 54vh;
  --detailHeight: 50vh;
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
  padding: 15px 20px;
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
.map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  text-align: center;
}
.map-error .error-detail {
  font-size: 12px;
  color: #888;
}
.retry-button {
  padding: 8px 16px;
  background: #017f58;
  color: #fff;
  border: 0;
  border-radius: 6px;
}
</style>
