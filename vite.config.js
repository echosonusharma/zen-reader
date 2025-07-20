import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  base: '/zen-reader/',
  plugins: [solid()],
  worker: {
    format: 'es',
    plugins: () => [solid()]
  },
  optimizeDeps: {
    exclude: ['kokoro-js']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
})
