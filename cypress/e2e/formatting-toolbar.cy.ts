describe('Formatting Toolbar', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show formatting toolbar when text is selected', () => {
    // Wait for editor to load
    cy.get('.editor').should('be.visible')

    // Get the first block and select some text
    cy.get('.block__content')
      .first()
      .then(($el) => {
        const el = $el[0]
        const textNode = el.firstChild || el

        // Create a range to select text
        const range = document.createRange()
        const selection = window.getSelection()

        // Select first 5 characters
        range.setStart(textNode, 0)
        range.setEnd(textNode, Math.min(5, textNode.textContent?.length || 0))

        selection?.removeAllRanges()
        selection?.addRange(range)
      })

    // Verify toolbar appears
    cy.get('.formatting-toolbar').should('be.visible')

    // Verify toolbar buttons are present
    cy.get('.formatting-toolbar__button').should('have.length.at.least', 4)

    // Click somewhere else to clear selection
    cy.get('.editor').click(10, 10)

    // Verify toolbar disappears
    cy.get('.formatting-toolbar').should('not.exist')
  })

  it('should not show toolbar for collapsed selection', () => {
    // Wait for editor to load
    cy.get('.editor').should('be.visible')

    // Click to place cursor without selecting text
    cy.get('.block__content').first().click()

    // Verify toolbar does not appear
    cy.get('.formatting-toolbar').should('not.exist')
  })

  it('should show tooltip when formatting button is clicked', () => {
    // Select some text first
    cy.get('.block__content')
      .first()
      .then(($el) => {
        const el = $el[0]
        const textNode = el.firstChild || el

        const range = document.createRange()
        const selection = window.getSelection()

        range.setStart(textNode, 0)
        range.setEnd(textNode, 5)

        selection?.removeAllRanges()
        selection?.addRange(range)
      })

    // Wait for toolbar
    cy.get('.formatting-toolbar').should('be.visible')

    // Click bold button
    cy.get('.formatting-toolbar__button').first().click()

    // Verify tooltip appears
    cy.get('.formatting-toolbar__tooltip').should('be.visible')
    cy.get('.formatting-toolbar__tooltip').should('contain', 'Formatting features coming soon!')
  })
})
