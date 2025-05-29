// apps/web/cypress/e2e/app.cy.ts
describe('App E2E', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays the main heading', () => {
    cy.contains('Project Kairos').should('be.visible')
  })

  it('shows welcome message', () => {
    cy.contains('Welcome to your creative writing workspace!').should('be.visible')
  })

  it('displays the random ID example', () => {
    cy.contains('Random ID example:').should('be.visible')
  })
})

// Future editor tests (when we implement the editor)
describe('Editor E2E (Future)', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  // These tests will be implemented when we build the editor
  it.skip('should create new blocks with Enter key', () => {
    // cy.createTextBlock('Hello world')
    // cy.get('[data-testid="block"]').should('have.length', 2)
  })

  it.skip('should open slash menu with / key', () => {
    // cy.triggerSlashCommand()
    // cy.get('[data-testid="slash-menu"]').should('be.visible')
  })
})

export {}
