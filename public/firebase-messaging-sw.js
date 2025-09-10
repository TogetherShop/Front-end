importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: 'AIzaSyD-I_9-Zj0ZVUtQNq79c21V12M3b5G3yFk',
  authDomain: 'togethershop-94509.firebaseapp.com',
  projectId: 'togethershop-94509',
  storageBucket: 'togethershop-94509.firebasestorage.app',
  messagingSenderId: '436249821371',
  appId: '1:436249821371:web:8af7c191a6948884bd699e',
  measurementId: 'G-TKBK7W2X3C',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)

  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
    badge: '/firebase-logo.png',
    tag: 'togethershop-notification',
    requireInteraction: true, // 사용자가 클릭할 때까지 알림 유지
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
