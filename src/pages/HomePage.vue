<template>
  <div class="screen">
    <CustomerTopBar />
    <div class="content">
      <!-- 로고 + 설명 -->
      <div class="overlap">
        <div class="logo-section">
          <img class="logo" :src="logo" alt="togethershop logo" />
        </div>
        <p class="div-2">
          <span class="text-wrapper-4">소상공인과 소비자가</span>
          <span class="text-wrapper-5"> 함께 성장</span>
          <span class="text-wrapper-4">
            하는 <br />
            상생 플랫폼
          </span>
        </p>
      </div>

      <!-- 큰 타이틀 -->
      <div class="text-wrapper-3">함께가게</div>

      <!-- 버튼 + 로그인 링크 -->
      <div class="bottom">
        <button class="view" @click="goSignup">
          <div class="overlap-group">
            <div class="text-wrapper-2">시작하기</div>
          </div>
        </button>
        <p class="p">
          <span class="text-wrapper">이미 계정이 있나요? </span>
          <span class="span" @click="goLogin">로그인</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomerTopBar from '@/components/CustomerTopBar.vue'
import logo from '@/assets/images/togethershop_logo.png'
import { useRouter } from 'vue-router'

const router = useRouter()
const goSignup = () => router.push('/signup')
const goLogin = () => router.push('/login')
</script>

<style scoped>
.screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #fff;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 위쪽(로고/설명/타이틀)과 아래쪽 버튼/로그인 분리 */
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

/* 로고 + 설명 */
.overlap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.logo {
  width: 160px;
  height: 160px;
  object-fit: contain;
}

.div-2 {
  font-family: 'Pretendard-Light', Helvetica;
  font-size: 20px;
  font-weight: 300;
  line-height: 32px;
  text-align: center;
  color: #3a3a3a;
}
.text-wrapper-5 {
  color: #006c35;
}

/* 큰 타이틀 */
.text-wrapper-3 {
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 40px;
  font-weight: 600;
  text-align: center;
  margin: 20px 0;
}

/* 버튼 + 로그인 */
.bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.view {
  width: 330px;
  height: 48px;
  border: none;
  background: none;
  cursor: pointer;
}

.overlap-group {
  background-color: #017f58;
  border-radius: 12px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-wrapper-2 {
  color: #ffffff;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 14px;
  font-weight: 600;
}

.p {
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
  color: #697282;
}

.span {
  color: #017f58;
  font-family: 'Pretendard-Medium', Helvetica;
  font-weight: 500;
}
</style>
