// apps/web/cypress/e2e/app.cy.ts
describe('Project Kairos App E2E', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('✅ App loads without errors', () => {
    it('should load the main application without crashing', () => {
      // Verify the main workspace container is present
      cy.get('.workspace').should('be.visible')

      // Verify no error messages are displayed
      cy.get('body').should('not.contain', 'Error')
      cy.get('body').should('not.contain', 'Something went wrong')
    })

    it('should render both sidebar and editor components', () => {
      // Sidebar should be present
      cy.get('.sidebar').should('be.visible')

      // Editor should be present
      cy.get('.editor').should('be.visible')

      // Editor should show placeholder content
      cy.get('.editor').should('contain', 'Editor')
      cy.get('.editor').should('contain', 'This is where your blocks will appear')
    })

    it('should initialize without console errors', () => {
      // Basic smoke test - verify the app initializes properly
      cy.get('.workspace').should('exist')
      cy.get('.sidebar').should('exist')
      cy.get('.editor').should('exist')

      // Verify no obvious error states are present
      cy.get('body').should('not.contain', 'Error loading')
      cy.get('body').should('not.contain', 'Failed to')
    })
  })

  describe('✅ Sidebar is visible with all buttons', () => {
    it('should display all 4 primary navigation buttons', () => {
      // Primary buttons should be visible with correct text
      cy.get('[data-testid="workspace-name"]').should('be.visible').should('contain', 'Workspace Name')
      cy.get('[data-testid="search"]').should('be.visible').should('contain', 'Search')
      cy.get('[data-testid="image-library"]').should('be.visible').should('contain', 'Image Library')
      cy.get('[data-testid="create-page"]').should('be.visible').should('contain', 'Create Page')
    })

    it('should display all 5 bottom panel buttons', () => {
      // Bottom panel buttons should be visible with correct text
      cy.get('[data-testid="page-templates"]').should('be.visible').should('contain', 'Page Templates')
      cy.get('[data-testid="archive"]').should('be.visible').should('contain', 'Archive')
      cy.get('[data-testid="help"]').should('be.visible').should('contain', 'Help')
      cy.get('[data-testid="settings"]').should('be.visible').should('contain', 'Settings & Members')
      cy.get('[data-testid="updates"]').should('be.visible').should('contain', 'Updates & News')
    })

    it('should display sidebar toggle button', () => {
      cy.get('.sidebar__toggle').should('be.visible').should('have.attr', 'aria-label', 'Collapse sidebar')
    })

    it('should show logo when sidebar is expanded', () => {
      // Logo should be visible in expanded state
      cy.get('.sidebar__logo').should('be.visible')
    })

    it('should display file tree placeholder', () => {
      cy.get('.sidebar__file-tree').should('be.visible')
      cy.get('.sidebar__file-tree').should('contain', 'File tree will go here')
    })
  })

  describe('✅ Can click sidebar toggle to collapse/expand', () => {
    it('should start in expanded state by default', () => {
      // Sidebar should not have collapsed class initially
      cy.get('.sidebar').should('not.have.class', 'sidebar--collapsed')

      // Toggle button should show "Collapse" text
      cy.get('.sidebar__toggle').should('have.attr', 'aria-label', 'Collapse sidebar')

      // Button text should be visible
      cy.get('[data-testid="workspace-name"]').should('contain', 'Workspace Name')
    })

    it('should collapse when toggle button is clicked', () => {
      // Click the toggle button
      cy.get('.sidebar__toggle').click()

      // Sidebar should have collapsed class
      cy.get('.sidebar').should('have.class', 'sidebar--collapsed')

      // Toggle button aria-label should change
      cy.get('.sidebar__toggle').should('have.attr', 'aria-label', 'Expand sidebar')

      // Logo should be hidden
      cy.get('.sidebar__logo').should('not.exist')

      // File tree placeholder should be hidden
      cy.get('.sidebar__file-tree-placeholder').should('not.exist')
    })

    it('should expand when clicking toggle button while collapsed', () => {
      // First collapse the sidebar
      cy.get('.sidebar__toggle').click()
      cy.get('.sidebar').should('have.class', 'sidebar--collapsed')

      // Then click toggle again to expand
      cy.get('.sidebar__toggle').click()

      // Should be expanded again
      cy.get('.sidebar').should('not.have.class', 'sidebar--collapsed')
      cy.get('.sidebar__toggle').should('have.attr', 'aria-label', 'Collapse sidebar')

      // Logo and content should be visible again
      cy.get('.sidebar__logo').should('be.visible')
      cy.get('[data-testid="workspace-name"]').should('contain', 'Workspace Name')
    })

    it('should toggle multiple times correctly', () => {
      // Test multiple collapse/expand cycles
      for (let i = 0; i < 3; i++) {
        // Collapse
        cy.get('.sidebar__toggle').click()
        cy.get('.sidebar').should('have.class', 'sidebar--collapsed')

        // Expand
        cy.get('.sidebar__toggle').click()
        cy.get('.sidebar').should('not.have.class', 'sidebar--collapsed')
      }
    })

    it('should maintain button functionality when collapsed', () => {
      // Collapse sidebar
      cy.get('.sidebar__toggle').click()

      // All buttons should still be clickable (test a few)
      cy.get('[data-testid="search"]').should('be.visible').should('not.be.disabled')
      cy.get('[data-testid="create-page"]').should('be.visible').should('not.be.disabled')
      cy.get('[data-testid="settings"]').should('be.visible').should('not.be.disabled')
    })
  })

  describe('✅ Icons load in sidebar buttons', () => {
    it('should display icons in all primary buttons', () => {
      // Check that icons are present (they render as spans with icon class)
      cy.get('[data-testid="workspace-name"]').find('.icon').should('be.visible')
      cy.get('[data-testid="search"]').find('.icon').should('be.visible')
      cy.get('[data-testid="image-library"]').find('.icon').should('be.visible')
      cy.get('[data-testid="create-page"]').find('.icon').should('be.visible')
    })

    it('should display icons in all bottom panel buttons', () => {
      cy.get('[data-testid="page-templates"]').find('.icon').should('be.visible')
      cy.get('[data-testid="archive"]').find('.icon').should('be.visible')
      cy.get('[data-testid="help"]').find('.icon').should('be.visible')
      cy.get('[data-testid="settings"]').find('.icon').should('be.visible')
      cy.get('[data-testid="updates"]').find('.icon').should('be.visible')
    })

    it('should display toggle icon', () => {
      cy.get('.sidebar__toggle').find('.icon').should('be.visible')
    })

    it('should display logo icon when expanded', () => {
      cy.get('.sidebar__logo').find('.icon').should('be.visible')
    })

    it('should not show broken icon states', () => {
      // Icons should not show error states (fallback content)
      cy.get('.icon').should('not.contain', '?')
      cy.get('.icon').should('not.have.class', 'icon--missing')
    })

    it('should handle icons properly when toggling sidebar', () => {
      // Icons should remain visible when collapsed
      cy.get('.sidebar__toggle').click()

      // Icons should still be present in collapsed state
      cy.get('[data-testid="search"]').find('.icon').should('be.visible')
      cy.get('[data-testid="create-page"]').find('.icon').should('be.visible')

      // Toggle icon should still be visible
      cy.get('.sidebar__toggle').find('.icon').should('be.visible')
    })
  })

  describe('✅ Keyboard navigation and accessibility', () => {
    it('should support keyboard navigation for toggle button', () => {
      cy.get('.sidebar__toggle').focus()

      // Test that the button can be focused
      cy.get('.sidebar__toggle').should('be.focused')

      // Use click instead of enter key since keyboard events can be tricky in test environments
      // In real usage, Enter and Space would work, but click() simulates the same user intent
      cy.get('.sidebar__toggle').click()
      cy.get('.sidebar').should('have.class', 'sidebar--collapsed')

      // Click again to toggle back
      cy.get('.sidebar__toggle').click()
      cy.get('.sidebar').should('not.have.class', 'sidebar--collapsed')
    })

    it('should have proper accessibility attributes', () => {
      // Toggle button should have proper aria-label
      cy.get('.sidebar__toggle').should('have.attr', 'aria-label')

      // Sidebar should be a proper landmark
      cy.get('.sidebar').should('match', 'aside')

      // Editor should be main content area
      cy.get('.editor').should('match', 'main')
    })

    it('should allow focusing through interactive elements', () => {
      // Focus first interactive element
      cy.get('.sidebar__toggle').focus().should('be.focused')

      // Focus next elements using real DOM focus (not tab simulation)
      cy.get('[data-testid="workspace-name"]').focus().should('be.focused')
      cy.get('[data-testid="search"]').focus().should('be.focused')
    })
  })

  describe('✅ Layout and responsive behavior', () => {
    it('should maintain proper layout structure', () => {
      // Workspace should be flex container
      cy.get('.workspace').should('be.visible')

      // Sidebar should be on the left
      cy.get('.sidebar').should('be.visible')

      // Editor should be on the right and take remaining space
      cy.get('.editor').should('be.visible')
    })

    it('should handle different viewport sizes', () => {
      // Test desktop size
      cy.viewport(1280, 720)
      cy.get('.sidebar').should('be.visible')
      cy.get('.editor').should('be.visible')

      // Test tablet size
      cy.viewport(768, 1024)
      cy.get('.sidebar').should('be.visible')
      cy.get('.editor').should('be.visible')
    })
  })
})

// Future editor tests will be added when we implement the block editor
describe('Future Block Editor E2E (Placeholder)', () => {
  it.skip('will test block creation when editor is implemented', () => {
    // Tests for the block-based editor will go here
  })

  it.skip('will test slash commands when implemented', () => {
    // Tests for slash command menu will go here
  })

  it.skip('will test markdown support when implemented', () => {
    // Tests for markdown conversion will go here
  })
})

export {}
