import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    // QUAN TRỌNG: Dùng './' để hỗ trợ deploy vào thư mục con trên GitHub Pages
    base: './', 
    plugins: [react()],
    define: {
      'process.env': {}
    }
  }
})