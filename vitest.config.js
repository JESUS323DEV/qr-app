import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Las pruebas (npm test): se ejecutan en un navegador simulado (jsdom), sin servidor y sin Supabase
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', include: ['src/**/*.test.{js,jsx}'] },
})
