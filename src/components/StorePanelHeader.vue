<!-- /src/components/StorePanelHeader.vue -->
<template>
  <div class="panel-header" :class="{ 'is-detail': !!selected }" @click="onHeaderClick">
    <div class="panel-handle"></div>

    <!-- 제목은 '목록 모드'에서만 표시 -->
    <h3 v-if="!selected" class="panel-title">내 주변 매장</h3>
    <!-- <h3 v-else>{{ selected.name }}</h3> -->

    <!-- 확장 토글: 목록 모드에서만 -->
    <button
      v-if="!selected"
      class="expand-button"
      aria-label="toggle bottom panel"
      :aria-pressed="panelExpanded"
      @click.stop="$emit('toggle')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          :d="panelExpanded ? 'M6 9l6 6 6-6' : 'M18 15L12 9 6 15'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- 닫기(X): 상세 모드에서만 -->
    <button
      v-if="selected"
      class="expand-button"
      aria-label="close detail"
      @click.stop="$emit('close')"
    >
      ✕
    </button>
  </div>
</template>

<script setup>
defineProps({
  selected: { type: Object, default: () => null },
  panelExpanded: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'close', 'header-click'])
const onHeaderClick = () => emit('header-click')
</script>

<style scoped>
.panel-header {
  position: relative;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.panel-header.is-detail {
  justify-content: flex-end;
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
</style>
