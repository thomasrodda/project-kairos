/**
 * apps/web/src/App.test.tsx
 *
 * Verifies that App renders:
 *  - a page-title heading (currently “New Page”)
 *  - a <main> element with class "editor" (the editor container)
 *  - the sidebar toggle button
 */

import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the workspace with page-title and editor container', () => {
    render(<App />)

    // 1) Check for the page-title heading “New Page”
    const pageTitle = screen.getByRole('heading', { name: /New Page/i })
    expect(pageTitle).toBeInTheDocument()

    // 2) Check that a <main> with class "editor" exists
    //    Since <main class="editor"> is in your DOM, it has an implicit "main" role.
    const editorMain = screen.getByRole('main')
    expect(editorMain).toHaveClass('editor')
  })

  it('renders the sidebar with toggle button', () => {
    render(<App />)

    // Check for the sidebar toggle button (aria-label="Collapse sidebar")
    const toggleButton = screen.getByRole('button', { name: /Collapse sidebar/i })
    expect(toggleButton).toBeInTheDocument()
  })
})
