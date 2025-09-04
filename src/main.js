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

Promise.all([
  document.fonts.load('24px "Material Symbols Outlined"'),
  document.fonts.load('24px "Material Symbols Rounded"'),
  document.fonts.load('24px "Material Symbols Sharp"'),
]).then(async () => {
  document.documentElement.classList.add('icons-loaded')

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
