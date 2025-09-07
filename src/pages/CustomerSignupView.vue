<template>
  <div class="screen">
    <div class="div">
      <AuthHeader title="고객 회원가입" />
      <!-- 스크롤 가능한 메인 컨텐츠 -->
      <div class="scrollable-content">
        <!-- 프로필 이미지 -->
        <div class="logo-section">
          <img class="logo" :src="logo" alt="togethershop logo" />
        </div>

        <!-- 타이틀 섹션 -->
        <div class="title-section">
          <div class="text-wrapper">함께가게 시작하기</div>
          <div class="text-wrapper-2">다양한 혜택과 할인을 받아보세요</div>
        </div>

        <!-- 폼 섹션 -->
        <div class="form-section">
          <!-- 이름 입력 -->
          <div class="form-group">
            <p class="label">
              <span class="span">이름 </span>
              <span class="text-wrapper-3">*</span>
            </p>
            <input
              class="input-wrapper"
              type="text"
              placeholder="실명을 입력하세요"
              v-model="name"
            />
          </div>

          <!-- 이름 입력 -->
          <div class="form-group">
            <p class="label">
              <span class="span">아이디 </span>
              <span class="text-wrapper-3">*</span>
            </p>
            <input
              class="input-wrapper"
              type="text"
              placeholder="아이디를 입력하세요"
              v-model="username"
            />
          </div>

          <!-- 이메일 입력 -->
          <div class="form-group">
            <p class="p">
              <span class="span">이메일 </span>
              <span class="text-wrapper-3">*</span>
            </p>
            <input
              class="input-wrapper"
              type="email"
              placeholder="example@email.com"
              v-model="email"
            />
            <p class="error-message" v-if="emailError">{{ emailError }}</p>
          </div>

          <!-- 비밀번호 입력 -->
          <div class="form-group">
            <p class="label-2">
              <span class="span">비밀번호 </span>
              <span class="text-wrapper-3">*</span>
            </p>
            <input
              class="input-wrapper"
              type="password"
              placeholder="8자 이상 입력하세요"
              v-model="password"
            />
            <p class="error-message" v-if="passwordError">{{ passwordError }}</p>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="form-group">
            <p class="label-3">
              <span class="span">비밀번호 확인 </span>
              <span class="text-wrapper-3">*</span>
            </p>
            <input
              class="input-wrapper"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              v-model="confirmPassword"
            />
            <p class="error-message" v-if="confirmPasswordError">{{ confirmPasswordError }}</p>
          </div>

          <!-- 생년월일 입력 -->
          <div class="form-group">
            <p class="label-4">
              <span class="span">생년월일 </span>
              <span class="text-wrapper-7">*</span>
            </p>
            <input class="input-wrapper" type="date" placeholder="생년월일 8자리" v-model="birth" />
          </div>

          <!-- 약관 동의 -->
          <!-- 약관 동의 -->
          <div class="background-border">
            <!-- 전체 동의 -->
            <div class="background-2">
              <input type="checkbox" v-model="allChecked" class="checkbox" @change="toggleAll" />
              <div class="label-5">전체 동의하기</div>
            </div>

            <div class="vertical-border">
              <div class="agreement-item">
                <input type="checkbox" v-model="agreements.age" class="checkbox" />
                <p class="label-6">
                  <span class="span">만 14세 이상입니다 </span>
                  <span class="text-wrapper-3">(필수)</span>
                </p>
              </div>

              <div class="agreement-item">
                <input type="checkbox" v-model="agreements.terms" class="checkbox" />
                <p class="label-7">
                  <span class="span">서비스 이용약관 </span>
                  <span class="text-wrapper-3">(필수)</span>
                </p>
              </div>

              <div class="agreement-item">
                <input type="checkbox" v-model="agreements.privacy" class="checkbox" />
                <p class="label-8">
                  <span class="span">개인정보 수집 및 이용 </span>
                  <span class="text-wrapper-3">(필수)</span>
                </p>
              </div>

              <div class="agreement-item">
                <input type="checkbox" v-model="agreements.marketing" class="checkbox" />
                <p class="label-9">
                  <span class="span">광고 및 마케팅 수신 </span>
                  <span class="text-wrapper-9">(선택)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 고정 버튼 -->
      <div class="button-wrapper">
        <button
          class="button"
          :class="{ active: isFormValid }"
          :disabled="!isFormValid"
          @click="handleSignup"
        >
          <div class="text-wrapper-10">회원가입 완료</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AuthHeader from '@/components/AuthHeader.vue'
