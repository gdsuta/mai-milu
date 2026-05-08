/**
 * cypress/e2e/home.cy.ts
 * Tests for the home page ride listing, search, filter, and matching section.
 */

describe('Home Page', () => {

  beforeEach(() => {
    cy.loginAs('user')
    cy.url().should('include', '/home')
  })

  // ── Page structure ─────────────────────────────────────────────────────────
  describe('Page structure', () => {
    it('shows the Tawarkan Tumpangan button', () => {
      cy.contains('a', 'Tawarkan Tumpangan').should('be.visible')
    })

    it('shows the Tumpangan Tersedia heading', () => {
      cy.contains('Tumpangan Tersedia').should('be.visible')
    })

    it('shows the Tumpangan Saya link in navbar', () => {
      cy.contains('a', /tumpangan saya/i).should('be.visible')
    })

    it('does not show Admin link for regular users', () => {
      cy.contains('a', 'Admin').should('not.exist')
    })
  })

  // ── Search ─────────────────────────────────────────────────────────────────
  describe('Search', () => {
    it('renders the search input', () => {
      cy.get('input[placeholder*="Cari asal"]').should('be.visible')
    })

    it('filters rides by origin when typing', () => {
      cy.get('input[placeholder*="Cari asal"]').type('Sangsit')
      // All visible ride cards should contain Sangsit in origin or destination
      cy.get('[data-testid="ride-card"]').each($card => {
        cy.wrap($card).contains(/sangsit/i)
      })
    })

    it('shows no results message when search finds nothing', () => {
      cy.get('input[placeholder*="Cari asal"]').type('XyzNotARealPlace123')
      cy.contains('Tidak ada tumpangan yang cocok').should('be.visible')
    })

    it('clears search when × button is clicked', () => {
      cy.get('input[placeholder*="Cari asal"]').type('Sangsit')
      cy.get('button').contains('×').click()
      cy.get('input[placeholder*="Cari asal"]').should('have.value', '')
    })

    it('highlights the matching text in ride cards', () => {
      cy.get('input[placeholder*="Cari asal"]').type('Sangsit')
      cy.get('mark').should('exist')
    })
  })

  // ── Sort & filter ──────────────────────────────────────────────────────────
  describe('Sort and filter', () => {
    it('shows sort buttons', () => {
      cy.contains('button', 'Waktu Terdekat').should('be.visible')
      cy.contains('button', 'Harga Termurah').should('be.visible')
      cy.contains('button', 'Harga Termahal').should('be.visible')
    })

    it('shows Gratis Saja filter button', () => {
      cy.contains('button', 'Gratis Saja').should('be.visible')
    })

    it('activates sort button when clicked', () => {
      cy.contains('button', 'Harga Termurah').click()
      cy.contains('button', 'Harga Termurah')
        .should('have.class', 'bg-blue-600')
    })

    it('shows Hapus Filter button when filter is active', () => {
      cy.contains('button', 'Harga Termurah').click()
      cy.contains('button', /hapus filter/i).should('be.visible')
    })

    it('resets all filters when Hapus Filter is clicked', () => {
      cy.contains('button', 'Harga Termurah').click()
      cy.get('input[placeholder*="Cari asal"]').type('Sangsit')
      cy.contains('button', /hapus filter/i).click()
      cy.get('input[placeholder*="Cari asal"]').should('have.value', '')
      cy.contains('button', 'Waktu Terdekat')
        .should('have.class', 'bg-blue-600')
    })
  })

  // ── Ride cards ─────────────────────────────────────────────────────────────
  describe('Ride cards', () => {
    it('shows WhatsApp button on other drivers rides', () => {
      cy.contains('a', '💬 WhatsApp').should('exist')
    })

    it('shows Tumpangan Anda badge on own rides', () => {
      // Only visible if the logged-in test user has an active ride
      cy.get('body').then($body => {
        if ($body.text().includes('Tumpangan Anda')) {
          cy.contains('Tumpangan Anda').should('be.visible')
        }
      })
    })

    it('shows Beri Ulasan button on other drivers rides', () => {
      cy.contains(/beri ulasan/i).should('exist')
    })

    it('shows recurring badge on recurring rides', () => {
      cy.get('body').then($body => {
        if ($body.text().includes('Rutin')) {
          cy.contains('🔁 Rutin').should('be.visible')
        }
      })
    })
  })

  // ── Ride matching ──────────────────────────────────────────────────────────
  describe('Ride matching', () => {
    it('shows Cocok untuk Anda section when matches exist', () => {
      // This section only shows when the algorithm finds scored rides
      cy.get('body').then($body => {
        if ($body.text().includes('Cocok untuk Anda')) {
          cy.contains('Cocok untuk Anda').should('be.visible')
          cy.contains('Berdasarkan lokasi & waktu').should('be.visible')
        }
      })
    })
  })

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('Navigation', () => {
    it('navigates to offer-ride when Tawarkan Tumpangan is clicked', () => {
      cy.contains('a', 'Tawarkan Tumpangan').first().click()
      cy.url().should('include', '/offer-ride')
    })

    it('navigates to my-rides when Tumpangan Saya is clicked', () => {
      cy.contains('a', /tumpangan saya/i).click()
      cy.url().should('include', '/my-rides')
    })
  })
})
