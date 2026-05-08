/**
 * cypress/e2e/auth.cy.ts
 * Tests for login, logout, and forgot password flows.
 */

describe('Authentication', () => {

  beforeEach(() => {
    cy.visit('/login')
  })

  // ── Login page UI ──────────────────────────────────────────────────────────
  describe('Login page', () => {
    it('renders the login form', () => {
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.contains('button', 'Masuk').should('be.visible')
    })

    it('shows a link to the registration page', () => {
      cy.contains('a', 'Daftar').should('have.attr', 'href', '/register')
    })

    it('shows a forgot password link', () => {
      cy.contains('a', /lupa/i).should('have.attr', 'href', '/forgot-password')
    })

    it('shows password toggle button', () => {
      cy.get('input[type="password"]').should('exist')
      cy.get('button[aria-label]').click()
      cy.get('input[type="text"]').should('exist') // password now visible
    })
  })

  // ── Login validation ───────────────────────────────────────────────────────
  describe('Login validation', () => {
    it('does not submit with empty email', () => {
      cy.contains('button', 'Masuk').click()
      cy.url().should('include', '/login')
    })

    it('does not submit with invalid email format', () => {
      cy.get('input[type="email"]').type('notanemail')
      cy.get('input[type="password"]').type('password123')
      cy.contains('button', 'Masuk').click()
      cy.url().should('include', '/login')
    })
  })

  // ── Successful login ───────────────────────────────────────────────────────
  describe('Successful login', () => {
    it('redirects verified user to /home', () => {
      cy.loginAs('user')
      cy.url().should('include', '/home')
      cy.contains('Tumpangan Tersedia').should('be.visible')
    })

    it('shows the user name in the navbar after login', () => {
      cy.loginAs('user')
      cy.contains('Halo,').should('be.visible')
    })

    it('shows Admin link in navbar for admin users', () => {
      cy.loginAs('admin')
      cy.contains('a', 'Admin').should('be.visible')
    })
  })

  // ── Logout ────────────────────────────────────────────────────────────────
  describe('Logout', () => {
    it('redirects to login page after logout', () => {
      cy.loginAs('user')
      cy.contains('button', 'Keluar').click()
      cy.url().should('include', '/login')
    })
  })

  // ── Forgot password ───────────────────────────────────────────────────────
  describe('Forgot password page', () => {
    beforeEach(() => {
      cy.visit('/forgot-password')
    })

    it('renders the forgot password form', () => {
      cy.contains(/lupa kata sandi/i).should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
    })

    it('shows error for unregistered email', () => {
      cy.get('input[type="email"]').type('notregistered@example.com')
      cy.contains('button', /kirim/i).click()
      // Our check_email_registered function should trigger alert
      cy.on('window:alert', msg => {
        expect(msg).to.include('tidak terdaftar')
      })
    })

    it('shows success message for registered email', () => {
      cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'))
      cy.contains('button', /kirim/i).click()
      cy.contains(/tautan pemulihan telah dikirim/i).should('be.visible')
    })
  })
})
