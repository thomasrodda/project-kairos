// apps/web/cypress/e2e/keyboard-shortcuts.cy.ts
// E2E tests for keyboard shortcuts and toolbar synchronization

describe('Keyboard Shortcuts and Toolbar Sync', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')

    // Wait for editor to load
    cy.get('.editor').should('be.visible')
    cy.get('.page-title').should('be.visible')
    cy.get('.editor-content').should('be.visible')

    // Add some text to work with
    cy.get('.block--paragraph .block__content').first().click()
    cy.get('.block--paragraph .block__content').first().clear().type('This is test content for formatting')
  })

  describe('✅ Keyboard Shortcuts', () => {
    it('should apply bold formatting with Ctrl+B and show in toolbar', () => {
      // Select the word "test" by double-clicking
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Press Ctrl+B
      cy.get('.content-editable-container').type('{ctrl}b')

      // Wait a moment for formatting to apply
      cy.wait(200)

      // Check that bold was applied
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('exist')
        })

      // Select the bold text again to check toolbar
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Check that toolbar shows bold as active
      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Bold"]').should('have.class', 'formatting-toolbar__button--active')
    })

    it('should apply italic formatting with Ctrl+I and show in toolbar', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Press Ctrl+I
      cy.get('.content-editable-container').type('{ctrl}i')

      // Wait for formatting
      cy.wait(200)

      // Check that italic was applied
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('em').should('exist')
        })

      // Select again to check toolbar
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Check toolbar
      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Italic"]').should('have.class', 'formatting-toolbar__button--active')
    })

    it('should apply underline formatting with Ctrl+U and show in toolbar', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Press Ctrl+U
      cy.get('.content-editable-container').type('{ctrl}u')

      // Wait for formatting
      cy.wait(200)

      // Check that underline was applied
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('u').should('exist')
        })

      // Select again to check toolbar
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Check toolbar
      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Underline"]').should('have.class', 'formatting-toolbar__button--active')
    })

    it('should toggle formatting off with keyboard shortcut', () => {
      // First apply bold
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(200)

      // Verify bold was applied
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('exist')
        })

      // Select the bold text and toggle off
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(200)

      // Verify bold was removed
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('not.exist')
        })
    })

    it('should work with Cmd key on Mac', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Press Cmd+B (Mac)
      cy.get('.content-editable-container').type('{meta}b')
      cy.wait(200)

      // Check that bold was applied
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('exist')
        })
    })
  })

  describe('✅ Toolbar and Keyboard Sync', () => {
    it('should sync toolbar state when formatting via keyboard', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Apply multiple formats via keyboard
      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(100)
      cy.get('.content-editable-container').type('{ctrl}i')
      cy.wait(200)

      // Re-select the formatted text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Check that toolbar shows both as active
      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Bold"]').should('have.class', 'formatting-toolbar__button--active')
      cy.get('.formatting-toolbar__button[aria-label*="Italic"]').should('have.class', 'formatting-toolbar__button--active')
      cy.get('.formatting-toolbar__button[aria-label*="Underline"]').should('not.have.class', 'formatting-toolbar__button--active')
    })

    it('should sync keyboard shortcuts when formatting via toolbar', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Apply bold via toolbar
      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Bold"]').click()
      cy.wait(200)

      // Re-select and toggle off via keyboard
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(200)

      // Verify bold was removed
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('not.exist')
        })
    })

    it('should maintain sync across multiple formatting operations', () => {
      // Apply formatting via keyboard
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(200)

      // Apply more formatting via toolbar
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.formatting-toolbar').should('be.visible')
      cy.get('.formatting-toolbar__button[aria-label*="Italic"]').click()
      cy.wait(200)

      // Verify both formats are active in toolbar
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.formatting-toolbar__button[aria-label*="Bold"]').should('have.class', 'formatting-toolbar__button--active')
      cy.get('.formatting-toolbar__button[aria-label*="Italic"]').should('have.class', 'formatting-toolbar__button--active')

      // Remove one format via keyboard
      cy.get('.content-editable-container').type('{ctrl}b')
      cy.wait(200)

      // Verify only italic remains
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('strong').should('not.exist')
          cy.get('em').should('exist')
        })

      // Verify toolbar reflects the change
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.formatting-toolbar__button[aria-label*="Bold"]').should('not.have.class', 'formatting-toolbar__button--active')
      cy.get('.formatting-toolbar__button[aria-label*="Italic"]').should('have.class', 'formatting-toolbar__button--active')
    })
  })

  describe('✅ Link Formatting', () => {
    it('should create link with Ctrl+K', () => {
      // Select text
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      // Mock window.prompt
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('https://example.com')
      })

      // Press Ctrl+K
      cy.get('.content-editable-container').type('{ctrl}k')
      cy.wait(200)

      // Verify link was created
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('a[href="https://example.com"]').should('exist')
        })

      // Verify toolbar shows link as active
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.formatting-toolbar__button[aria-label*="Link"]').should('have.class', 'formatting-toolbar__button--active')
    })

    it('should remove link with Ctrl+K on existing link', () => {
      // First create a link
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('https://example.com')
      })

      cy.get('.content-editable-container').type('{ctrl}k')
      cy.wait(200)

      // Verify link exists
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('a').should('exist')
        })

      // Select link and remove it
      cy.get('.block--paragraph .block__content')
        .first()
        .trigger('mousedown', { which: 1, clientX: 50 })
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')

      cy.get('.content-editable-container').type('{ctrl}k')
      cy.wait(200)

      // Verify link was removed
      cy.get('.block--paragraph .block__content')
        .first()
        .within(() => {
          cy.get('a').should('not.exist')
        })
    })
  })
})
