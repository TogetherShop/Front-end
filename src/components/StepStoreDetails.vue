<template>
  <div class="element">
    <div class="div">
      <!-- 헤더 -->
      <div class="header">
        <div class="back-icon" @click="goBack">
          <i class="fa-regular fa-less-than"></i>
        </div>
        <div class="header-center">
          <div class="heading-3">매장 회원가입</div>
          <div class="text-wrapper-8">단계 {{ currentStep }}/4</div>
        </div>
      </div>

      <!-- 프로그레스바 -->
      <div class="background-wrapper">
        <div class="background-2">
          <div class="background-3" />
        </div>
      </div>

      <!-- 아이콘 -->
      <div class="SVG-wrapper">
        <i class="SVG-icon fa-solid fa-users"></i>
      </div>

      <!-- 타이틀 섹션 -->
      <div class="title-section">
        <div class="heading-2">내 가게 정보</div>
        <p class="text-wrapper-7">맞춤형 제휴 추천을 위한 정보를 입력해주세요</p>
      </div>

      <!-- 폼 섹션 -->
      <div class="form-section">
        <!-- 협업 희망 업종 -->
        <class class="form-group">
          <p class="p">
            <span class="span">협업 희망 업종 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <SelectBox
            v-model="businessType"
            :options="['음식점', '카페', '편의점', '기타']"
            placeholder="협업하고 싶은 업종을 선택하세요"
          />
        </class>

        <!-- 주요 고객층 -->
        <div class="form-group">
          <p class="label">
            <span class="span">주요 고객층 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <SelectBox
            v-model="collaborationCategory"
            :options="['10대', '20대', '30대', '기타']"
            placeholder="주요 고객층을 선택하세요"
          />
        </div>

        <!-- 업종 -->
        <div class="form-group">
          <p class="label">
            <span class="span">업종 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <SelectBox
            v-model="businessCategory"
            :options="['서비스', '제조', '판매', '기타']"
            placeholder="업종을 선택하세요"
          />
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="view">
        <button
          class="button"
          :disabled="!allRequiredChecked"
          :style="{
            backgroundColor: allRequiredChecked ? '#017F58' : '#b0b1b3',
            opacity: allRequiredChecked ? 1 : 0.5,
          }"
          @click="nextStep"
        >
          <div class="text-wrapper">다음 단계</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SelectBox from './SelectBox.vue'

const props = defineProps(['businessType', 'businessCategory', 'collaborationCategory'])
const emit = defineEmits(['next', 'prev'])

const businessType = ref(props.businessType || '')
const businessCategory = ref(props.businessCategory || '')
const collaborationCategory = ref(props.collaborationCategory || '')

const allRequiredChecked = computed(() => {
  return (
    businessType.value !== '' && businessCategory.value !== '' && collaborationCategory.value !== ''
  )
})

const nextStep = () => {
  if (allRequiredChecked.value) {
    emit('next', {
      businessType: businessType.value,
      businessCategory: businessCategory.value,
      collaborationCategory: collaborationCategory.value,
    })
  }
}

const currentStep = ref(3)

const goBack = () => {
  emit('prev')
}
</script>

<style scoped>
.element {
  align-items: start;
  background-color: #ffffff;
  display: grid;
  justify-items: center;
  width: 100vw;
}

.element .div {
  width: 390px;
  min-height: 844px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 16px 24px;
  box-sizing: border-box;
  gap: 16px;
  font-family: 'Pretendard', Helvetica, sans-serif;
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  width: 100%;
}

.back-icon {
  font-size: 20px;
  transform: scaleX(0.5);
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heading-3 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  text-align: center;
  white-space: nowrap;
}

.text-wrapper-8 {
  color: #697282;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  text-align: center;
  white-space: nowrap;
  margin-top: 4px;
}

/* 프로그레스바 */
.background-wrapper {
  background-color: #ffffff;
  width: 100%;
}

.background-2 {
  background-color: #e5e7eb;
  border-radius: 16777200px;
  height: 8px;
  width: 100%;
}

.background-3 {
  background-color: #017f58;
  border-radius: 16777200px;
  height: 8px;
  width: 75%; /* 3단계이므로 75% */
}

/* 아이콘 */
.SVG-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #d0fae5;
  height: 64px;
  width: 64px;
  align-self: center;
  margin-top: 32px;
}

.SVG-icon {
  font-size: 26px;
  color: #017f58;
}

/* 타이틀 섹션 */
.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.heading-2 {
  color: #101727;
  font-family: 'Pretendard-Bold', Helvetica;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 28px;
  text-align: center;
  white-space: nowrap;
}

.text-wrapper-7 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}

/* 폼 섹션 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.p,
.label {
  color: transparent;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
}

.span {
  color: #354152;
}

.text-wrapper-5 {
  color: #fa2b36;
}

/* 하단 버튼 */
.view {
  background-color: #ffffff;
  width: 100%;
  margin-top: auto;
  padding-top: 24px;
}

.button {
  all: unset;
  background-color: var(--);
  border-radius: 8px;
  box-shadow: 0px 1px 2px #0000000d;
  box-sizing: border-box;
  height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button:disabled {
  cursor: not-allowed;
}

.button:not(:disabled) {
  cursor: pointer;
}

.text-wrapper {
  color: #ffffff;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}
</style>
