// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to optimize SVG imports
    {
      name: 'svg-optimizer',
      load(id) {
        // Handle ?raw SVG imports for our icon system
        if (id.includes('.svg?raw')) {
          // Let Vite handle the raw import, but we could add optimizations here
          return null
        }
      },
      transform(code, id) {
        // Optimize SVG content when imported as raw
        if (id.includes('.svg?raw')) {
          // Remove XML declarations and comments
          let optimizedCode = code
            .replace(/<\?xml[^>]*>/g, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .trim()

          // Remove unnecessary whitespace between tags
          optimizedCode = optimizedCode.replace(/>\s+</g, '><')

          return `export default ${JSON.stringify(optimizedCode)}`
        }
        return null
      },
    },
  ],
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
    // Optimize build output
    rollupOptions: {
      output: {
        // Separate chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['@kairos/ui'], // Separate icon system into its own chunk
        },
        // Optimize chunk naming for long-term caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Set reasonable chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Enhanced asset handling for SVGs
  assetsInclude: ['**/*.svg'],

  // Configure how different imports are handled
  define: {
    // Help with development debugging
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Add build-time constants for icon system
    __ICON_CACHE_ENABLED__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },

  optimizeDeps: {
    // Include UI package in dependency optimization
    include: ['@kairos/ui', '@kairos/utils', '@kairos/types'],
    // Exclude SVG files from pre-bundling (we handle them ourselves)
    exclude: ['**/*.svg?raw'],
    // Force re-optimization when icon files change
    force: process.env.NODE_ENV === 'development',
  },

  // CSS configuration for design tokens
  css: {
    preprocessorOptions: {
      scss: {
        // Ensure design tokens are available in all SCSS files
        additionalData: `@use "@kairos/design-tokens" as *;`,
        // Optimize output
        outputStyle: 'compressed',
      },
    },
    // PostCSS configuration for autoprefixer and optimization
    postcss: {
      plugins: [
        // Add autoprefixer for browser compatibility
        require('autoprefixer'),
        // Optimize CSS in production
        ...(process.env.NODE_ENV === 'production'
          ? [
              require('cssnano')({
                preset: 'default',
              }),
            ]
          : []),
      ].filter(Boolean),
    },
  },

  // Environment variable handling
  envPrefix: ['VITE_'],

  // Worker configuration (for future use with icon preloading)
  worker: {
    format: 'es',
  },
})
