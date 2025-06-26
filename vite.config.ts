import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    __SPA_BUILT_AT__: JSON.stringify(process.env.SPA_BUILT_AT || 'LOCAL'),
  },
  server: {
    port: 8082,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
}) 