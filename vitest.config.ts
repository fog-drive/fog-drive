/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@main': resolve('src/main'),
      '@preload': resolve('src/preload'),
      '@renderer': resolve('src/renderer/src')
    }
  },
  test: {
    globals: true
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve('src/renderer/index.html')
      }
    }
  }
})