import logo from '@/assets/images/togethershop_logo.png'
import { signup } from '@/api/customer-auth'

const router = useRouter()
const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const birth = ref('')

const allChecked = ref(false)
const agreements = ref({
  age: false,
  terms: false,
  privacy: false,
  marketing: false,
})

const emailError = computed(() => {
  if (!email.value) return ''
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.value) ? '' : '올바른 이메일 형식이 아닙니다.'
})

const passwordError = computed(() => {
  if (!password.value) return ''
  return password.value.length >= 8 ? '' : '비밀번호는 8자 이상이어야 합니다.'
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return ''
  return confirmPassword.value === password.value ? '' : '비밀번호가 일치하지 않습니다.'
})

const toggleAll = () => {
  agreements.value.age = allChecked.value
  agreements.value.terms = allChecked.value
  agreements.value.privacy = allChecked.value
  agreements.value.marketing = allChecked.value
}

watch(
  agreements,
  (newVal) => {
    allChecked.value = newVal.age && newVal.terms && newVal.privacy && newVal.marketing
  },
  { deep: true },
)

const isFormValid = computed(() => {
  return (
    name.value.trim() &&
    username.value.trim() &&
    email.value.trim() &&
    password.value.trim() &&
    confirmPassword.value.trim() &&
    birth.value.trim() &&
    agreements.value.age &&
    agreements.value.terms &&
    agreements.value.privacy &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  )
})

const handleSignup = async () => {
  if (!isFormValid.value) return

  try {
    await signup({
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      birth: birth.value,
    })
    alert('회원가입 완료')
    router.push('/login')
  } catch (err) {
    alert(err)
  }
}
</script>

<style scoped>
.screen {
  align-items: start;
  background-color: #ffffff;
  display: grid;
  justify-items: center;
  width: 100vw;
}

.screen .div {
  width: 390px;
  min-height: 844px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', Helvetica, sans-serif;
  overflow: hidden;
}

