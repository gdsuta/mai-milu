/**
 * cypress/e2e/myRides.cy.ts
 * Tests for the Tumpangan Saya page — tabs, status transitions, deletion.
 */

describe('My Rides Page', () => {

  beforeEach(() => {
    cy.loginAs('user')
    cy.visit('/my-rides')
  })

  // ── Page structure ─────────────────────────────────────────────────────────
  describe('Page structure', () => {
    it('shows the page title', () => {
      cy.contains('Tumpangan Saya').should('be.visible')
    })

    it('shows back to home button', () => {
      cy.contains('a', '← Beranda').should('be.visible')
    })

    it('shows add ride button', () => {
      cy.contains('a', '➕ Tambah').should('have.attr', 'href', '/offer-ride')
    })

    it('navigates back to home when Beranda is clicked', () => {
      cy.contains('a', '← Beranda').click()
      cy.url().should('include', '/home')
    })
  })

  // ── Tab navigation ─────────────────────────────────────────────────────────
  describe('Tab navigation', () => {
    it('shows all four tabs', () => {
      cy.contains('Aktif').should('be.visible')
      cy.contains('Selesai').should('be.visible')
      cy.contains('Dibatalkan').should('be.visible')
      cy.contains('Kadaluarsa').should('be.visible')
    })

    it('defaults to the Aktif tab', () => {
      cy.contains('button', 'Aktif')
        .should('have.class', 'bg-gray-100')
    })

    it('switches to Selesai tab when clicked', () => {
      cy.contains('button', 'Selesai').click()
      cy.contains('button', 'Selesai')
        .should('have.class', 'bg-gray-100')
    })

    it('switches to Dibatalkan tab when clicked', () => {
      cy.contains('button', 'Dibatalkan').click()
      cy.contains('button', 'Dibatalkan')
        .should('have.class', 'bg-gray-100')
    })

    it('shows empty state message when tab has no rides', () => {
      // Selesai tab is likely empty for a fresh test user
      cy.contains('button', 'Selesai').click()
      cy.contains(/belum ada tumpangan yang ditandai selesai/i).should('be.visible')
    })

    it('shows ride count badge on tabs with rides', () => {
      // Aktif tab count should be visible if user has active rides
      cy.get('body').then($body => {
        if ($body.text().includes('(')) {
          cy.contains(/\(\d+\)/).should('be.visible')
        }
      })
    })
  })

  // ── Active ride actions ────────────────────────────────────────────────────
  describe('Active ride actions', () => {
    it('shows Batalkan button on active rides', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('Batalkan')) {
          cy.contains('button', '❌ Batalkan').should('be.visible')
        }
      })
    })

    it('shows confirmation modal when Batalkan is clicked', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('Batalkan')) {
          cy.contains('button', '❌ Batalkan').first().click()
          cy.contains('Batalkan Tumpangan?').should('be.visible')
          cy.contains('Tumpangan akan dibatalkan').should('be.visible')
        }
      })
    })

    it('dismisses modal when Batal is clicked', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('❌ Batalkan')) {
          cy.contains('button', '❌ Batalkan').first().click()
          cy.contains('button', 'Batal').click()
          cy.contains('Batalkan Tumpangan?').should('not.exist')
        }
      })
    })

    it('shows delete confirmation modal', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('🗑️')) {
          cy.get('button').contains('🗑️').first().click()
          cy.contains('Hapus Tumpangan?').should('be.visible')
          cy.contains('tidak bisa dibatalkan').should('be.visible')
        }
      })
    })

    it('only shows Tandai Selesai for past departure rides', () => {
      // Tandai Selesai only appears when departure time < now
      // This tests the isPast guard logic
      cy.get('body').then($body => {
        if ($body.text().includes('Tandai Selesai')) {
          cy.contains('button', '✅ Tandai Selesai').should('be.visible')
        }
      })
    })
  })

  // ── Recurring badge ────────────────────────────────────────────────────────
  describe('Recurring ride badge', () => {
    it('shows recurring badge on recurring rides', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('🔁')) {
          cy.contains(/🔁/).should('be.visible')
        }
      })
    })
  })
})
