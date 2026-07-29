// Extends Vitest's `expect` with DOM matchers like toBeInTheDocument / toBeDisabled.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount rendered components after each test so the jsdom DOM doesn't leak
// from one test into the next.
afterEach(() => {
  cleanup()
})
