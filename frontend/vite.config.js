import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds into ../web, which the Java backend (PathFinderServer) serves as
// static files -- so `npm run build` output is what `make run` serves.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../web',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
