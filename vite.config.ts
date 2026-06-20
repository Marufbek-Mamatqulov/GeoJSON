import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('leaflet')) return 'leaflet';
          if (id.includes('node_modules/react') || id.includes('node_modules/zustand')) return 'vendor';
        },
      },
    },
  },
})
