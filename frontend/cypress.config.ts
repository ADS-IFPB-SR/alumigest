import { defineConfig } from 'cypress'

const isCI = process.env.CI === 'true'

export default defineConfig({
  //variáveis de ambiente
  env: {
    apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:8081/api/v1'
  },
  // No CI, habilita vídeo e screenshots para evidência de falhas
  video: isCI || process.env.CYPRESS_VIDEO === 'true',
  screenshotOnRunFailure: isCI || process.env.CYPRESS_SCREENSHOT_ON_RUN_FAILURE === 'true',
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
})