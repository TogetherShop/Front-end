<template>
  <div>
    <component :is="currentStepComponent" v-bind="stepData" @next="handleNext" @prev="handlePrev" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSignupStore } from '@/stores/signup'
import { useRouter } from 'vue-router'
import StepTerms from '@/components/StepTerms.vue'
import StepShopInfo from '@/components/StepShopInfo.vue'
import StepStoreDetails from '@/components/StepStoreDetails.vue'
import StepUserInfo from '@/components/StepUserInfo.vue'
import { signup } from '@/api/auth'
const router = useRouter()
const store = useSignupStore()

const steps = [StepTerms, StepShopInfo, StepStoreDetails, StepUserInfo]
const currentStepComponent = computed(() => steps[store.currentStep])
const stepData = store.stepData

const handleNext = async (data) => {
  const isLastStep = store.currentStep === steps.length - 1

  store.nextStep(data)

  if (isLastStep) {
    // 마지막 스텝일 때만 회원가입
    try {
      await signup(stepData)
      store.reset()
      router.push('/login')
    } catch (e) {}
  }
}

const handlePrev = () => {
  store.prevStep()
}
</script>
