<template>
  <div
    class="segmented"
    role="tablist"
    :style="{ '--count': tabs.length, '--index': currentIndex }"
    @keydown="onKeydown"
  >
    <!-- 활성 슬라이더(Pill) -->
    <div class="slider" aria-hidden="true"></div>

    <!-- 탭 버튼들 -->
    <button
      v-for="(t, i) in tabs"
      :key="t.value"
      class="seg"
      role="tab"
      type="button"
      :class="{ active: modelValue === t.value }"
      :aria-selected="modelValue === t.value"
      @click="select(t.value)"
      :ref="(el) => (btnRefs[i] = el)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  /* v-model */
  modelValue: { type: String, default: '' },
  /* { label, value } 배열 */
  tabs: {
    type: Array,
    default: () => [
      { label: '매장정보', value: 'info' },
      { label: '제휴가게', value: 'partner' },
    ],
  },
})
const emit = defineEmits(['update:modelValue'])

const currentIndex = computed(() =>
  Math.max(
    0,
    props.tabs.findIndex((t) => t.value === props.modelValue),
  ),
)
const select = (v) => emit('update:modelValue', v)

/* 키보드 좌우 이동 지원 */
const btnRefs = ref([])
const onKeydown = async (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
  e.preventDefault()
  const count = props.tabs.length
  let next =
    e.key === 'ArrowRight'
      ? (currentIndex.value + 1) % count
      : (currentIndex.value - 1 + count) % count
  select(props.tabs[next].value)
  await nextTick()
  const el = btnRefs.value[next]
  el && el.focus()
}

onMounted(() => {
  // 초기값이 없으면 첫 탭으로
  if (!props.modelValue && props.tabs.length) {
    emit('update:modelValue', props.tabs[0].value)
  }
})
</script>

<style scoped>
.segmented {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%; /* ⬅ 폭 고정 */
  height: 36px; /* ⬅ 높이 고정 */
  box-sizing: border-box; /* ⬅ 패딩 포함 */
  border-radius: 8px;
  background: #f1f1f1;
  padding: 3px;
  isolation: isolate;
}

/* 하얀 활성 pill */
.slider {
  position: absolute;
  top: 3px;
  left: calc(3px + ((100% - 6px) / var(--count)) * var(--index)); /* ← index 기반 위치 */
  height: calc(100% - 6px);
  width: calc((100% - 6px) / var(--count));
  border-radius: 6px;
  background: #fff;
  box-shadow:
    0px 1px 2px -1px #0000001a,
    0px 1px 3px #0000001a;
  border: 1px solid #e5e7eb;
  transition: left 180ms ease;
  pointer-events: none;
  z-index: 0;
}

.seg {
  flex: 1 1 0;
  height: 100%; /* ⬅ 버튼도 컨테이너 높이에 맞춤 */
  border: 0;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280; /* 비활성 색 */
  transition:
    color 180ms ease,
    font-weight 180ms ease;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
}

.seg.active,
.seg[aria-selected='true'] {
  font-weight: 700;
  color: #111111; /* 활성 시 검정 */
}

.seg:focus-visible {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}
</style>
