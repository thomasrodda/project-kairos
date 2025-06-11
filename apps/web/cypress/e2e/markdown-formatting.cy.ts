// cypress/e2e/markdown-formatting.cy.ts
// E2E tests for markdown detection and formatting

describe('Markdown Formatting', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for editor to be ready
    cy.get('.editor').should('be.visible')
    cy.get('.content-editable-container').should('be.visible')
  })

  it('converts **text** to bold formatting', () => {
    // Focus on the first block
    cy.get('.block__content').first().click()

    // Type markdown for bold
    cy.get('.content-editable-container').type('This is **bold** text')

    // Check that the text is formatted as bold
    cy.get('.block__content')
      .first()
      .within(() => {
        cy.get('strong').should('exist').and('contain', 'bold')
        // Verify markdown symbols are removed
        cy.get('.block__content').first().should('not.contain', '**')
      })
  })

  it('converts *text* to italic formatting', () => {
    cy.get('.block__content').first().click()
    cy.get('.content-editable-container').type('This is *italic* text')

    cy.get('.block__content')
      .first()
      .within(() => {
        cy.get('em').should('exist').and('contain', 'italic')
        cy.get('.block__content').first().should('not.contain', '*italic*')
      })
  })

  it('converts multiple markdown patterns in one block', () => {
    cy.get('.block__content').first().click()
    cy.get('.content-editable-container').type('**Bold** and *italic* and `code`')

    cy.get('.block__content')
      .first()
      .within(() => {
        cy.get('strong').should('exist').and('contain', 'Bold')
        cy.get('em').should('exist').and('contain', 'italic')
        cy.get('code').should('exist').and('contain', 'code')
      })
  })

  it('handles strikethrough markdown', () => {
    cy.get('.block__content').first().click()
    cy.get('.content-editable-container').type('This is ~~strikethrough~~ text')

    cy.get('.block__content')
      .first()
      .within(() => {
        cy.get('del').should('exist').and('contain', 'strikethrough')
      })
  })

  it('handles inline code markdown', () => {
    cy.get('.block__content').first().click()
    cy.get('.content-editable-container').type('Use `console.log()` to debug')

    cy.get('.block__content')
      .first()
      .within(() => {
        cy.get('code').should('exist').and('contain', 'console.log()')
      })
  })
})
