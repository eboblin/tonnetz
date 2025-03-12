import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tonnetz/', // ← замени на имя твоего репозитория на GitHub
  build: {
    outDir: 'docs'
  }
})