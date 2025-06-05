/**
 * apps/web/src/App.test.tsx
 *
 * Verifies that App renders:
 *  - a page-title heading (currently "Test Page")
 *  - a <main> element with class "editor" (the editor container)
 *  - the sidebar toggle button
 */

import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the workspace with page-title and editor container', async () => {
    render(<App />)

    // 1) Check for the page-title heading "Test Page"
    const pageTitle = await screen.findByRole('heading', { level: 1 })
    expect(pageTitle).toBeInTheDocument()
    expect(pageTitle).toHaveTextContent('Test Page')

    // 2) Check that a <main> with class "editor" exists
    //    Since <main class="editor"> is in your DOM, it has an implicit "main" role.
    const editorMain = screen.getByRole('main')
    expect(editorMain).toHaveClass('editor')
  })

  it('renders the sidebar with toggle button', async () => {
    render(<App />)

    // Check for the sidebar toggle button (aria-label="Collapse sidebar")
    const toggleButton = await screen.findByRole('button', { name: /Collapse sidebar/i })
    expect(toggleButton).toBeInTheDocument()
  })
})
