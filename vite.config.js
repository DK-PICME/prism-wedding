import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,  // 포트 고정
    open: false,  // 자동 오픈 비활성화
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
