import { defineConfig } from 'cypress'

export default defineConfig({
  //variáveis de ambiente
  env: {
    apiUrl: 'http://localhost:8081/api/v1'
  },
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
})