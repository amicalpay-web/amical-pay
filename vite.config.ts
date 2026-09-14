import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Security: Only expose safe environment variables to frontend
  // FAZER_API_KEY must NEVER be exposed to client-side code
  define: {
    // Explicitly block any attempts to access FAZER_API_KEY in frontend
    'import.meta.env.FAZER_API_KEY': 'undefined',
  },
})
