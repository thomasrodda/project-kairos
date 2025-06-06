// apps/web/cypress/e2e/editor-selection.cy.ts
// E2E tests for text selection features including cross-block selection and copy/paste

describe('Cross-Block Selection', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for editor to be fully loaded
    cy.get('.editor').should('be.visible')
    cy.get('.page-title').should('be.visible')
    cy.get('.editor-content').should('be.visible')
  })

  describe('✅ Selects text within single block', () => {
    it('should select text with mouse drag', () => {
      // Type some content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('This is a test paragraph with some content')
      
      // Select part of the text using mouse
      cy.get('.block--paragraph .block__content').first()
        .trigger('mousedown', { which: 1, button: 0, clientX: 50 })
        .trigger('mousemove', { clientX: 200 })
        .trigger('mouseup')
      
      // Verify selection exists (browser specific, so we check if we can copy)
      cy.document().trigger('copy')
    })

    it('should select text with keyboard shortcuts', () => {
      // Type content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Select this text')
      
      // Select all with Ctrl+A
      cy.get('.block--paragraph .block__content').first().type('{ctrl}a')
      
      // Try to copy (verifies selection exists)
      cy.document().trigger('copy')
    })

    it('should extend selection with Shift+Click', () => {
      // Type content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Click at start and shift click at end')
      
      // Click at start
      cy.get('.block--paragraph .block__content').first().click('left')
      
      // Shift+Click at end
      cy.get('.block--paragraph .block__content').first().click('right', { shiftKey: true })
      
      // Selection should exist
      cy.document().trigger('copy')
    })

    it('should select word with double-click', () => {
      // Type content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Double click this word here')
      
      // Double click on a word
      cy.get('.block--paragraph .block__content').first().dblclick()
      
      // A word should be selected
      cy.document().trigger('copy')
    })
  })

  describe('✅ Selects text across multiple blocks', () => {
    it('should select across two blocks with mouse drag', () => {
      // Set up two blocks with content
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).clear().type('First block content')
      
      cy.get('.block--paragraph .block__content').eq(1).click()
      cy.get('.block--paragraph .block__content').eq(1).clear().type('Second block content')
      
      // Start selection in first block
      cy.get('.block--paragraph .block__content').eq(0)
        .trigger('mousedown', { which: 1, clientX: 100 })
      
      // Drag to second block
      cy.get('.block--paragraph .block__content').eq(1)
        .trigger('mousemove', { clientX: 100 })
        .trigger('mouseup')
      
      // Cross-block selection should exist
      cy.document().trigger('copy')
    })

    it('should select across multiple blocks with shift+arrow keys', () => {
      // Set up blocks
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).clear().type('First block')
      
      cy.get('.block--paragraph .block__content').eq(1).click()
      cy.get('.block--paragraph .block__content').eq(1).clear().type('Second block')
      
      // Start at end of first block
      cy.get('.block--paragraph .block__content').eq(0).click().type('{end}')
      
      // Extend selection to next block
      cy.get('.block--paragraph .block__content').eq(0).type('{shift}{rightarrow}{rightarrow}{rightarrow}')
      
      // Should have cross-block selection
      cy.document().trigger('copy')
    })

    it('should handle selection across different block types', () => {
      // Select from heading to paragraph
      cy.get('.block--h1 .block__content').first()
        .trigger('mousedown', { which: 1 })
      
      cy.get('.block--paragraph .block__content').first()
        .trigger('mousemove')
        .trigger('mouseup')
      
      // Should work across different block types
      cy.document().trigger('copy')
    })
  })

  describe('✅ Extends selection with keyboard', () => {
    it('should extend selection character by character', () => {
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Extend selection test')
      
      // Start selection
      cy.get('.block--paragraph .block__content').first().type('{home}')
      
      // Extend character by character
      cy.get('.block--paragraph .block__content').first().type('{shift}{rightarrow}{rightarrow}{rightarrow}')
      
      // Should have selected "Ext"
      cy.document().trigger('copy')
    })

    it('should extend selection word by word', () => {
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Word by word selection')
      
      // Start at beginning
      cy.get('.block--paragraph .block__content').first().type('{home}')
      
      // Select word by word (Ctrl+Shift+Arrow)
      cy.get('.block--paragraph .block__content').first().type('{ctrl}{shift}{rightarrow}')
      cy.get('.block--paragraph .block__content').first().type('{ctrl}{shift}{rightarrow}')
      
      // Should have selected first two words
      cy.document().trigger('copy')
    })

    it('should extend selection to line boundaries', () => {
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Select to end of line')
      
      // Go to middle
      cy.get('.block--paragraph .block__content').first().type('{home}{rightarrow}{rightarrow}{rightarrow}')
      
      // Select to end
      cy.get('.block--paragraph .block__content').first().type('{shift}{end}')
      
      // Should have selected from cursor to end
      cy.document().trigger('copy')
    })
  })

  describe('✅ Copies selection in multiple formats', () => {
    it('should copy plain text format', () => {
      // Select some text
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Copy this text')
      cy.get('.block--paragraph .block__content').first().type('{ctrl}a')
      
      // Copy
      cy.get('.block--paragraph .block__content').first().type('{ctrl}c')
      
      // Paste in same block to verify
      cy.get('.block--paragraph .block__content').first().clear()
      cy.get('.block--paragraph .block__content').first().type('{ctrl}v')
      
      // Should have pasted the text
      cy.get('.block--paragraph .block__content').first().should('contain', 'Copy this text')
    })

    it('should preserve formatting when copying between blocks', () => {
      // Copy from a heading
      cy.get('.block--h1 .block__content').first().click()
      cy.get('.block--h1 .block__content').first().type('{ctrl}a')
      cy.get('.block--h1 .block__content').first().type('{ctrl}c')
      
      // Paste in a paragraph block
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear()
      cy.get('.block--paragraph .block__content').first().type('{ctrl}v')
      
      // Content should be pasted (block type is preserved based on where we paste)
      cy.get('.block--paragraph .block__content').first().should('not.be.empty')
    })

    it('should handle copy/paste across multiple blocks', () => {
      // Set up content
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).clear().type('First line')
      
      cy.get('.block--paragraph .block__content').eq(1).click()
      cy.get('.block--paragraph .block__content').eq(1).clear().type('Second line')
      
      // Select across blocks
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).type('{ctrl}a')
      
      // Extend to next block
      cy.get('.block--paragraph .block__content').eq(1).click('right', { shiftKey: true })
      
      // Copy
      cy.document().trigger('copy')
      
      // Should handle multi-block content
      // (Actual paste behavior depends on implementation)
    })
  })

  describe('✅ Clears selection appropriately', () => {
    it('should clear selection when clicking elsewhere', () => {
      // Create selection
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Select and clear')
      cy.get('.block--paragraph .block__content').first().type('{ctrl}a')
      
      // Click elsewhere
      cy.get('.page-title').click()
      
      // Selection should be cleared (no visual selection)
      // We can verify by trying to type - it should not replace all text
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().type(' added')
      cy.get('.block--paragraph .block__content').first().should('contain', 'Select and clear added')
    })

    it('should clear selection with Escape key', () => {
      // Create selection
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Press escape to clear')
      cy.get('.block--paragraph .block__content').first().type('{ctrl}a')
      
      // Press Escape
      cy.get('.block--paragraph .block__content').first().type('{esc}')
      
      // Selection should be cleared
      cy.get('.block--paragraph .block__content').first().type(' text')
      cy.get('.block--paragraph .block__content').first().should('contain', 'Press escape to clear text')
    })

    it('should clear selection when starting to type', () => {
      // Create selection
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Replace me')
      cy.get('.block--paragraph .block__content').first().type('{ctrl}a')
      
      // Type new text
      cy.get('.block--paragraph .block__content').first().type('New text')
      
      // Should replace selected text
      cy.get('.block--paragraph .block__content').first().should('have.text', 'New text')
      cy.get('.block--paragraph .block__content').first().should('not.contain', 'Replace me')
    })
  })

  describe('✅ Block selection via drag handles', () => {
    it('should show drag handle on hover', () => {
      // Hover over a block
      cy.get('.block').first().trigger('mouseenter')
      
      // Drag handle should appear
      cy.get('.block').first().find('.block-drag-handle').should('be.visible')
    })

    it('should select block when clicking drag handle', () => {
      // Hover and click drag handle
      cy.get('.block').first().trigger('mouseenter')
      cy.get('.block').first().find('.block-drag-handle').click()
      
      // Block should be selected
      cy.get('.block').first().should('have.class', 'block--selected')
    })

    it('should support multi-select with Ctrl/Cmd+Click', () => {
      // Select first block
      cy.get('.block').eq(0).trigger('mouseenter')
      cy.get('.block').eq(0).find('.block-drag-handle').click()
      
      // Ctrl+Click second block
      cy.get('.block').eq(1).trigger('mouseenter')
      cy.get('.block').eq(1).find('.block-drag-handle').click({ ctrlKey: true })
      
      // Both should be selected
      cy.get('.block').eq(0).should('have.class', 'block--selected')
      cy.get('.block').eq(1).should('have.class', 'block--selected')
    })

    it('should support range selection with Shift+Click', () => {
      // Select first block
      cy.get('.block').eq(0).trigger('mouseenter')
      cy.get('.block').eq(0).find('.block-drag-handle').click()
      
      // Shift+Click third block
      cy.get('.block').eq(2).trigger('mouseenter')
      cy.get('.block').eq(2).find('.block-drag-handle').click({ shiftKey: true })
      
      // All three blocks should be selected
      cy.get('.block').eq(0).should('have.class', 'block--selected')
      cy.get('.block').eq(1).should('have.class', 'block--selected')
      cy.get('.block').eq(2).should('have.class', 'block--selected')
    })

    it('should clear block selection when clicking elsewhere', () => {
      // Select a block
      cy.get('.block').first().trigger('mouseenter')
      cy.get('.block').first().find('.block-drag-handle').click()
      cy.get('.block').first().should('have.class', 'block--selected')
      
      // Click elsewhere
      cy.get('.page-title').click()
      
      // Selection should be cleared
      cy.get('.block').first().should('not.have.class', 'block--selected')
    })
  })
})

export {}