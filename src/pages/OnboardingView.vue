<template>
  <div class="screen">
    <div class="div">
      <!-- 헤더 -->
      <AuthHeader title="회원가입" />

      <!-- 스크롤 가능한 메인 컨텐츠 -->
      <div class="scrollable-content">
        <!-- 로고 섹션 -->
        <div class="logo-section">
          <img class="logo" :src="logo" alt="togethershop logo" />
        </div>

        <!-- 프로필 이미지 -->
        <div class="view-2" />

        <!-- 타이틀 섹션 -->
        <div class="title-section">
          <div class="heading">함께가게와 함께가세요</div>
          <div class="text-wrapper-8">어떤 방식으로 이용하시나요?</div>
        </div>

        <!-- 선택 카드 섹션 -->
        <div class="cards-section">
          <!-- 매장 사업자 카드 -->
          <div class="card-wrapper business-card" @click="goBusiness">
            <div class="link">
              <div class="icon-section">
                <div class="SVG-wrapper2">
                  <img :src="shop" alt="icon" class="SVG-icon" />
                </div>
                <div class="text-content">
                  <div class="text-wrapper-7">매장 사업자</div>
                  <p class="text-wrapper-6">제휴를 통해 고객을 늘리고 싶어요</p>
                </div>
              </div>
              <div class="benefits-section">
                <div class="div-wrapper">
                  <p class="text-wrapper-5">
                    • 다른 매장과 제휴하여 신규 고객 확보
                    <br />• 쿠폰 교환을 통한 상생 마케팅 <br />• 함께지수로 신뢰도 관리
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 일반 고객 카드 -->
          <div class="card-wrapper customer-card" @click="goCustomer">
            <div class="link">
              <div class="icon-section">
                <div class="SVG-wrapper">
                  <img :src="user" alt="icon" class="SVG-icon" />
                </div>
                <div class="text-content">
                  <div class="text-wrapper-4">일반 고객</div>
                  <div class="text-wrapper-3">다양한 혜택을 받고 싶어요</div>
                </div>
              </div>
              <div class="benefits-section">
                <div class="background">
                  <p class="text-wrapper-2">
                    • 위치 기반 맞춤 쿠폰 및 혜택
                    <br />• 제휴 매장 할인 혜택 <br />• 리뷰 작성으로 리워드 획득
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 로그인 링크 -->
      <div class="bottom-section">
        <p class="p">
          <span class="text-wrapper">이미 계정이 있나요? </span>
          <span class="span" @click="goLogin">로그인</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/images/togethershop_logo.png'
import user from '@/assets/images/user.png'
import shop from '@/assets/images/shop.png'
import AuthHeader from '@/components/AuthHeader.vue'

const router = useRouter()

const goCustomer = () => {
  router.push('/signup/customer')
}

const goBusiness = () => {
  router.push('/signup/business')
}

const goLogin = () => {
  router.push('/login')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.screen {
  width: 100vw;
  height: 844px;
  display: grid;
  justify-items: center;
  align-items: start;
  background-color: #ffffff;
  overflow: hidden;
  font-family: 'Pretendard', sans-serif;
}

.screen .div {
  width: 390px;
  height: 844px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', Helvetica, sans-serif;
  overflow: hidden;
}

/* 헤더 */
.screen .view-3 {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  padding: 24px;
  box-sizing: border-box;
}

.screen .link-SVG {
  position: absolute;
  left: 24px;
  font-size: 20px;
  transform: scaleX(0.5);
  cursor: pointer;
}

.screen .heading-2 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  white-space: nowrap;
}

/* 스크롤 가능한 메인 컨텐츠 */
.screen .scrollable-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 24px;
}

.screen .scrollable-content::-webkit-scrollbar {
  display: none;
  width: 0;
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

/* 프로필 이미지 */
.screen .view-2 {
  background-image: url(./image.png);
  background-position: 50% 50%;
  background-size: cover;
  border-radius: 50%;
  height: 80px;
  width: 80px;
  align-self: center;
}

/* 타이틀 섹션 */
.screen .title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.screen .heading {
  color: #101727;
  font-family: 'Pretendard-Bold', Helvetica;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 32px;
  text-align: center;
  white-space: nowrap;
}

.screen .text-wrapper-8 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 24px;
  text-align: center;
  white-space: nowrap;
}

/* 카드 섹션 */
.screen .cards-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-bottom: 20px;
}

.screen .card-wrapper {
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow:
    0px 1px 2px -1px #0000001a,
    0px 1px 3px #0000001a;
  height: 198px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
}

.screen .business-card {
  border-color: #d0fae4;
}

.screen .customer-card {
  border-color: #daeafe;
}

.screen .link {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 26px 24px;
  box-sizing: border-box;
  gap: 10px;
}

/* 아이콘 + 텍스트 섹션 */
.screen .icon-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.screen .SVG-wrapper,
.screen .SVG-wrapper2 {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.screen .SVG-wrapper {
  background-color: #daeafe;
}

.screen .SVG-wrapper2 {
  background-color: #d0fae5;
}

.screen .SVG-icon {
  width: 24px;
  height: 24px;
}

.screen .text-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.screen .text-wrapper-4,
.screen .text-wrapper-7 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  white-space: nowrap;
}

.screen .text-wrapper-3,
.screen .text-wrapper-6 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 20px;
  white-space: nowrap;
}

/* 혜택 섹션 */
.screen .benefits-section {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.screen .background,
.screen .div-wrapper {
  border-radius: 8px;
  height: 72px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
}

.screen .background {
  background-color: #eef5fe;
}

.screen .div-wrapper {
  background-color: #ebfcf4;
}

.screen .text-wrapper-2 {
  color: #1347e5;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  margin: 0; /* 기본 margin 제거 */
  display: flex; /* flex로 바꿔서 */
  align-items: center; /* 내부 텍스트 세로 정렬 */
}

.screen .text-wrapper-5 {
  color: #007955;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 16px;
  margin: 0; /* 기본 margin 제거 */
  display: flex; /* flex로 바꿔서 */
  align-items: center; /* 내부 텍스트 세로 정렬 */
}

/* 하단 로그인 링크 */
.screen .bottom-section {
  background-color: #ffffff;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.screen .p {
  color: transparent;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
}

.screen .text-wrapper {
  color: #697282;
}

.screen .span {
  color: #017f58;
  font-family: 'Pretendard-Medium', Helvetica;
  font-weight: 500;
  cursor: pointer;
}
</style>
