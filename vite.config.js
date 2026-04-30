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
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    // Target modern browsers untuk bundle lebih kecil
    target: 'es2020',
    // Chunk size warning
    chunkSizeWarningLimit: 300,
    // Code splitting via function-based manualChunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Pisahkan vendor libraries ke chunk terpisah (di-cache browser lebih lama)
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-form'
            }
            if (id.includes('axios')) {
              return 'vendor-http'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-map'
            }
          }
        },
      },
    },
  },
})
