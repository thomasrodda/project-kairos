// apps/web/src/components/Editor/SlashCommandMenu/SlashCommandMenu.test.tsx
// Tests for the slash command menu component

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlashCommandMenu } from './SlashCommandMenu'
import { BlockType } from '../../../contexts/EditorContext'

describe('SlashCommandMenu', () => {
  const mockOnSelect = jest.fn()
  const mockOnClose = jest.fn()
  const defaultPosition = { top: 100, left: 50 }

  const renderComponent = () => {
    return render(<SlashCommandMenu position={defaultPosition} onSelect={mockOnSelect} onClose={mockOnClose} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Core Functionality', () => {
    it('renders all block type options', () => {
      renderComponent()

      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.getByText('Heading 3')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Bullet List')).toBeInTheDocument()
    })

    it('shows shortcuts for block types', () => {
      renderComponent()

      expect(screen.getByText('#')).toBeInTheDocument()
      expect(screen.getByText('##')).toBeInTheDocument()
      expect(screen.getByText('###')).toBeInTheDocument()
      expect(screen.getByText('p')).toBeInTheDocument()
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('positions the menu correctly', () => {
      renderComponent()
      const menu = screen.getByRole('textbox').closest('.slash-command-menu')

      expect(menu).toHaveStyle({
        top: '100px',
        left: '50px',
      })
    })

    it('focuses search input on mount', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      await waitFor(() => {
        expect(searchInput).toHaveFocus()
      })
    })
  })

  describe('✅ Search Functionality', () => {
    it('filters options based on search query', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      await userEvent.type(searchInput, 'head')

      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.getByText('Heading 3')).toBeInTheDocument()
      expect(screen.queryByText('Paragraph')).not.toBeInTheDocument()
      expect(screen.queryByText('Bullet List')).not.toBeInTheDocument()
    })

    it('filters by block type', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      await userEvent.type(searchInput, 'h1')

      expect(screen.getByText('Heading 1')).toBeInTheDocument()
      expect(screen.queryByText('Heading 2')).not.toBeInTheDocument()
    })

    it('filters by shortcut', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      await userEvent.type(searchInput, '##')

      expect(screen.getByText('Heading 2')).toBeInTheDocument()
      expect(screen.queryByText('Heading 1')).not.toBeInTheDocument()
    })

    it('shows empty state when no matches', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      await userEvent.type(searchInput, 'xyz')

      expect(screen.getByText('No matching block types')).toBeInTheDocument()
    })

    it('resets selected index when filter changes', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      // Initially first option is selected
      expect(screen.getAllByRole('button')[0]).toHaveClass('slash-command-menu__option--selected')

      // Type to filter
      await userEvent.type(searchInput, 'bullet')

      // First filtered option should be selected
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveClass('slash-command-menu__option--selected')
    })
  })

  describe('✅ Keyboard Navigation', () => {
    it('navigates down with arrow key', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' })

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[1]).toHaveClass('slash-command-menu__option--selected')
      })
    })

    it('navigates up with arrow key', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      // Go to last item
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' })

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[buttons.length - 1]).toHaveClass('slash-command-menu__option--selected')
      })
    })

    it('wraps navigation at boundaries', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')
      const buttons = screen.getAllByRole('button')

      // Navigate past last item
      for (let i = 0; i < buttons.length; i++) {
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
      }

      await waitFor(() => {
        // Should wrap to first
        expect(buttons[0]).toHaveClass('slash-command-menu__option--selected')
      })
    })

    it('selects option with Enter key', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' })

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons[1]).toHaveClass('slash-command-menu__option--selected')
      })

      fireEvent.keyDown(searchInput, { key: 'Enter' })

      expect(mockOnSelect).toHaveBeenCalledWith('h2' as BlockType)
    })

    it('closes menu with Escape key', () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      fireEvent.keyDown(searchInput, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('✅ Mouse Interaction', () => {
    it('selects option on click', () => {
      renderComponent()
      const h2Button = screen.getByText('Heading 2').closest('button')!

      fireEvent.click(h2Button)

      expect(mockOnSelect).toHaveBeenCalledWith('h2' as BlockType)
    })

    it('highlights option on mouse enter', () => {
      renderComponent()
      const buttons = screen.getAllByRole('button')
      const h3Button = buttons[2]

      fireEvent.mouseEnter(h3Button)

      expect(h3Button).toHaveClass('slash-command-menu__option--selected')
    })

    it('closes menu on outside click', () => {
      const { container } = renderComponent()

      // Click outside the menu
      fireEvent.mouseDown(container)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('✅ Edge Cases', () => {
    it('handles selection when no options match filter', () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      // Filter to no results
      fireEvent.change(searchInput, { target: { value: 'xyz' } })

      // Try to select with Enter
      fireEvent.keyDown(searchInput, { key: 'Enter' })

      expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('maintains focus on search input during navigation', async () => {
      renderComponent()
      const searchInput = screen.getByPlaceholderText('Search block types...')

      // Wait for initial focus
      await waitFor(() => {
        expect(searchInput).toHaveFocus()
      })

      fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
      fireEvent.keyDown(searchInput, { key: 'ArrowUp' })

      expect(searchInput).toHaveFocus()
    })
  })
})
