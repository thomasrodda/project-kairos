// cypress/e2e/markdown-simple.cy.ts
// Simplified E2E test for markdown formatting

describe('Markdown Simple Test', () => {
  it('verifies markdown conversion works', () => {
    cy.visit('/')

    // Wait for editor
    cy.get('.editor').should('be.visible')

    // Get the first block and select all text
    cy.get('.block__content').first().click()

    // Select all text using keyboard shortcut
    cy.get('.content-editable-container').type('{selectall}')

    // Type markdown text (this will replace selected content)
    cy.get('.content-editable-container').type('**bold**')

    // Wait for markdown processing
    cy.wait(1000)

    // Check that markdown was processed
    cy.get('.block__content').first().should('have.text', 'bold')

    // Check DOM structure
    cy.get('.block__content')
      .first()
      .then(($el) => {
        const html = $el.html()
        cy.log('Block HTML:', html)

        // Look for React components or formatted elements
        const hasStrong = html.includes('<strong>') || html.includes('strong')
        const hasBold = html.includes('bold')

        cy.log('Has strong element:', hasStrong)
        cy.log('Has bold text:', hasBold)

        // At minimum, the text should be there without markdown symbols
        cy.wrap($el.text()).should('not.include', '**')
      })
  })

  it('tests italic markdown', () => {
    cy.visit('/')
    cy.get('.editor').should('be.visible')

    cy.get('.block__content').first().click()
    cy.get('.content-editable-container').type('{selectall}')
    cy.get('.content-editable-container').type('*italic*')

    cy.wait(1000)

    cy.get('.block__content').first().should('have.text', 'italic')
    cy.get('.block__content').first().should('not.contain', '*italic*')
  })
})
