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
        <div class="heading-2">서비스 이용약관</div>
        <p class="text-wrapper-7">함께가게 서비스 이용을 위해 약관에 동의해주세요</p>
      </div>

      <!-- 약관 동의 섹션 -->
      <div class="view-2">
        <!-- 전체 동의 -->
        <div class="background">
          <input type="checkbox" v-model="allAgree" class="checkbox" />
          <div class="label">전체 동의하기</div>
        </div>

        <div class="vertical-border">
          <!-- 만 14세 이상 -->
          <input type="checkbox" v-model="over14" class="checkbox-2" />
          <p class="p">
            <span class="span">만 14세 이상입니다 </span>
            <span class="text-wrapper-2">(필수)</span>
          </p>

          <!-- 서비스 이용약관 -->
          <input type="checkbox" v-model="terms" class="checkbox-3" />
          <p class="label-2">
            <span class="span">서비스 이용약관 </span>
            <span class="text-wrapper-2">(필수)</span>
          </p>

          <div class="SVG">
            <i class="fa-solid fa-greater-than vector"></i>
          </div>

          <!-- 개인정보 수집 및 이용 -->
          <input type="checkbox" v-model="privacy" class="checkbox-4" />
          <p class="label-3">
            <span class="span">개인정보 수집 및 이용 </span>
            <span class="text-wrapper-2">(필수)</span>
          </p>

          <div class="vector-wrapper">
            <i class="fa-solid fa-greater-than vector"></i>
          </div>

          <!-- 광고 및 마케팅 수신 (선택) -->
          <input type="checkbox" v-model="marketing" class="checkbox-5" />
          <p class="label-4">
            <span class="span">광고 및 마케팅 수신 </span>
            <span class="text-wrapper-3">(선택)</span>
          </p>

          <div class="img-wrapper">
            <i class="fa-solid fa-greater-than vector"></i>
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
          <div class="text-wrapper">다음 단계</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
const emit = defineEmits(['next', 'prev'])

const props = defineProps({
  agreed: Boolean,
})
const router = useRouter()
const over14 = ref(false)
const terms = ref(false)
const privacy = ref(false)
const marketing = ref(false)
const allAgree = ref(false)

// 현재 단계
const currentStep = ref(1)

// 전체 동의 시 개별 동기화
watch(allAgree, (val) => {
  over14.value = val
  terms.value = val
  privacy.value = val
  marketing.value = val
})

// 개별 체크 변경 시 전체 동의 갱신
watch([over14, terms, privacy, marketing], ([o, t, p, m]) => {
  allAgree.value = o && t && p && m
})

// 필수 체크 모두 확인
const allRequiredChecked = computed(() => over14.value && terms.value && privacy.value)
const nextStep = () => {
  if (allRequiredChecked.value) {
    emit('next', { agreed: true })
  }
}

const goBack = () => {
  router.back()
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
  width: 25%; /* 1/4 만큼 채움 */
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
  font-size: 28px;
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

/* 약관 동의 섹션 */
.view-2 {
  background-color: #f8f8f8;
  border-radius: 12px;
  height: 210px;
  overflow: hidden;
  width: 100%;
  position: relative;
  margin-top: 20px;
}

.background {
  background-color: #ebfcf4;
  border-radius: 8px;
  height: 44px;
  position: absolute;
  top: 17px;
  left: 17px;
  right: 17px;
}

.checkbox {
  background-color: #ffffff;
  border: 1px solid;
  border-radius: 4px;
  height: 16px;
  width: 16px;
  position: absolute;
  left: 12px;
  top: 14px;
}

.label {
  color: #354152;
  font-family: 'Pretendard-Medium', Helvetica;
  font-size: 14px;
  font-weight: 500;
  height: 20px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  left: 40px;
  top: 11px;
  white-space: nowrap;
  width: 76px;
}

.vertical-border {
  border-color: #f2f4f6;
  border-left-style: solid;
  border-left-width: 2px;
  height: 116px;
  position: absolute;
  top: 77px;
  left: 17px;
  right: 17px;
}

.checkbox-2,
.checkbox-3,
.checkbox-4,
.checkbox-5 {
  background-color: #ffffff01;
  border: 1px solid #d0d5db;
  border-radius: 4px;
  height: 16px;
  width: 16px;
  position: absolute;
  left: 18px;
}

.checkbox-2 {
  top: 2px;
}
.checkbox-3 {
  top: 34px;
}
.checkbox-4 {
  top: 66px;
}
.checkbox-5 {
  top: 98px;
}

.p,
.label-2,
.label-3,
.label-4 {
  color: transparent;
  font-family: 'Pretendard-Regular', Helvetica;
  font-size: 14px;
  font-weight: 400;
  height: 20px;
  letter-spacing: 0;
  line-height: 20px;
  position: absolute;
  left: 46px;
  white-space: nowrap;
}

.p {
  top: -2px;
  width: 150px;
}
.label-2 {
  top: 30px;
  width: 126px;
}
.label-3 {
  top: 62px;
  width: 157px;
}
.label-4 {
  top: 94px;
  width: 145px;
}

.span {
  color: #354152;
}

.text-wrapper-2 {
  color: #fa2b36;
}

.text-wrapper-3 {
  color: #697282;
}

.SVG,
.vector-wrapper,
.img-wrapper {
  height: 16px;
  width: 16px;
  position: absolute;
  right: 16px;
}

.SVG {
  top: 34px;
}
.vector-wrapper {
  top: 66px;
}
.img-wrapper {
  top: 98px;
}

.vector {
  height: 8px;
  width: 4px;
  font-size: 10px;
  color: #b0b1b3;
  transform: scaleX(0.5);
  position: absolute;
  left: 6px;
  top: 4px;
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
