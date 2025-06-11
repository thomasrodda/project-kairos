// apps/web/src/integration/markdown-detection.test.tsx
// Integration test for markdown detection and formatting

import React from 'react'
import { render } from '@testing-library/react'
import { Editor } from '../components/Editor/Editor'
import '@testing-library/jest-dom'

describe('Markdown Detection Integration', () => {
  it('renders with markdown detection functionality', async () => {
    const { container } = render(<Editor />)

    // Basic check that editor renders
    const editor = container.querySelector('.editor')
    expect(editor).toBeInTheDocument()

    // Check content editable container exists
    const contentEditable = container.querySelector('.content-editable-container')
    expect(contentEditable).toBeInTheDocument()
    expect(contentEditable).toHaveAttribute('contenteditable', 'true')
  })
})
