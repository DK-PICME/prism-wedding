import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // 모든 인터페이스에서 접근 가능
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
