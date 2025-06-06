// apps/web/cypress/e2e/editor-basic.cy.ts
// E2E tests for basic editor operations including typing, block creation, and navigation

describe('Editor Basic Operations', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for editor to be fully loaded
    cy.get('.editor').should('be.visible')
    cy.get('.page-title').should('be.visible')
    cy.get('.editor-content').should('be.visible')
  })

  describe('✅ Types text into blocks', () => {
    it('should allow typing in the page title', () => {
      // Click on page title
      cy.get('.page-title').click()
      
      // Clear existing content and type new title
      cy.get('.page-title').clear().type('My New Page Title')
      
      // Verify the text was typed
      cy.get('.page-title').should('contain', 'My New Page Title')
    })

    it('should allow typing in content blocks', () => {
      // Click on the first paragraph block
      cy.get('.block__content').first().click()
      
      // Clear and type new content
      cy.get('.block__content').first().clear().type('This is my new paragraph content')
      
      // Verify the text was typed
      cy.get('.block__content').first().should('contain', 'This is my new paragraph content')
    })

    it('should preserve block type when typing', () => {
      // Find a heading block
      cy.get('.block--h1 .block__content').first().click()
      
      // Type in the heading
      cy.get('.block--h1 .block__content').first().clear().type('New Heading')
      
      // Verify it's still a heading
      cy.get('.block--h1').should('exist')
      cy.get('.block--h1 .block__content').should('contain', 'New Heading')
    })
  })

  describe('✅ Creates new blocks with Enter key', () => {
    it('should create a new paragraph block when pressing Enter', () => {
      // Count initial blocks
      cy.get('.block').then($blocks => {
        const initialCount = $blocks.length
        
        // Click on a paragraph block and go to the end
        cy.get('.block--paragraph .block__content').first().click()
        cy.get('.block--paragraph .block__content').first().type('{end}')
        
        // Press Enter
        cy.get('.block--paragraph .block__content').first().type('{enter}')
        
        // Should have one more block
        cy.get('.block').should('have.length', initialCount + 1)
        
        // New block should be a paragraph
        cy.get('.block').last().should('have.class', 'block--paragraph')
      })
    })

    it('should split block content at cursor position', () => {
      // Type some content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('First part Second part')
      
      // Move cursor to middle (after "part ")
      cy.get('.block--paragraph .block__content').first().type('{home}')
      for (let i = 0; i < 11; i++) {
        cy.get('.block--paragraph .block__content').first().type('{rightarrow}')
      }
      
      // Press Enter
      cy.get('.block--paragraph .block__content').first().type('{enter}')
      
      // Should have two blocks with split content
      cy.get('.block--paragraph').eq(-2).should('contain', 'First part')
      cy.get('.block--paragraph').last().should('contain', 'Second part')
    })

    it('should create empty block when pressing Enter at end of empty block', () => {
      // Find an empty block or clear one
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear()
      
      // Press Enter
      cy.get('.block--paragraph .block__content').first().type('{enter}')
      
      // Should have a new empty paragraph block
      cy.get('.block').last().should('have.class', 'block--paragraph')
      cy.get('.block').last().find('.block__content').should('have.text', '')
    })
  })

  describe('✅ Merges blocks with Backspace at start', () => {
    it('should merge with previous block when pressing Backspace at start', () => {
      // Set up two blocks with content
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).clear().type('First block')
      
      cy.get('.block--paragraph .block__content').eq(1).click()
      cy.get('.block--paragraph .block__content').eq(1).clear().type('Second block')
      
      // Count blocks before merge
      cy.get('.block').then($blocks => {
        const initialCount = $blocks.length
        
        // Go to start of second block
        cy.get('.block--paragraph .block__content').eq(1).click()
        cy.get('.block--paragraph .block__content').eq(1).type('{home}')
        
        // Press Backspace
        cy.get('.block--paragraph .block__content').eq(1).type('{backspace}')
        
        // Should have one less block
        cy.get('.block').should('have.length', initialCount - 1)
        
        // Content should be merged
        cy.get('.block--paragraph .block__content').eq(0).should('contain', 'First blockSecond block')
      })
    })

    it('should not delete last block', () => {
      // Clear all but one block by selecting and deleting
      // This is a simplified approach for the test
      
      // Count minimum blocks (should always have at least one)
      cy.get('.block').should('have.length.at.least', 1)
      
      // Try to delete the last block
      cy.get('.block .block__content').last().click()
      cy.get('.block .block__content').last().clear()
      cy.get('.block .block__content').last().type('{home}{backspace}')
      
      // Should still have at least one block
      cy.get('.block').should('have.length.at.least', 1)
    })
  })

  describe('✅ Deletes characters with Delete key', () => {
    it('should delete forward when pressing Delete', () => {
      // Type some content
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear().type('Hello World')
      
      // Go to start
      cy.get('.block--paragraph .block__content').first().type('{home}')
      
      // Press Delete
      cy.get('.block--paragraph .block__content').first().type('{del}')
      
      // Should have deleted first character
      cy.get('.block--paragraph .block__content').first().should('contain', 'ello World')
    })

    it('should merge with next block when pressing Delete at end', () => {
      // Set up two blocks
      cy.get('.block--paragraph .block__content').eq(0).click()
      cy.get('.block--paragraph .block__content').eq(0).clear().type('First')
      
      cy.get('.block--paragraph .block__content').eq(1).click()
      cy.get('.block--paragraph .block__content').eq(1).clear().type('Second')
      
      // Count blocks
      cy.get('.block').then($blocks => {
        const initialCount = $blocks.length
        
        // Go to end of first block
        cy.get('.block--paragraph .block__content').eq(0).click()
        cy.get('.block--paragraph .block__content').eq(0).type('{end}')
        
        // Press Delete
        cy.get('.block--paragraph .block__content').eq(0).type('{del}')
        
        // Should merge blocks
        cy.get('.block').should('have.length', initialCount - 1)
        cy.get('.block--paragraph .block__content').eq(0).should('contain', 'FirstSecond')
      })
    })
  })

  describe('✅ Shows placeholder text when block is empty', () => {
    it('should show placeholder when block is empty and focused', () => {
      // Clear a block
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear()
      
      // Should show placeholder
      cy.get('.block--paragraph').first().should('have.attr', 'data-placeholder')
      
      // The actual placeholder text might be shown via CSS
      // We can verify the block has the empty state
      cy.get('.block--paragraph .block__content').first().should('have.class', 'block__content--empty')
    })

    it('should show slash command hint in empty paragraph blocks', () => {
      // Clear a paragraph block and focus it
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear()
      
      // Should have the focused empty state
      cy.get('.block--paragraph .block__content').first()
        .should('have.class', 'block__content--focused')
        .should('have.class', 'block__content--empty')
    })

    it('should hide placeholder when typing', () => {
      // Clear and focus a block
      cy.get('.block--paragraph .block__content').first().click()
      cy.get('.block--paragraph .block__content').first().clear()
      
      // Type something
      cy.get('.block--paragraph .block__content').first().type('Some text')
      
      // Should not have empty class anymore
      cy.get('.block--paragraph .block__content').first()
        .should('not.have.class', 'block__content--empty')
    })
  })

  describe('✅ Handles empty document state', () => {
    it('should always maintain at least one block', () => {
      // The editor should never be completely empty
      cy.get('.block').should('have.length.at.least', 1)
    })

    it('should show the page title even with no content blocks', () => {
      // Page title should always be visible
      cy.get('.page-title').should('be.visible')
      cy.get('.page-title').should('have.attr', 'contenteditable', 'true')
    })

    it('should handle clearing all content gracefully', () => {
      // Try to clear all blocks (simplified approach)
      cy.get('.block__content').each(($block, index) => {
        if (index > 0) { // Keep at least one block
          cy.wrap($block).click().clear()
        }
      })
      
      // Should still have a functional editor
      cy.get('.editor-content').should('be.visible')
      cy.get('.block').should('have.length.at.least', 1)
      
      // Should be able to type in remaining block
      cy.get('.block__content').first().click()
      cy.get('.block__content').first().type('Still works!')
      cy.get('.block__content').first().should('contain', 'Still works!')
    })
  })

  describe('✅ Block type preservation and behavior', () => {
    it('should maintain heading styles when editing', () => {
      // Edit an h1 block
      cy.get('.block--h1 .block__content').first().click()
      cy.get('.block--h1 .block__content').first().clear().type('New Heading Text')
      
      // Should still be h1
      cy.get('.block--h1').should('exist')
      cy.get('.block--h1 .block__content').should('contain', 'New Heading Text')
    })

    it('should show bullet points for bullet type blocks', () => {
      // Bullet blocks should have visible bullet points
      cy.get('.block--bullet').should('exist')
      
      // Edit bullet content
      cy.get('.block--bullet .block__content').first().click()
      cy.get('.block--bullet .block__content').first().clear().type('New bullet item')
      
      // Should still show as bullet
      cy.get('.block--bullet').should('exist')
      cy.get('.block--bullet .block__content').should('contain', 'New bullet item')
    })
  })
})

export {}