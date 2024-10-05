import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/WeatherApp/', // リポジトリ名をベースパスに設定
  build: {
    sourcemap: false, // ソースマップを無効化
  },
})
