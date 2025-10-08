import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: { 
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: { 
    // 👇 CORRECTED LIBRARY NAME HERE
    exclude: ['@aws-sdk/client-rekognition'], 
  },
  server: { 
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})