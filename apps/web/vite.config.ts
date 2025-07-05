// apps/web/vite.config.ts
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
      '@kairos/design-tokens': resolve(__dirname, '../../packages/design-tokens/src/index.scss'), // Sass helpers only
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Important for WSL
    open: false, // Don't auto-open browser (can cause issues in WSL)
    watch: {
      usePolling: true, // Essential for WSL file watching
      interval: 100, // Check for changes every 100ms
    },
    fs: {
      allow: ['..', '../..'], // Allow accessing parent directories
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    // Optimize CSS delivery
    cssCodeSplit: true, // Keep code splitting for better caching
    cssMinify: 'lightningcss', // Use faster CSS minifier
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Only import Sass helpers (mixins/functions) - NO CSS output
        // The :root CSS declarations are imported once in src/styles/index.scss
        additionalData: `@use "@kairos/design-tokens" as *;`,
        api: 'modern-compiler', // Use faster Dart Sass API
      },
    },
    devSourcemap: true, // Enable CSS source maps in dev for easier debugging
  },
  envPrefix: ['VITE_'],
})
