// apps/web/cypress/support/commands.ts

// Define custom commands as module augmentation
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to create a new text block
       * @example cy.createTextBlock('Hello world')
       */
      createTextBlock(content: string): Chainable<Element>

      /**
       * Custom command to trigger slash command
       * @example cy.triggerSlashCommand()
       */
      triggerSlashCommand(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('createTextBlock', (content: string) => {
  cy.get('[data-testid="editor"]').type(content)
  cy.get('[data-testid="editor"]').type('{enter}')
})

Cypress.Commands.add('triggerSlashCommand', () => {
  cy.get('[data-testid="editor"]').type('/')
  cy.get('[data-testid="slash-menu"]').should('be.visible')
})

// Export empty object to make this a module
export {}
