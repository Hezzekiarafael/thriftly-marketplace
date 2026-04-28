import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.thriftly.my.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Mempertahankan /api jika backend mengharapkannya
      },
    },
  },
})

