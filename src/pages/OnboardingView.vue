<template>
  <div class="screen">
    <div class="div">
      <p class="p">
        <span class="text-wrapper">이미 계정이 있나요? </span>
        <span class="span" @click="goLogin">로그인</span>
      </p>
      <div class="view" @click="goCustomer">
        <div class="link">
          <div class="background">
            <p class="text-wrapper-2">
              • 위치 기반 맞춤 쿠폰 및 혜택
              <br />• 제휴 매장 할인 혜택 <br />• 리뷰 작성으로 리워드 획득
            </p>
          </div>
          <div class="text-wrapper-3">다양한 혜택을 받고 싶어요</div>
          <div class="text-wrapper-4">일반 고객</div>
          <div class="SVG-wrapper">
            <img :src="user" alt="icon" class="SVG-icon" />
          </div>
        </div>
      </div>
      <div class="link-wrapper" @click="goBusiness">
        <div class="link">
          <div class="div-wrapper">
            <p class="text-wrapper-5">
              • 다른 매장과 제휴하여 신규 고객 확보
              <br />• 쿠폰 교환을 통한 상생 마케팅 <br />• 함께지수로 신뢰도 관리
            </p>
          </div>
          <p class="text-wrapper-6">제휴를 통해 고객을 늘리고 싶어요</p>
          <div class="text-wrapper-7">매장 사업자</div>
          <div class="SVG-wrapper2">
            <img :src="shop" alt="icon" class="SVG-icon" />
          </div>
        </div>
      </div>
      <div class="text-wrapper-8">어떤 방식으로 이용하시나요?</div>
      <div class="heading">함께가게와 함께가세요</div>
      <div class="view-2" />
      <div class="logo-section">
        <img class="logo" :src="logo" alt="togethershop logo" />
      </div>
      <div class="view-3">
        <div class="heading-2">회원가입</div>
        <div class="link-SVG" @click="goBack">
          <i class="fa-regular fa-less-than"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/images/togethershop_logo.png'
import user from '@/assets/images/user.png'
import shop from '@/assets/images/shop.png'

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
.logo-section {
  display: flex;
  justify-content: center; /* 가로 가운데 정렬 */
  margin-top: 100px; /* 상단 여백 */
}

.logo {
  width: 80px; /* 원하시는 크기 */
  height: 80px;
  object-fit: contain;
}
.screen {
  height: 844px; /* 화면 높이 고정 */
  width: 100vw;
  display: grid;
  justify-items: center;
  align-items: start;
  background-color: #ffffff;
  overflow: hidden; /* 스크롤 방지 */
}

.screen .div {
  background-color: #ffffff;
  height: 844px;
  position: relative;
  width: 390px;
}

.screen .p {
  color: transparent;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  height: 16px;
  left: 119px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  text-align: center;
  top: 784px;
  white-space: nowrap;
  width: 152px;
}

.screen .text-wrapper {
  color: #697282;
}

.screen .span {
  color: #017f58;
  font-family: 'Pretendard-Medium', Helvetica;
  font-weight: 500;
}

.screen .view {
  background-color: #f8f8f8;
  border: 2px solid;
  border-color: #daeafe;
  border-radius: 12px;
  box-shadow:
    0px 1px 2px -1px #0000001a,
    0px 1px 3px #0000001a;
  height: 198px;
  left: 24px;
  overflow: hidden;
  position: absolute;
  top: 538px;
  width: 342px;
}

.screen .link {
  height: 146px;
  left: 2px;
  position: relative;
  top: 26px;
  width: 338px;
}

.screen .background {
  background-color: #eef5fe;
  border-radius: 8px;
  height: 72px;
  left: 24px;
  position: absolute;
  top: 74px;
  width: 290px;
}

.screen .text-wrapper-2 {
  color: #1347e5;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  height: 46px;
  left: 12px;
  letter-spacing: 0;
  line-height: 16px;
  position: absolute;
  top: 12px;
  width: 144px;
}

.screen .text-wrapper-3 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  height: 20px;
  left: 88px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  top: 31px;
  white-space: nowrap;
  width: 144px;
}

.screen .text-wrapper-4 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  height: 28px;
  left: 88px;
  letter-spacing: 0;
  line-height: 28px;
  position: absolute;
  top: -1px;
  white-space: nowrap;
  width: 67px;
}

