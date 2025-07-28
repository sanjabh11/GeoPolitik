// Test setup file for vitest
import { expect } from 'vitest'

// Extend expect with custom matchers if needed
expect.extend({
  toBeValidJSON(received) {
    try {
      JSON.parse(received)
      return {
        message: () => 'expected value not to be valid JSON',
        pass: true,
      }
    } catch {
      return {
        message: () => 'expected value to be valid JSON',
        pass: false,
      }
    }
  },
})

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.VITE_USE_MOCK_DATA = 'false'
