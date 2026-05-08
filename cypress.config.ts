import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 390,   // mobile-first (iPhone 14 width)
    viewportHeight: 844,
    video: false,         // disable for CI speed
    screenshotOnRunFailure: true,
    env: {
      // Populated via cypress.env.json or CI environment variables
      // Never commit real credentials!
      SUPABASE_URL: '',
      TEST_USER_EMAIL: '',
      TEST_USER_PASSWORD: '',
      TEST_ADMIN_EMAIL: '',
      TEST_ADMIN_PASSWORD: '',
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{ts,tsx}',
  },
})