/* 헤더 */
.screen .background {
  background-color: #ffffff;
  height: 77px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.screen .link-SVG {
  height: 24px;
  width: 24px;
  position: absolute;
  left: 24px;
}

.screen .vector {
  height: 14px;
  width: 7px;
  position: absolute;
  left: 8px;
  top: 5px;
}

.screen .heading {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  white-space: nowrap;
}

/* 로고 섹션 */
.screen .logo-section {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.screen .logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}
.error-message {
  color: #fa2b36;
  font-size: 12px;
  margin-top: 4px;
}

/* 스크롤 가능한 메인 컨텐츠 */
.screen .scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.screen .scrollable-content::-webkit-scrollbar {
  display: none;
  width: 0;
}

/* 프로필 이미지 */
.screen .view {
  background-image: url(./image.png);
  background-position: 50% 50%;
  background-size: cover;
  border-radius: 50%;
  height: 80px;
  width: 80px;
  align-self: center;
  margin-top: 14px;
}

/* 타이틀 섹션 */
.screen .title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.screen .text-wrapper {
  color: #101727;
  font-family: 'Pretendard-Bold', Helvetica;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 28px;
  text-align: center;
  white-space: nowrap;
}

.screen .text-wrapper-2 {
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
.screen .form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-bottom: 24px;
}

.screen .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.screen .label,
.screen .p,
.screen .label-2,
.screen .label-3,
.screen .label-4 {
  color: transparent;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
}

.screen .span {
  color: #354152;
}

.screen .text-wrapper-3 {
  color: #fa2b36;
}

.screen .text-wrapper-7 {
  color: #fb2c36;
}

/* 입력 필드 래퍼 */
.screen .input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper {
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

.input-wrapper::placeholder {
  color: #9ca3af;
}

.screen .input-2 {
  border: 1px solid #d0d5db;
  border-radius: 8px;
  height: 50px;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.screen .container {
  height: 20px;
  position: absolute;
  left: 41px;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 82px);
}

.screen .container-2 {
  background: none;
  border: none;
  color: #000000;
  font-family: 'Geist-Regular', Helvetica;
  font-size: 16px;
  font-weight: 400;
  width: calc(100% - 82px);
  height: 18px;
  position: absolute;
  left: 41px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  outline: none;
}

.screen .container-2::placeholder {
  color: #9ca3af;
}

.screen .div-wrapper {
  height: 20px;
  position: absolute;
  left: 41px;
  top: 50%;
  transform: translateY(-50%);
  width: calc(100% - 82px);
}

.screen .text-wrapper-4,
.screen .text-wrapper-5,
.screen .text-wrapper-6,
.screen .text-wrapper-8 {
  color: #9ca3af;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  white-space: nowrap;
}

.screen .SVG {
  height: 20px;
  width: 20px;
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.screen .img {
  height: 5px;
  width: 12px;
  position: absolute;
  left: 4px;
  top: 12px;
}

.screen .vector-2 {
  height: 7px;
  width: 7px;
  position: absolute;
  left: 7px;
  top: 2px;
}

.screen .vector-wrapper {
  background-image: url(./vector-3.svg);
  background-size: 100% 100%;
  height: 13px;
  width: 17px;
  position: relative;
  left: 2px;
  top: 3px;
}

.screen .vector-3 {
  height: 5px;
  width: 17px;
  position: absolute;
  left: 0;
  top: 2px;
}

.screen .vector-4 {
  height: 9px;
  width: 15px;
  position: absolute;
  left: 2px;
  top: 9px;
}

.screen .vector-5 {
  height: 8px;
  width: 8px;
  position: absolute;
  left: 6px;
  top: 2px;
}

/* 약관 동의 섹션 */
.screen .background-border {
  background-color: #f8f8f8;
  border: 1px solid #cdcdcd;
  border-radius: 12px;
  box-shadow:
    0px 1px 2px -1px #0000001a,
    0px 1px 3px #0000001a;
  width: 100%;
  padding: 17px;
  box-sizing: border-box;
}

.screen .background-2 {
  background-color: #eef5fe;
  border-radius: 8px;
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  margin-bottom: 16px;
}

.screen .checkbox {
  background-color: #ffffff01;
  border: 1px solid var(--gray-1);
  border-radius: 4px;
  box-shadow: 0px 1px 2px #0000000d;
  height: 16px;
  width: 16px;
  margin-right: 12px;
}

.screen .label-5 {
  color: #1347e5;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
}

.screen .vertical-border {
  border-left: 2px solid #f2f4f6;
  padding-left: 17px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.screen .agreement-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

.screen .checkbox-2,
.screen .checkbox-3,
.screen .checkbox-4,
.screen .checkbox-5 {
  background-color: #ffffff01;
  border: 1px solid var(--gray-1);
  border-radius: 4px;
  box-shadow: 0px 1px 2px #0000000d;
  height: 16px;
  width: 16px;
  margin-right: 12px;
  flex-shrink: 0;
}

.screen .label-6,
.screen .label-7,
.screen .label-8,
.screen .label-9 {
  color: transparent;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
  flex: 1;
}

.screen .text-wrapper-9 {
  color: #697282;
}

.screen .img-wrapper,
.screen .SVG-2,
.screen .SVG-3 {
  height: 16px;
  width: 16px;
  margin-left: auto;
  flex-shrink: 0;
}

.screen .vector-6 {
  height: 8px;
  width: 4px;
  position: absolute;
  left: 6px;
  top: 4px;
}

/* 하단 고정 버튼 */
.screen .button-wrapper {
  background-color: #ffffff;
  width: 100%;
  padding: 25px 24px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.screen .button {
  all: unset;
  background-color: #e1e2e6;
  border-radius: 8px;
  box-shadow: 0px 1px 2px #0000000d;
  box-sizing: border-box;
  height: 48px;
  width: 100%;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.button.active {
  background-color: #017f58; /* 초록색 */
  opacity: 1;
  cursor: pointer;
}
.screen .text-wrapper-10 {
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
