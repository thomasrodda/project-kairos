import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@kairos/ui': resolve(__dirname, '../../packages/ui/src'),
      '@kairos/utils': resolve(__dirname, '../../packages/utils/src'),
      '@kairos/types': resolve(__dirname, '../../packages/types/src'),
      '@kairos/design-tokens': resolve(__dirname, '../../packages/design-tokens/src/index.scss'),
    },
  },
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is unavailable instead of trying another
    open: true,
    host: true, // Allow network access
  },
  build: {
    target: 'es2022',
  },
})
