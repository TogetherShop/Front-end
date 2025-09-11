// /src/utils/waitKakaoReady.js
// Kakao Maps SDK dynamic loader with singleton + exponential backoff

let sdkPromise = null // 전역 싱글톤
let injecting = false // 동시 주입 방지
let attempt = 0 // 재시도 횟수

const MAX_ATTEMPTS = 6 // 1s,2s,4s,8s,16s,32s
const LOAD_TIMEOUT_MS = 6000 // load 이후 maps.services 준비 대기
const SCRIPT_ID = 'kakao-maps-sdk-script'

const APP_KEY = 'e908139d3cea166b8ca68f924078218d'
const LIBS = 'services'

function removeExistingScript() {
  const s = document.getElementById(SCRIPT_ID)
  if (s) s.remove()
}

function buildSdkUrl() {
  const params = new URLSearchParams({
    appkey: APP_KEY,
    autoload: 'false',
    libraries: LIBS,
    // 실패-즉시-재요청 루프 방지용 캐시버스터
    cb: String(Date.now()),
  })
  return `https://dapi.kakao.com/v2/maps/sdk.js?${params.toString()}`
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function injectScriptOnce() {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services) return resolve()
    if (injecting) return resolve() // 누군가 이미 주입 중이면 합류

    injecting = true
    removeExistingScript()

    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = buildSdkUrl()
    s.async = true
    s.defer = true

    s.addEventListener(
      'load',
      () => {
        const start = performance.now()
        const timeout = setTimeout(() => {
          injecting = false
          reject(new Error('Kakao SDK init timeout'))
        }, LOAD_TIMEOUT_MS)

        const waitForLoader = () => {
          if (window.kakao?.maps?.load) {
            window.kakao.maps.load(() => {
              clearTimeout(timeout)
              injecting = false
              if (window.kakao?.maps?.services) resolve()
              else reject(new Error('Kakao SDK services not available'))
            })
            return
          }
          if (performance.now() - start > LOAD_TIMEOUT_MS) {
            clearTimeout(timeout)
            injecting = false
            reject(new Error('Kakao SDK loader not found'))
            return
          }
          requestAnimationFrame(waitForLoader)
        }
        waitForLoader()
      },
      { once: true },
    )

    s.addEventListener(
      'error',
      () => {
        injecting = false
        // iOS Safari에서 429여도 단순 error로만 떨어질 수 있음
        reject(new Error('Kakao SDK network/load error (possibly 429)'))
      },
      { once: true },
    )

    document.head.appendChild(s)
  })
}

async function loadWithBackoff() {
  if (window.kakao?.maps?.services) return

  attempt = 0
  // 지수 백오프 루프
  while (true) {
    try {
      await injectScriptOnce()
      return // 성공
    } catch (e) {
      attempt += 1
      if (attempt >= MAX_ATTEMPTS) throw e
      const base = Math.pow(2, attempt - 1) * 1000 // 1s,2s,4s...
      const jitter = Math.floor(Math.random() * 250)
      await sleep(base + jitter)
      // 다음 루프에서 재주입
    }
  }
}

/** 외부에서 호출하는 함수 */
export function waitKakaoReady() {
  if (window.kakao?.maps?.services) return Promise.resolve()
  if (!APP_KEY) return Promise.reject(new Error('VITE_KAKAO_JS_KEY is missing'))

  if (!sdkPromise) {
    sdkPromise = loadWithBackoff().catch((err) => {
      // 실패 시 다음 호출에서 다시 시도 가능하도록 리셋
      sdkPromise = null
      throw err
    })
  }
  return sdkPromise
}

/** (선택) 강제 리셋용 */
export function resetKakaoLoader() {
  sdkPromise = null
  injecting = false
  attempt = 0
  removeExistingScript()
}
