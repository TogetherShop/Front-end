<template>
  <div class="screen">
    <div class="logo-section">
      <img class="logo" :src="logo" alt="togethershop logo" />
    </div>

    <h1 class="heading">함께가게</h1>
    <p class="text-wrapper-6">소상공인 상생 네트워크</p>

    <div class="background-shadow">
      <div class="tabpanel">
        <div class="view-3">
          <label class="label-2">아이디</label>
          <div class="container-wrapper">
            <input
              type="text"
              v-model="username"
              class="container-2"
              placeholder="아이디를 입력하세요"
            />
          </div>
        </div>

        <div class="view-2">
          <label class="label">비밀번호</label>
          <div class="container-wrapper">
            <input
              type="password"
              v-model="password"
              class="container-2"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>

        <button
          class="login-button"
          :class="{ active: canLogin, inactive: !canLogin }"
          :disabled="!canLogin"
          @click="doLogin"
        >
          로그인
        </button>
      </div>
    </div>

    <div class="div-3">
      <div class="link-2">아이디 찾기</div>
      <span class="text-wrapper-3">|</span>
      <div class="link">비밀번호 찾기</div>
    </div>

    <div class="horizontal-divider"></div>

    <p class="div-2">
      <span class="text-wrapper">아직 계정이 없나요? </span>
      <span class="text-wrapper-2" @click="goSignup">회원가입</span>
    </p>

    <p class="p">
      <span class="text-wrapper">서비스 이용 시 </span>
      <span class="span">이용약관</span>
      <span class="text-wrapper"> 및 </span>
      <span class="span">개인정보처리방침</span>
      <span class="text-wrapper">에 따라 서비스가 제공됩니다.</span>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import logo from '@/assets/images/togethershop_logo.png'

const username = ref('')
const password = ref('')
const router = useRouter()
const canLogin = computed(() => username.value && password.value)

const doLogin = async () => {
  if (!canLogin.value) return
  try {
    await login(username.value, password.value)
    router.push('/chats')
  } catch (e) {
    alert('로그인 실패')
  }
}

const goSignup = () => {
  router.push('/signup')
}
</script>

<style scoped>
.screen {
  width: 390px;
  height: 844px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.heading {
  color: #101727;
  font-family: 'Pretendard-Bold', Helvetica;
  font-size: 24px;
  font-weight: 700;
  margin-top: 16px;
}

.text-wrapper-6 {
  color: #495565;
  font-size: 14px;
  margin-top: 4px;
}

.background-shadow {
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow:
    0px 4px 6px -4px #0000001a,
    0px 10px 15px -3px #0000001a;
  width: 100%;
  margin-top: 32px;
  padding: 20px;
}

.tabpanel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.container-wrapper {
  background-color: transparent;
  border: 1px solid #f8f8f8;
  border-radius: 6px;
  box-shadow: 0px 1px 2px #0000000d;
  padding: 12px;
}
.container-wrapper:focus-within {
  border-color: #017f58; /* 초록색 강조 */
}
.container-2 {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  background-color: transparent;
}

.label,
.label-2 {
  color: #354152;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}

.login-button {
  border: none;
  border-radius: 12px;
  height: 48px;
  cursor: pointer;
  color: #fff;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.login-button.inactive {
  background-color: #6f797a;
  cursor: not-allowed;
}

.login-button.active {
  background-color: #017f58;
}

.div-3 {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.link,
.link-2 {
  color: #697282;
  font-size: 14px;
  cursor: pointer;
}

.text-wrapper-3 {
  color: #d0d5db;
}

.horizontal-divider {
  width: 100%;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
}

.div-2 {
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
}

.text-wrapper {
  color: #697282;
}

.text-wrapper-2 {
  color: #017f58;
  font-weight: 500;
  cursor: pointer;
}

.p {
  font-size: 12px;
  text-align: center;
  color: #697282;
  margin-top: auto; /* 화면 하단 고정 느낌 */
  margin-bottom: 8px;
}

.span {
  color: #017f58;
  text-decoration: underline;
}
</style>
