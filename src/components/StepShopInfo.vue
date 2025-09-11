<template>
  <div class="element">
    <div class="div">
      <!-- 헤더 -->
      <AuthHeader
        :title="'매장 회원가입'"
        :subtitle="`단계 ${currentStep}/4`"
        backMode="emit"
        @back="goBack"
      />

      <div class="scrollable-content">
        <!-- 프로그레스바 -->
        <div class="background-wrapper">
          <div class="background-2">
            <div class="background-3" />
          </div>
        </div>

        <!-- 아이콘 -->
        <div class="SVG-wrapper">
          <i class="SVG-icon fa-solid fa-user-shield"></i>
        </div>

        <!-- 타이틀 섹션 -->
        <div class="title-section">
          <div class="heading-2">가게 정보 입력</div>
          <p class="text-wrapper-7">사업자 인증을 위한 기본 정보를 입력해주세요</p>
        </div>

        <!-- 폼 섹션 -->
        <div class="form-section">
          <!-- 상호명 -->
          <div class="form-group">
            <p class="p">
              <span class="span">상호명 </span>
              <span class="text-wrapper-5">*</span>
            </p>
            <input
              class="input"
              type="text"
              placeholder="사업자등록증에 기재된 상호명을 입력하세요"
              v-model="businessName"
            />
          </div>

          <!-- 사업자등록번호 -->
          <div class="form-group">
            <p class="label">
              <span class="span">사업자등록번호 </span>
              <span class="text-wrapper-5">*</span>
            </p>
            <div class="input-with-button">
              <input
                class="input"
                type="text"
                placeholder="000-00-00000"
                v-model="businessRegistrationNumber"
              />
              <button class="div-wrapper">
                <div class="text-wrapper-3">인증</div>
              </button>
            </div>
            <div class="text-wrapper-2">사업자등록번호는 자동으로 검증됩니다</div>
          </div>
        </div>

        <!-- 안내 박스 -->
        <div class="view-2">
          <div class="SVG">
            <i class="vector fa-solid fa-shield"></i>
          </div>
          <p class="heading">신뢰할 수 있는 인증 시스템</p>
          <p class="API">
            공공 API를 통한 사업자등록 및 실명확인으로 안전한 거래 환경을 제공합니다
          </p>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AuthHeader from './AuthHeader.vue'

const props = defineProps(['businessName', 'businessRegistrationNumber'])
const emit = defineEmits(['next', 'prev'])

const businessName = ref(props.businessName || '')
const businessRegistrationNumber = ref(props.businessRegistrationNumber || '')

const allRequiredChecked = computed(() => {
  return businessRegistrationNumber.value !== '' && businessName.value.trim() !== ''
})

const nextStep = () => {
  if (allRequiredChecked.value) {
    emit('next', {
      businessName: businessName.value,
      businessRegistrationNumber: businessRegistrationNumber.value,
    })
  }
}

const currentStep = ref(2)

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
  font-family: 'Pretendard', Helvetica, sans-serif;
  overflow: hidden;
}
/* 스크롤 가능한 메인 컨텐츠 */
.element .scrollable-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.element .scrollable-content::-webkit-scrollbar {
  display: none;
  width: 0;
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
  width: 171px;
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

.container-wrapper {
  border: 1px solid;
  border-color: #d0d5db;
  border-radius: 8px;
  height: 50px;
  overflow: hidden;
  width: 100%;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input {
  border: 1px solid;
  border-color: #d0d5db;
  border-radius: 8px;
  height: 50px;
  overflow: hidden;
  width: 100%;
  padding: 0 16px;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 16px;
  box-sizing: border-box;
}
.div-wrapper {
  all: unset;
  background-color: #017f58;
  border-radius: 8px;
  box-shadow: 0px 1px 2px #0000000d;
  box-sizing: border-box;
  height: 50px;
  width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-wrapper-3 {
  color: #ffffff;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}

.text-wrapper-2 {
  color: #697282;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  white-space: nowrap;
}

/* 안내 박스 */
.view-2 {
  background-color: #eef5fe;
  border-radius: 8px;
  height: 88px;
  width: 100%;
  position: relative;
  margin-top: 16px;
}

.SVG {
  height: 20px;
  width: 16px;
  position: absolute;
  top: 18px;
  left: 16px;
}

.vector {
  height: 13px;
  width: 11px;
  position: absolute;
  top: 3px;
  left: 3px;
  color: #155dfc;
}

.heading {
  color: #1b388e;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 14px;
  font-weight: 500;
  height: 20px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  top: 15px;
  left: 44px;
  white-space: nowrap;
  width: 148px;
}

.API {
  color: #1347e5;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  height: 30px;
  letter-spacing: 0;
  line-height: 16px;
  position: absolute;
  top: 40px;
  left: 44px;
  width: 282px;
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
