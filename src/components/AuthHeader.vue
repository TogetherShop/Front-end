<!-- AppHeader.vue -->
<template>
  <div class="header">
    <!-- 뒤로가기 -->
    <div class="back-icon" @click="handleBack">
      <i class="fa-regular fa-less-than"></i>
    </div>

    <!-- 가운데 영역 -->
    <div class="header-center">
      <div class="title">{{ title }}</div>
      <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backMode: { type: String, default: 'router' },
  // 'router' → router.back()
  // 'emit'   → 부모로 이벤트 발생
})

const emit = defineEmits(['back'])
const router = useRouter()

const handleBack = () => {
  if (props.backMode === 'emit') {
    emit('back')
  } else {
    router.back()
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  padding: 10px;
  height: fit-content;
}

.back-icon {
  font-size: 20px;
  transform: scaleX(0.5);
  margin-left: 20px;
  position: absolute;
  left: 0;
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
  white-space: nowrap;
  margin-top: 2px; /* 한 줄일 경우 기본 */
}

.subtitle {
  color: #697282;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
  margin-top: 2px;
}
</style>
