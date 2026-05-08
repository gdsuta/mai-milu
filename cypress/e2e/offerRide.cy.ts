/**
 * cypress/e2e/offerRide.cy.ts
 * Tests for the offer-ride form — single ride and recurring ride flows.
 */

describe('Offer Ride Page', () => {

  beforeEach(() => {
    cy.loginAs('user')
    cy.visit('/offer-ride')
  })

  // ── Page structure ─────────────────────────────────────────────────────────
  describe('Page structure', () => {
    it('renders the offer ride form', () => {
      cy.contains('Tawarkan Tumpangan').should('be.visible')
      cy.get('input[placeholder*="Sangsit"]').should('exist') // origin
      cy.get('input[placeholder*="Rendang"]').should('exist') // destination
    })

    it('shows the distance calculator button', () => {
      cy.contains('button', '🗺️ Hitung Jarak').should('be.visible')
    })

    it('shows the recurring toggle', () => {
      cy.contains('🔁 Jadwal Rutin').should('be.visible')
    })

    it('navigates back to home when Batal is clicked', () => {
      cy.contains('a', '✕ Batal').click()
      cy.url().should('include', '/home')
    })
  })

  // ── Form validation ────────────────────────────────────────────────────────
  describe('Form validation', () => {
    it('requires origin field', () => {
      cy.get('input[placeholder*="Rendang"]').type('Denpasar') // destination
      cy.get('input[type="time"]').type('08:00')
      cy.contains('button', 'Publikasikan').click()
      cy.url().should('include', '/offer-ride') // stays on page
    })

    it('requires destination field', () => {
      cy.get('input[placeholder*="Sangsit"]').type('Sangsit') // origin
      cy.get('input[type="time"]').type('08:00')
      cy.contains('button', 'Publikasikan').click()
      cy.url().should('include', '/offer-ride')
    })

    it('requires departure time', () => {
      cy.get('input[placeholder*="Sangsit"]').type('Sangsit')
      cy.get('input[placeholder*="Rendang"]').type('Denpasar')
      cy.contains('button', 'Publikasikan').click()
      cy.url().should('include', '/offer-ride')
    })

    it('disables submit button when date is in the past (single ride)', () => {
      cy.get('input[placeholder*="Sangsit"]').type('Sangsit')
      cy.get('input[placeholder*="Rendang"]').type('Denpasar')
      cy.get('input[type="date"]').invoke('val', '2020-01-01')
      cy.get('input[type="time"]').type('08:00')
      // min attribute on date input prevents past dates in UI
      cy.get('input[type="date"]').should('have.attr', 'min')
    })
  })

  // ── Recurring toggle ───────────────────────────────────────────────────────
  describe('Recurring ride toggle', () => {
    it('shows day selector when recurring is toggled on', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.contains('button', 'Sen').should('be.visible')
      cy.contains('button', 'Sel').should('be.visible')
      cy.contains('button', 'Rab').should('be.visible')
      cy.contains('button', 'Kam').should('be.visible')
      cy.contains('button', 'Jum').should('be.visible')
    })

    it('shows week selector when recurring is toggled on', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.contains('button', '1 minggu').should('be.visible')
      cy.contains('button', '4 minggu').should('be.visible')
    })

    it('hides date picker and shows only time when recurring is on', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.get('input[type="date"]').should('not.exist')
      cy.get('input[type="time"]').should('be.visible')
    })

    it('shows live ride count preview', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      // 5 days × 4 weeks default = 20 rides
      cy.contains('20').should('be.visible')
      cy.contains('jadwal tumpangan').should('be.visible')
    })

    it('updates ride count when a day is deselected', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.contains('button', 'Sen').click() // deselect Monday
      // 4 days × 4 weeks = 16 rides
      cy.contains('16').should('be.visible')
    })

    it('updates ride count when weeks are changed', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.contains('button', '2 minggu').click()
      // 5 days × 2 weeks = 10 rides
      cy.contains('10').should('be.visible')
    })

    it('disables submit when no days are selected', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      // Deselect all days
      ;['Sen', 'Sel', 'Rab', 'Kam', 'Jum'].forEach(day => {
        cy.contains('button', day).click()
      })
      cy.contains('button', /publikasikan/i).should('be.disabled')
    })

    it('changes submit button label to show ride count', () => {
      cy.get('button[aria-label="Toggle jadwal rutin"]').click()
      cy.contains('button', /publikasikan 20 jadwal rutin/i).should('be.visible')
    })
  })

  // ── Successful submission (single ride) ────────────────────────────────────
  describe('Single ride submission', () => {
    it('redirects to /home after successful submission', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().split('T')[0]

      cy.get('input[placeholder*="Sangsit"]').type('Sangsit')
      cy.get('input[placeholder*="Rendang"]').type('Denpasar')
      cy.get('input[type="date"]').type(dateStr)
      cy.get('input[type="time"]').type('08:00')
      cy.get('input[type="number"]').first().clear().type('2') // seats
      cy.get('input[type="number"]').last().clear().type('10000') // price

      cy.on('window:alert', () => {}) // dismiss success alert
      cy.contains('button', 'Publikasikan Tumpangan').click()
      cy.url().should('include', '/home')
    })
  })
})
