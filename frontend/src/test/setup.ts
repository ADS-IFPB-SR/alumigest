import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Registra os matchers do jest-dom no expect do Vitest 5.x
expect.extend(matchers)

// Limpa o DOM após cada teste
afterEach(() => {
  cleanup()
})

// Polyfill para matchMedia em ambiente JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Polyfill para ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock no-op para ambiente JSDOM
  }
  unobserve() {
    // Mock no-op para ambiente JSDOM
  }
  disconnect() {
    // Mock no-op para ambiente JSDOM
  }
}
