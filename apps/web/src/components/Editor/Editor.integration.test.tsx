// apps/web/src/components/Editor/Editor.integration.test.tsx
// Integration tests for the complete Editor component with all features
// Tests end-to-end user workflows and component interactions

import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor } from './Editor'
import { EditorProvider } from '../../contexts/EditorContext'
import { renderWithEditor } from '../../test/utils'
import { generateId } from '@kairos/utils'
import type { EditorBlock } from '../../contexts/EditorContext'

// Mock CSS imports
jest.mock('../../../styles/fonts.scss', () => ({}))

// Mock the Icon component from @kairos/ui
jest.mock('@kairos/ui', () => ({
  Icon: ({ name, size }: { name: string; size: number }) => (
    <div data-testid={`icon-${name}`} data-size={size}>
      {name}
    </div>
  ),
}))

// Mock generateId for predictable test IDs
jest.mock('@kairos/utils', () => ({
  generateId: jest.fn(() => 'test-id'),
}))

describe('Editor Integration', () => {
  const user = userEvent.setup()
  const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset ID counter for predictable test IDs
    let idCounter = 0
    mockGenerateId.mockImplementation(() => `test-id-${idCounter++}`)
  })

  // Helper to get the contentEditable container
  const getContentEditable = () => screen.getByRole('document') as HTMLDivElement

  // Helper to simulate typing in a block
  const typeInBlock = async (blockId: string, text: string, position?: number) => {
    const container = getContentEditable()
    const blockContent = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

    // Focus and set cursor position
    blockContent.focus()
    if (position !== undefined) {
      const range = document.createRange()
      const textNode = blockContent.firstChild || blockContent
      range.setStart(textNode, position)
      range.collapse(true)

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Type the text
    await user.type(blockContent, text)
  }

  // Helper to select text in a block
  const selectText = (blockId: string, start: number, end: number) => {
    const container = getContentEditable()
    const blockContent = container.querySelector(`[data-block-id="${blockId}"] .block__content`) as HTMLElement

    const range = document.createRange()
    const textNode = blockContent.firstChild || blockContent
    range.setStart(textNode, start)
    range.setEnd(textNode, end)

    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)

    // Trigger selection event
    const event = new Event('selectionchange', { bubbles: true })
    document.dispatchEvent(event)
  }

  // Helper to simulate paste with Kairos format
  const simulatePaste = async (plainText: string, kairosData?: any) => {
    const clipboardData = {
      getData: jest.fn((type: string) => {
        if (type === 'text/plain') return plainText
        if (type === 'application/x-kairos-blocks' && kairosData) {
          return JSON.stringify(kairosData)
        }
        return ''
      }),
      types: kairosData ? ['text/plain', 'application/x-kairos-blocks'] : ['text/plain'],
    }

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: clipboardData,
      writable: false,
    })

    await act(async () => {
      getContentEditable().dispatchEvent(pasteEvent)
    })
  }

  describe('✅ Complete Document Creation Workflow', () => {
    it('creates a multi-block document with formatting and different block types', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Step 1: Set page title
      const titleElement = screen.getByRole('heading', { level: 1 })
      await user.click(titleElement)
      await user.clear(titleElement)
      await user.type(titleElement, 'My Technical Document')

      // Verify title was set
      expect(store.getState().pageTitle).toBe('My Technical Document')

      // Step 2: Press Enter to create first block
      await user.keyboard('{Enter}')

      // Step 3: Type slash to open command menu
      const firstBlock = store.getState().blocks[0]
      await typeInBlock(firstBlock.id, '/')

      // Verify slash menu appears
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Step 4: Select Heading 1
      await user.keyboard('{ArrowDown}{Enter}')

      // Verify block type changed
      await waitFor(() => {
        expect(store.getState().blocks[0].type).toBe('h1')
      })

      // Step 5: Type heading content
      await typeInBlock(firstBlock.id, 'Introduction')

      // Step 6: Create new paragraph block
      await user.keyboard('{Enter}')

      // Step 7: Type paragraph with formatting
      const secondBlock = store.getState().blocks[1]
      await typeInBlock(secondBlock.id, 'This is an important document about our project.')

      // Select "important" and make it bold
      selectText(secondBlock.id, 11, 20)
      await user.keyboard('{Control>}b{/Control}')

      // Verify formatting was applied
      await waitFor(() => {
        const formatting = store.getState().blocks[1].formatting
        expect(formatting).toContainEqual(
          expect.objectContaining({
            type: 'bold',
            start: 11,
            end: 20,
          })
        )
      })

      // Step 8: Add a bullet list
      await user.keyboard('{End}{Enter}/')
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      // Navigate to bullet option
      const bulletOption = screen.getByText('Bullet List')
      await user.click(bulletOption)

      // Verify block type changed to bullet
      const thirdBlock = store.getState().blocks[2]
      expect(thirdBlock.type).toBe('bullet')

      // Type bullet content
      await typeInBlock(thirdBlock.id, 'First key point')

      // Step 9: Add another bullet
      await user.keyboard('{Enter}')
      await typeInBlock(store.getState().blocks[3].id, 'Second key point')

      // Final verification: Document structure
      const finalBlocks = store.getState().blocks
      expect(finalBlocks).toHaveLength(4)
      expect(finalBlocks[0]).toMatchObject({
        type: 'h1',
        content: 'Introduction',
      })
      expect(finalBlocks[1]).toMatchObject({
        type: 'paragraph',
        content: 'This is an important document about our project.',
      })
      expect(finalBlocks[2]).toMatchObject({
        type: 'bullet',
        content: 'First key point',
      })
      expect(finalBlocks[3]).toMatchObject({
        type: 'bullet',
        content: 'Second key point',
      })
    })
  })

  describe('✅ Cross-Block Text Selection and Formatting', () => {
    it('selects and formats text across multiple blocks', async () => {
      const initialBlocks: EditorBlock[] = [
        { id: 'block-1', type: 'paragraph', content: 'First paragraph with some text' },
        { id: 'block-2', type: 'paragraph', content: 'Second paragraph with more text' },
        { id: 'block-3', type: 'paragraph', content: 'Third paragraph with final text' },
      ]

      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      // Start selection in first block
      const container = getContentEditable()
      const block1Content = container.querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      const block2Content = container.querySelector('[data-block-id="block-2"] .block__content') as HTMLElement

      // Create cross-block selection from "with" in block 1 to "paragraph" in block 2
      const range = document.createRange()
      const block1Text = block1Content.firstChild!
      const block2Text = block2Content.firstChild!

      range.setStart(block1Text, 16) // Start at "with"
      range.setEnd(block2Text, 16) // End after "paragraph"

      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      // Trigger selection change
      const event = new Event('selectionchange', { bubbles: true })
      document.dispatchEvent(event)

      // Verify cross-block selection was detected
      await waitFor(() => {
        expect(store.getState().crossBlockSelection).not.toBeNull()
        expect(store.getState().crossBlockSelection?.startBlockId).toBe('block-1')
        expect(store.getState().crossBlockSelection?.endBlockId).toBe('block-2')
      })

      // Apply bold formatting
      await user.keyboard('{Control>}b{/Control}')

      // Verify formatting was applied to affected blocks
      await waitFor(() => {
        const blocks = store.getState().blocks

        // First block should have partial formatting
        expect(blocks[0].formatting).toContainEqual(
          expect.objectContaining({
            type: 'bold',
            start: 16,
          })
        )

        // Second block should have partial formatting
        expect(blocks[1].formatting).toContainEqual(
          expect.objectContaining({
            type: 'bold',
            end: 16,
          })
        )
      })
    })
  })

  describe('✅ Complex Drag and Drop Operations', () => {
    it('reorders multiple selected blocks via drag and drop', async () => {
      const initialBlocks: EditorBlock[] = [
        { id: 'block-1', type: 'h1', content: 'Title' },
        { id: 'block-2', type: 'paragraph', content: 'Introduction paragraph' },
        { id: 'block-3', type: 'h2', content: 'Section 1' },
        { id: 'block-4', type: 'paragraph', content: 'Section 1 content' },
        { id: 'block-5', type: 'h2', content: 'Section 2' },
        { id: 'block-6', type: 'paragraph', content: 'Section 2 content' },
      ]

      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      // Select blocks 3 and 4 (Section 1 and its content)
      const block3 = screen.getByText('Section 1').closest('.block') as HTMLElement
      const block4 = screen.getByText('Section 1 content').closest('.block') as HTMLElement

      // Click block 3
      await user.click(block3)

      // Shift+click block 4 to select both
      await user.keyboard('{Shift>}')
      await user.click(block4)
      await user.keyboard('{/Shift}')

      // Verify both blocks are selected
      expect(store.getState().selectedBlockIds).toEqual(['block-3', 'block-4'])

      // Drag the selected blocks to after block 6
      const dragHandle3 = screen.getByTestId('drag-handle-block-3')
      const dropTarget = screen.getByText('Section 2 content').closest('.draggable-block') as HTMLElement

      // Simulate drag operation
      fireEvent.mouseDown(dragHandle3)
      fireEvent.dragStart(dragHandle3)
      fireEvent.dragEnter(dropTarget)
      fireEvent.dragOver(dropTarget)
      fireEvent.drop(dropTarget)
      fireEvent.dragEnd(dragHandle3)

      // Verify blocks were reordered
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks.map((b) => b.id)).toEqual(['block-1', 'block-2', 'block-5', 'block-6', 'block-3', 'block-4'])
      })
    })
  })

  describe('✅ Advanced Copy/Paste Workflows', () => {
    it('copies blocks with complex formatting and pastes maintaining structure', async () => {
      const initialBlocks: EditorBlock[] = [
        {
          id: 'block-1',
          type: 'h1',
          content: 'Formatted Heading',
          formatting: [
            { type: 'bold', start: 0, end: 9 },
            { type: 'italic', start: 10, end: 17 },
          ],
        },
        {
          id: 'block-2',
          type: 'paragraph',
          content: 'This text has bold and italic and underline',
          formatting: [
            { type: 'bold', start: 14, end: 18 },
            { type: 'italic', start: 23, end: 29 },
            { type: 'underline', start: 34, end: 43 },
          ],
        },
        {
          id: 'block-3',
          type: 'paragraph',
          content: 'Link to example website',
          formatting: [{ type: 'link', start: 8, end: 23, url: 'https://example.com' }],
        },
      ]

      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      // Select all three blocks
      const block1 = screen.getByText('Formatted').closest('.block') as HTMLElement
      const block3 = screen.getByText('Link to').closest('.block') as HTMLElement

      await user.click(block1)
      await user.keyboard('{Shift>}')
      await user.click(block3)
      await user.keyboard('{/Shift}')

      // Copy the selection
      await user.keyboard('{Control>}c{/Control}')

      // Move to end and create new block
      const lastBlock = getContentEditable().querySelector('[data-block-id="block-3"] .block__content') as HTMLElement
      lastBlock.focus()
      await user.keyboard('{End}{Enter}')

      // Paste
      await user.keyboard('{Control>}v{/Control}')

      // Verify blocks were duplicated with formatting preserved
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks).toHaveLength(7) // 3 original + 1 empty + 3 pasted

        // Check pasted blocks maintained formatting
        expect(blocks[4]).toMatchObject({
          type: 'h1',
          content: 'Formatted Heading',
          formatting: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', start: 0, end: 9 }),
            expect.objectContaining({ type: 'italic', start: 10, end: 17 }),
          ]),
        })

        expect(blocks[6].formatting).toContainEqual(
          expect.objectContaining({
            type: 'link',
            start: 8,
            end: 23,
            url: 'https://example.com',
          })
        )
      })
    })

    it('handles paste of external rich text content', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Focus first block
      const firstBlock = store.getState().blocks[0]
      const blockEl = getContentEditable().querySelector(`[data-block-id="${firstBlock.id}"] .block__content`) as HTMLElement
      blockEl.focus()

      // Simulate paste of multi-line text (will create multiple blocks)
      const multiLineText = 'Line 1\nLine 2\nLine 3'
      await simulatePaste(multiLineText)

      // Verify multiple blocks were created
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks).toHaveLength(3)
        expect(blocks[0].content).toBe('Line 1')
        expect(blocks[1].content).toBe('Line 2')
        expect(blocks[2].content).toBe('Line 3')
      })
    })
  })

  describe('✅ Undo/Redo Across Multiple Operations', () => {
    it('handles undo/redo for complex editing sequence', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Operation 1: Type in first block
      const firstBlock = store.getState().blocks[0]
      await typeInBlock(firstBlock.id, 'Original text')

      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('Original text')
      })

      // Operation 2: Apply bold formatting
      selectText(firstBlock.id, 0, 8)
      await user.keyboard('{Control>}b{/Control}')

      await waitFor(() => {
        expect(store.getState().blocks[0].formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 0, end: 8 }))
      })

      // Operation 3: Create new block
      await user.keyboard('{End}{Enter}')
      await typeInBlock(store.getState().blocks[1].id, 'Second block')

      // Operation 4: Change first block to heading
      const block1El = getContentEditable().querySelector('[data-block-id="' + firstBlock.id + '"] .block__content') as HTMLElement
      block1El.focus()
      await user.keyboard('{Home}/')

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })

      await user.keyboard('{ArrowDown}{Enter}') // Select H1

      // Now undo operations one by one
      await user.keyboard('{Control>}z{/Control}') // Undo block type change
      await waitFor(() => {
        expect(store.getState().blocks[0].type).toBe('paragraph')
      })

      await user.keyboard('{Control>}z{/Control}') // Undo second block
      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(1)
      })

      await user.keyboard('{Control>}z{/Control}') // Undo formatting
      await waitFor(() => {
        expect(store.getState().blocks[0].formatting).toHaveLength(0)
      })

      await user.keyboard('{Control>}z{/Control}') // Undo text
      await waitFor(() => {
        expect(store.getState().blocks[0].content).toBe('')
      })

      // Redo everything
      await user.keyboard('{Control>}y{/Control}') // Redo text
      await user.keyboard('{Control>}y{/Control}') // Redo formatting
      await user.keyboard('{Control>}y{/Control}') // Redo second block
      await user.keyboard('{Control>}y{/Control}') // Redo block type

      // Verify final state
      await waitFor(() => {
        const blocks = store.getState().blocks
        expect(blocks).toHaveLength(2)
        expect(blocks[0].type).toBe('h1')
        expect(blocks[0].content).toBe('Original text')
        expect(blocks[0].formatting).toContainEqual(expect.objectContaining({ type: 'bold', start: 0, end: 8 }))
        expect(blocks[1].content).toBe('Second block')
      })
    })
  })

  describe('✅ Performance with Many Blocks', () => {
    it('handles rapid operations on document with many blocks', async () => {
      // Create a document with 50 blocks
      const manyBlocks: EditorBlock[] = Array.from({ length: 50 }, (_, i) => ({
        id: `block-${i}`,
        type: 'paragraph' as const,
        content: `This is paragraph ${i + 1} with some content to make it realistic.`,
      }))

      const { store } = renderWithEditor(<Editor />, { initialBlocks: manyBlocks })

      // Rapidly type in multiple blocks
      for (let i = 0; i < 5; i++) {
        await typeInBlock(`block-${i}`, ' EDITED', 10)
      }

      // Select a range of blocks
      const block10 = screen.getByText(/paragraph 11/).closest('.block') as HTMLElement
      const block15 = screen.getByText(/paragraph 16/).closest('.block') as HTMLElement

      await user.click(block10)
      await user.keyboard('{Shift>}')
      await user.click(block15)
      await user.keyboard('{/Shift}')

      // Delete selected blocks
      await user.keyboard('{Delete}')

      // Verify blocks were deleted
      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(44) // 50 - 6 deleted
      })

      // Rapidly create new blocks
      const lastBlock = store.getState().blocks[store.getState().blocks.length - 1]
      const lastBlockEl = getContentEditable().querySelector(`[data-block-id="${lastBlock.id}"] .block__content`) as HTMLElement
      lastBlockEl.focus()

      for (let i = 0; i < 10; i++) {
        await user.keyboard('{End}{Enter}')
        await user.type(getContentEditable(), `New rapid block ${i}`)
      }

      // Verify all operations completed successfully
      await waitFor(() => {
        expect(store.getState().blocks).toHaveLength(54) // 44 + 10 new
      })
    })
  })

  describe('✅ Slash Commands Integration', () => {
    it('completes full slash command workflow with filtering', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Type slash to open menu
      const firstBlock = store.getState().blocks[0]
      await typeInBlock(firstBlock.id, '/')

      // Menu should appear
      expect(screen.getByRole('menu')).toBeInTheDocument()

      // Type to filter - "hea" should match headings
      await user.keyboard('hea')

      // Only heading options should be visible
      await waitFor(() => {
        expect(screen.getByText('Heading 1')).toBeInTheDocument()
        expect(screen.getByText('Heading 2')).toBeInTheDocument()
        expect(screen.getByText('Heading 3')).toBeInTheDocument()
        expect(screen.queryByText('Bullet List')).not.toBeInTheDocument()
      })

      // Clear filter and try another
      await user.keyboard('{Backspace}{Backspace}{Backspace}')
      await user.keyboard('bul')

      // Only bullet option should be visible
      await waitFor(() => {
        expect(screen.getByText('Bullet List')).toBeInTheDocument()
        expect(screen.queryByText('Heading 1')).not.toBeInTheDocument()
      })

      // Select bullet with Enter
      await user.keyboard('{Enter}')

      // Verify block type changed and slash command was removed
      await waitFor(() => {
        expect(store.getState().blocks[0].type).toBe('bullet')
        expect(store.getState().blocks[0].content).toBe('')
      })
    })
  })

  describe('✅ Keyboard Navigation and Shortcuts', () => {
    it('navigates through document with keyboard shortcuts', async () => {
      const initialBlocks: EditorBlock[] = [
        { id: 'block-1', type: 'h1', content: 'Document Title' },
        { id: 'block-2', type: 'paragraph', content: 'First paragraph' },
        { id: 'block-3', type: 'paragraph', content: 'Second paragraph' },
        { id: 'block-4', type: 'bullet', content: 'Bullet point' },
      ]

      const { store } = renderWithEditor(<Editor />, { initialBlocks })

      // Start in first block
      const block1El = getContentEditable().querySelector('[data-block-id="block-1"] .block__content') as HTMLElement
      block1El.focus()

      // Test Ctrl+A (select all in block)
      await user.keyboard('{Control>}a{/Control}')

      // Verify text is selected
      const selection = window.getSelection()!
      expect(selection.toString()).toBe('Document Title')

      // Navigate down with arrow key
      await user.keyboard('{ArrowDown}')

      // Should be in second block
      await waitFor(() => {
        const block2El = getContentEditable().querySelector('[data-block-id="block-2"] .block__content')
        expect(document.activeElement).toBe(block2El)
      })

      // Test Home/End keys
      await user.keyboard('{End}')
      await user.type(getContentEditable(), ' - edited')

      await waitFor(() => {
        expect(store.getState().blocks[1].content).toBe('First paragraph - edited')
      })

      // Test Ctrl+Shift+ArrowUp (select to previous block)
      await user.keyboard('{Control>}{Shift>}{ArrowUp}{/Shift}{/Control}')

      // Should have cross-block selection
      await waitFor(() => {
        expect(store.getState().crossBlockSelection).not.toBeNull()
      })
    })
  })

  describe('✅ Focus Management', () => {
    it('maintains focus correctly through various operations', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Start by focusing the title
      const titleElement = screen.getByRole('heading', { level: 1 })
      await user.click(titleElement)
      expect(document.activeElement).toBe(titleElement)

      // Press Enter to move to editor
      await user.keyboard('{Enter}')

      // Focus should be in the content editable container
      await waitFor(() => {
        expect(document.activeElement).toBe(getContentEditable())
      })

      // Type some text and apply formatting
      const firstBlock = store.getState().blocks[0]
      await typeInBlock(firstBlock.id, 'Test focus management')

      // Select text and show toolbar
      selectText(firstBlock.id, 5, 10)

      // Toolbar should appear but focus should remain in editor
      await waitFor(() => {
        expect(screen.getByRole('toolbar')).toBeInTheDocument()
        expect(document.activeElement).toBe(getContentEditable())
      })

      // Click formatting button
      const boldButton = screen.getByLabelText('Bold')
      await user.click(boldButton)

      // Focus should return to editor after formatting
      await waitFor(() => {
        expect(document.activeElement).toBe(getContentEditable())
      })

      // Open slash menu
      await user.keyboard('{End}{Enter}/')

      // Focus should still be in editor even with menu open
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(document.activeElement).toBe(getContentEditable())

      // Escape should close menu and maintain focus
      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        expect(document.activeElement).toBe(getContentEditable())
      })
    })
  })

  describe('✅ Real-world Writing Scenarios', () => {
    it('supports writing a technical blog post with code blocks and formatting', async () => {
      const { store } = renderWithEditor(<Editor />)

      // Set title
      const titleElement = screen.getByRole('heading', { level: 1 })
      await user.click(titleElement)
      await user.clear(titleElement)
      await user.type(titleElement, 'Understanding React Hooks')
      await user.keyboard('{Enter}')

      // Add introduction heading
      await user.keyboard('/h2{Enter}')
      await user.type(getContentEditable(), 'Introduction')
      await user.keyboard('{Enter}')

      // Add intro paragraph with formatted text
      await user.type(getContentEditable(), 'React Hooks revolutionized how we write components. The ')
      await user.type(getContentEditable(), 'useState')

      // Format 'useState' as code
      const currentBlock = store.getState().blocks[1]
      selectText(currentBlock.id, 56, 64) // Select 'useState'

      // Apply code formatting (using italic as code format for now)
      await user.keyboard('{Control>}i{/Control}')

      // Continue typing
      await user.keyboard('{End}')
      await user.type(getContentEditable(), ' and ')
      await user.type(getContentEditable(), 'useEffect')

      // Format 'useEffect' as code
      selectText(currentBlock.id, 69, 78)
      await user.keyboard('{Control>}i{/Control}')

      await user.keyboard('{End}')
      await user.type(getContentEditable(), ' hooks are the most commonly used.')

      // Add a new section
      await user.keyboard('{Enter}/h2{Enter}')
      await user.type(getContentEditable(), 'Basic Example')
      await user.keyboard('{Enter}')

      // Add explanation
      await user.type(getContentEditable(), "Here's a simple counter component:")
      await user.keyboard('{Enter}')

      // Add bullet points for key concepts
      await user.keyboard('/bullet{Enter}')
      await user.type(getContentEditable(), 'State is preserved between renders')
      await user.keyboard('{Enter}')
      await user.type(getContentEditable(), 'Hooks must be called at the top level')
      await user.keyboard('{Enter}')
      await user.type(getContentEditable(), 'Custom hooks enable code reuse')

      // Verify the document structure
      const blocks = store.getState().blocks
      expect(blocks).toHaveLength(7)
      expect(blocks[0].type).toBe('h2')
      expect(blocks[0].content).toBe('Introduction')
      expect(blocks[1].type).toBe('paragraph')
      expect(blocks[1].formatting?.length || 0).toBeGreaterThan(0) // Has code formatting
      expect(blocks[4].type).toBe('bullet')
      expect(blocks[5].type).toBe('bullet')
      expect(blocks[6].type).toBe('bullet')
    })
  })
})
