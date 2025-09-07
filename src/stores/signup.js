// stores/signup.js
import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'
import { signup } from '@/api/auth'
import { useRouter } from 'vue-router'

export const useSignupStore = defineStore('signup', () => {
  const router = useRouter()

  // 단계별 데이터
  const stepData = reactive({
    agreed: false,
    businessName: '',
    businessRegistrationNumber: '',
    businessType: '',
    businessCategory: '',
    collaborationCategory: '',
    username: '',
    email: '',
    password: '',
  })

  const currentStep = ref(0)

  function nextStep(data = {}) {
    Object.assign(stepData, data)
    if (currentStep.value < 3) currentStep.value++
  }

  function prevStep() {
    if (currentStep.value > 0) currentStep.value--
  }

  function reset() {
    currentStep.value = 0
    Object.keys(stepData).forEach((key) => (stepData[key] = key === 'agreed' ? false : ''))
  }

  // 유효성 체크 (마지막 단계 버튼 활성화용)
  const isPasswordValid = computed(() => stepData.password.length >= 8)
  const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepData.email))
  const allRequiredChecked = computed(() => {
    return (
      stepData.username.trim() &&
      stepData.email.trim() &&
      stepData.password &&
      stepData.businessName.trim() &&
      stepData.businessRegistrationNumber.trim() &&
      stepData.businessType &&
      stepData.businessCategory &&
      stepData.collaborationCategory &&
      isPasswordValid.value &&
      isEmailValid.value
    )
  })

  // 회원가입 API 호출 + 로그인 페이지 이동
  async function submitSignup() {
    try {
      await signup(stepData)
      router.push('/login') // 회원가입 후 로그인 페이지로 이동
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || '회원가입 실패')
    }
  }

  return {
    stepData,
    currentStep,
    nextStep,
    prevStep,
    reset,
    isPasswordValid,
    isEmailValid,
    allRequiredChecked,
    submitSignup,
  }
})
