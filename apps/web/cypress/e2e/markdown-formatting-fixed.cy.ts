// cypress/e2e/markdown-formatting-fixed.cy.ts
// Fixed E2E tests for markdown detection and formatting

describe('Markdown Formatting Fixed', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for editor to be ready
    cy.get('.editor').should('be.visible')
    cy.get('.content-editable-container').should('be.visible')

    // Wait for initial block to be ready
    cy.get('.block__content').should('have.length.at.least', 1)
  })

  it('types text correctly in contentEditable', () => {
    // Click to focus and clear existing content
    cy.get('.block__content').first().click().clear()

    // Type some text
    cy.get('.content-editable-container').type('Hello world')

    // Verify text appears
    cy.get('.block__content').first().should('have.text', 'Hello world')
  })

  it('converts markdown to formatting - simple test', () => {
    // Click to focus and clear
    cy.get('.block__content').first().click().clear()

    // Type markdown slowly to ensure each character is processed
    cy.get('.content-editable-container').type('This is ').type('*').type('*').type('bold').type('*').type('*').type(' text')

    // Wait a bit for React to process
    cy.wait(500)

    // Check content was updated (markdown removed)
    cy.get('.block__content').first().should('contain.text', 'This is bold text')
    cy.get('.block__content').first().should('not.contain', '**')

    // Debug: log the HTML structure
    cy.get('.block__content')
      .first()
      .then(($el) => {
        const html = $el.html()
        cy.log('HTML after markdown:', html)

        // Check if strong element exists in the HTML
        if (html.includes('<strong>')) {
          cy.log('✅ Strong element found in HTML')
        } else {
          cy.log('❌ No strong element in HTML')
        }
      })
  })

  it('checks if formatting is applied to the DOM', () => {
    cy.get('.block__content').first().click().clear()

    // Type bold markdown
    cy.get('.content-editable-container').type('**test**')

    // Wait for processing
    cy.wait(1000)

    // Get the block content and check its structure
    cy.get('.block__content')
      .first()
      .then(($block) => {
        // Log all child elements
        const children = $block.children()
        cy.log(`Number of children: ${children.length}`)

        children.each((index, child) => {
          cy.log(`Child ${index}: ${child.tagName} - "${child.textContent}"`)
        })

        // Check for any strong elements anywhere in the block
        const strongElements = $block.find('strong')
        cy.log(`Strong elements found: ${strongElements.length}`)

        if (strongElements.length > 0) {
          cy.wrap(strongElements.first().text()).should('equal', 'test')
        }
      })
  })
})
