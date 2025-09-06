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
        <i class="SVG-icon fa-regular fa-file-lines"></i>
      </div>

      <!-- 타이틀 섹션 -->
      <div class="title-section">
        <div class="heading-2">회원 정보 등록</div>
        <p class="text-wrapper-7">회원 가입을 위한 정보를 입력해주세요</p>
      </div>

      <!-- 폼 섹션 -->
      <div class="form-section">
        <!-- 아이디 입력 -->
        <div class="form-group">
          <p class="p">
            <span class="span">아이디 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <input
            class="container-wrapper"
            type="text"
            placeholder="아이디를 입력하세요"
            v-model="userId"
          />
        </div>

        <!-- 이메일 입력 -->
        <div class="form-group">
          <p class="label">
            <span class="span">이메일 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <input
            class="container-wrapper"
            type="email"
            placeholder="example@email.com"
            v-model="email"
          />
          <div v-if="emailError" class="text-wrapper-2">{{ emailError }}</div>
        </div>

        <!-- 비밀번호 입력 -->
        <div class="form-group">
          <p class="label">
            <span class="span">비밀번호 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <input
            class="container-wrapper"
            type="password"
            placeholder="8자 이상 입력하세요"
            v-model="password"
          />
          <div v-if="passwordError" class="text-wrapper-2">{{ passwordError }}</div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <p class="label">
            <span class="span">비밀번호 확인 </span>
            <span class="text-wrapper-5">*</span>
          </p>
          <input
            class="container-wrapper"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            v-model="confirmPassword"
          />
          <div v-if="password && confirmPassword && !passwordsMatch" class="text-wrapper-2">
            비밀번호가 일치하지 않습니다
          </div>
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
          <div class="text-wrapper">회원가입 완료</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSignupStore } from '@/stores/signup'

const signupStore = useSignupStore()

// 각 필드를 store.stepData와 바인딩
const userId = computed({
  get: () => signupStore.stepData.username,
  set: (val) => (signupStore.stepData.username = val),
})

const email = computed({
  get: () => signupStore.stepData.email,
  set: (val) => (signupStore.stepData.email = val),
})

const password = computed({
  get: () => signupStore.stepData.password,
  set: (val) => (signupStore.stepData.password = val),
})

const confirmPassword = computed({
  get: () => signupStore.stepData.confirmPassword,
  set: (val) => (signupStore.stepData.confirmPassword = val),
})

// 이메일/비밀번호 유효성 체크
const emailError = computed(() => {
  const val = signupStore.stepData.email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return val && !emailPattern.test(val) ? '올바른 이메일 형식이 아닙니다' : ''
})

const passwordError = computed(() => {
  const val = signupStore.stepData.password
  return val && val.length < 8 ? '비밀번호는 8자 이상 입력해야 합니다' : ''
})

const passwordsMatch = computed(
  () => signupStore.stepData.password === signupStore.stepData.confirmPassword,
)

// 버튼 활성화 조건
const allRequiredChecked = computed(() => {
  return (
    signupStore.stepData.username.trim() &&
    signupStore.stepData.email.trim() &&
    signupStore.stepData.password.length >= 8 &&
    signupStore.stepData.confirmPassword &&
    passwordsMatch.value &&
    !emailError.value
  )
})

const nextStep = async () => {
  if (allRequiredChecked.value) {
    await signupStore.submitSignup() // 회원가입 API 호출 + 로그인 페이지 이동
  }
}

const currentStep = computed(() => signupStore.currentStep + 1)

const goBack = () => signupStore.prevStep()
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
  width: 100%; /* 4단계이므로 100% */
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
  padding: 0 16px;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 16px;
  box-sizing: border-box;
}

.container-wrapper::placeholder {
  color: #9ca3af;
}

.text-wrapper-2 {
  color: #fa2b36;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  white-space: nowrap;
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
  cursor: pointer;
}

.button:disabled {
  cursor: not-allowed;
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