.screen .SVG-wrapper {
  display: flex; /* flex 컨테이너 */
  justify-content: center; /* 가로 가운데 정렬 */
  align-items: center; /* 세로 가운데 정렬 */
  width: 48px; /* wrapper 크기 */
  height: 48px;
  border-radius: 50%; /* 원 모양 */
  background-color: #daeafe; /* 배경색 */
  left: 24px;
  position: absolute;
}

.screen .SVG-wrapper2 {
  display: flex; /* flex 컨테이너 */
  justify-content: center; /* 가로 가운데 정렬 */
  align-items: center; /* 세로 가운데 정렬 */
  width: 48px; /* wrapper 크기 */
  height: 48px;
  border-radius: 50%; /* 원 모양 */
  background-color: #d0fae5; /* 배경색 */
  left: 24px;
  position: absolute;
}
.screen .SVG {
  height: 24px;
  left: 12px;
  position: relative;
  top: 12px;
  width: 24px;
}
.SVG-icon {
  width: 24px; /* 아이콘 크기 */
  height: 24px;
}

.screen .vector {
  height: 6px;
  left: 5px;
  position: absolute;
  top: 15px;
  width: 14px;
}

.screen .img {
  height: 8px;
  left: 8px;
  position: absolute;
  top: 3px;
  width: 8px;
}

.screen .link-wrapper {
  background-color: #f8f8f8;
  border: 2px solid;
  border-color: #d0fae4;
  border-radius: 12px;
  box-shadow:
    0px 1px 2px -1px #0000001a,
    0px 1px 3px #0000001a;
  height: 198px;
  left: 24px;
  overflow: hidden;
  position: absolute;
  top: 324px;
  width: 342px;
}

.screen .div-wrapper {
  background-color: #ebfcf4;
  border-radius: 8px;
  height: 72px;
  left: 24px;
  position: absolute;
  top: 74px;
  width: 290px;
}

.screen .text-wrapper-5 {
  color: #007955;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 12px;
  font-weight: 400;
  height: 46px;
  left: 12px;
  letter-spacing: 0;
  line-height: 16px;
  position: absolute;
  top: 12px;
  width: 185px;
}

.screen .text-wrapper-6 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  height: 20px;
  left: 88px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  top: 31px;
  white-space: nowrap;
  width: 184px;
}

.screen .text-wrapper-7 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  height: 28px;
  left: 88px;
  letter-spacing: 0;
  line-height: 28px;
  position: absolute;
  top: -1px;
  white-space: nowrap;
  width: 83px;
}

.screen .background-2 {
  height: 48px;
  left: 24px;
  position: absolute;
  top: 2px;
  width: 48px;
}

.screen .text-wrapper-8 {
  color: #495565;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 16px;
  font-weight: 400;
  height: 24px;
  left: 103px;
  letter-spacing: 0;
  line-height: 24px;
  position: absolute;
  text-align: center;
  top: 251px;
  white-space: nowrap;
  width: 183px;
}

.screen .heading {
  color: #101727;
  font-family: 'Pretendard-Bold', Helvetica;
  font-size: 24px;
  font-weight: 700;
  height: 32px;
  left: 88px;
  letter-spacing: 0;
  line-height: 32px;
  position: absolute;
  text-align: center;
  top: 211px;
  white-space: nowrap;
  width: 214px;
}

.screen .view-2 {
  background-image: url(./image.png);
  background-position: 50% 50%;
  background-size: cover;
  border-radius: 16777200px;
  height: 80px;
  left: 155px;
  position: absolute;
  top: 100px;
  width: 80px;
}

.screen .view-3 {
  height: 28px;
  left: 24px;
  position: absolute;
  top: 24px;
  width: 205px;
}

.screen .heading-2 {
  color: #101727;
  font-family: 'Pretendard-SemiBold', Helvetica;
  font-size: 18px;
  font-weight: 600;
  height: 28px;
  left: 140px;
  letter-spacing: 0;
  line-height: 28px;
  position: absolute;
  top: 0;
  white-space: nowrap;
  width: 63px;
}

.screen .link-SVG {
  left: 0;
  position: absolute;
  top: 2px;
  font-size: 20px;
  transform: scaleX(0.5);
}

.screen .vector-2 {
  height: 14px;
  left: 8px;
  position: absolute;
  top: 5px;
  width: 7px;
}
</style>
