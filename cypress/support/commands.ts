// cypress/support/commands.ts
// Custom reusable commands so tests stay DRY

// ── loginAs ─────────────────────────────────────────────────────────────────
// Logs in via the UI and waits for the home page to load.
// Usage: cy.loginAs('user') or cy.loginAs('admin')
Cypress.Commands.add('loginAs', (role: 'user' | 'admin') => {
  const email = role === 'admin'
    ? Cypress.env('TEST_ADMIN_EMAIL')
    : Cypress.env('TEST_USER_EMAIL')
  const password = role === 'admin'
    ? Cypress.env('TEST_ADMIN_PASSWORD')
    : Cypress.env('TEST_USER_PASSWORD')

  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('button', 'Masuk').click()
  cy.url().should('include', '/home')
})

// ── TypeScript declaration merging ──────────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: 'user' | 'admin'): Chainable<void>
    }
  }
}

export {}
