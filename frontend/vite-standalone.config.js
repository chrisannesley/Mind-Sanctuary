import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  index: 'index-standalone.html',
  server: {
    port: 5185,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist-standalone'
  }
})
