import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/ws-chat': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const h = proxyReq.getHeader('authorization')
            console.log('→ proxy', req.method, req.url, 'auth:', h ? 'present' : 'missing')
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('← proxyRes', proxyRes.statusCode, req.method, req.url)
          })
        },
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  define: {
    global: 'window',
  },
})
