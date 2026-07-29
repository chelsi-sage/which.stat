import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Statistical logic is pure TypeScript, so the default Node environment is
    // all we need. Component tests opt into jsdom per-file via a
    // `// @vitest-environment jsdom` docblock.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})
