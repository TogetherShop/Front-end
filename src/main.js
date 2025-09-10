import './assets/main.css'
import 'v-calendar/style.css'

//Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import App from './App.vue'
import VCalendar from 'v-calendar'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { useKakao } from 'vue3-kakao-maps'

// Firebase 초기화
import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage } from 'firebase/messaging'

// Firebase 설정
const firebaseConfig = {
  apiKey: 'AIzaSyD-I_9-Zj0ZVUtQNq79c21V12M3b5G3yFk',
  authDomain: 'togethershop-94509.firebaseapp.com',
  projectId: 'togethershop-94509',
  storageBucket: 'togethershop-94509.firebasestorage.app',
  messagingSenderId: '436249821371',
  appId: '1:436249821371:web:8af7c191a6948884bd699e',
  measurementId: 'G-TKBK7W2X3C',
}

// Firebase 앱 초기화
const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

// Service Worker 등록
let serviceWorkerReady = false

const initializeServiceWorker = async () => {
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    serviceWorkerReady = true
    console.log('FCM Service Worker 등록 완료')
  } catch (err) {
    console.error('Service Worker registration failed:', err)
    serviceWorkerReady = false
  }
}

// 포그라운드에서 메시지 수신 처리
onMessage(messaging, (payload) => {
  console.log('포그라운드에서 메시지 수신:', payload)

  // 브라우저 알림 표시
  if (Notification.permission === 'granted') {
    const notification = new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/firebase-logo.png',
      badge: '/firebase-logo.png',
      tag: 'togethershop-notification',
      requireInteraction: true,
    })

    // 알림 클릭 시 처리
    notification.onclick = function (event) {
      event.preventDefault()
      window.focus()
      // 필요시 특정 페이지로 이동
      // router.push('/some-page')
    }
  }
})

Promise.all([
  document.fonts.load('24px "Material Symbols Outlined"'),
  document.fonts.load('24px "Material Symbols Rounded"'),
  document.fonts.load('24px "Material Symbols Sharp"'),
]).then(async () => {
  document.documentElement.classList.add('icons-loaded')

  // Service Worker 초기화
  await initializeServiceWorker()

  const app = createApp(App)
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app.use(VCalendar, {})
  app.use(pinia)
  app.use(router)

  // const auth = useAuthStore(pinia)
  // await auth.loadUserInfo()

  app.mount('#app')
})
