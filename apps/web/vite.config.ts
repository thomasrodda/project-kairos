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
      '@kairos/design-tokens': resolve(__dirname, '../../packages/design-tokens/src/index.scss'),
    },
  },
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
    },
    host: true,
  },
  build: {
    target: 'es2022',
  },
  // Enhanced asset handling for SVGs
  assetsInclude: ['**/*.svg'],

  // Configure how different SVG imports are handled
  define: {
    // Help with development debugging
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  optimizeDeps: {
    // Include SVG files in dependency optimization
    include: ['**/*.svg?raw'],
  },

  // Handle SVG imports with different suffixes
  esbuild: {
    // Enable JSX in .js files (not needed for this specific change but good practice)
    loader: 'tsx',
    include: /src\/.*\.[tj]sx?$/,
  },
})
