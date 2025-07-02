// apps/web/src/components/Editor/ContentEditableContainer/ContentEditableContainer.markdown.test.tsx

import React from 'react'
import { waitFor, act, fireEvent } from '@testing-library/react'
import { ContentEditableContainer } from './ContentEditableContainer'
import { renderWithEditor } from '../../../test/utils'
import type { EditorBlock } from '../../../contexts/EditorContext'
import { shouldConvertMarkdown, convertMarkdownToFormatting } from '../../../utils/markdownDetection'
import '@testing-library/jest-dom'

describe('ContentEditableContainer - Markdown Detection', () => {
  // Test the markdown detection utilities first
  describe('Markdown Detection Utilities', () => {
    it('should detect bold markdown pattern', () => {
      const text = 'This is **bold**'
      const result = shouldConvertMarkdown(text, text.length, '*')
      expect(result).toBeTruthy()
      expect(result?.format).toBe('bold')
    })

    it('should detect italic markdown pattern', () => {
      const text = 'This is *italic*'
      const result = shouldConvertMarkdown(text, text.length, '*')
      expect(result).toBeTruthy()
      expect(result?.format).toBe('italic')
    })

    it('should detect code markdown pattern', () => {
      const text = 'This is `code`'
      const result = shouldConvertMarkdown(text, text.length, '`')
      expect(result).toBeTruthy()
      expect(result?.format).toBe('code')
    })

    it('should detect strikethrough markdown pattern', () => {
      const text = 'This is ~~strikethrough~~'
      const result = shouldConvertMarkdown(text, text.length, '~')
      expect(result).toBeTruthy()
      expect(result?.format).toBe('strikethrough')
    })

    it('should detect link markdown pattern', () => {
      const text = 'This is [a link](https://example.com)'
      const result = shouldConvertMarkdown(text, text.length, ')')
      expect(result).toBeTruthy()
      expect(result?.format).toBe('link')
    })

    it('should not detect incomplete patterns', () => {
      expect(shouldConvertMarkdown('This is **bold*', 15, '*')).toBeFalsy()
      expect(shouldConvertMarkdown('This is *italic', 15, 'c')).toBeFalsy()
      expect(shouldConvertMarkdown('This is `code', 13, 'e')).toBeFalsy()
    })
  })

  // Test the integration with ContentEditableContainer
  describe('ContentEditableContainer Integration', () => {
    const renderContainer = (blocks: EditorBlock[] = [{ id: '1', type: 'paragraph', content: '' }]) => {
      return renderWithEditor(
        <div className="editor-container">
          <ContentEditableContainer>
            <div className="block" data-block-id="1">
              <div className="block__content" data-block-id="1">
                <span>{blocks[0].content}</span>
              </div>
            </div>
          </ContentEditableContainer>
        </div>,
        { initialBlocks: blocks }
      )
    }

    it('should handle typing and state updates', async () => {
      const { container, store } = renderContainer()
      const contentEditable = container.querySelector('.content-editable-container') as HTMLElement

      // Simulate updating block content through store (as would happen via beforeinput)
      act(() => {
        store.dispatch({ type: 'UPDATE_BLOCK', blockId: '1', content: 'This is **bold**' })
      })

      // When markdown is detected, the ContentEditableContainer should:
      // 1. Remove the markdown syntax
      // 2. Apply formatting
      const detectedPattern = shouldConvertMarkdown('This is **bold**', 16, '*')
      if (detectedPattern) {
        const { newText, format, range } = convertMarkdownToFormatting('This is **bold**', detectedPattern)

        act(() => {
          store.dispatch({ type: 'UPDATE_BLOCK', blockId: '1', content: newText })
          store.dispatch({
            type: 'APPLY_FORMATTING',
            blockId: '1',
            format,
            range,
          })
        })
      }

      const state = store.getState()
      expect(state.blocks[0].content).toBe('This is bold')
      expect(state.blocks[0].formatting).toBeDefined()
      expect(state.blocks[0].formatting?.[0]).toMatchObject({
        type: 'bold',
        start: 8,
        end: 12,
      })
    })

    it('should convert markdown patterns on last character input', () => {
      // Test the conversion logic
      const conversions = [
        {
          text: 'This is **bold**',
          lastChar: '*',
          expectedContent: 'This is bold',
          expectedFormat: 'bold',
          expectedRange: { start: 8, end: 12 },
        },
        {
          text: 'This is *italic*',
          lastChar: '*',
          expectedContent: 'This is italic',
          expectedFormat: 'italic',
          expectedRange: { start: 8, end: 14 },
        },
        {
          text: 'This is `code`',
          lastChar: '`',
          expectedContent: 'This is code',
          expectedFormat: 'code',
          expectedRange: { start: 8, end: 12 },
        },
        {
          text: 'This is ~~strikethrough~~',
          lastChar: '~',
          expectedContent: 'This is strikethrough',
          expectedFormat: 'strikethrough',
          expectedRange: { start: 8, end: 21 },
        },
        {
          text: 'This is [a link](https://example.com)',
          lastChar: ')',
          expectedContent: 'This is a link',
          expectedFormat: 'link',
          expectedRange: { start: 8, end: 14 },
        },
      ]

      conversions.forEach(({ text, lastChar, expectedContent, expectedFormat, expectedRange }) => {
        const pattern = shouldConvertMarkdown(text, text.length, lastChar)
        expect(pattern).toBeTruthy()

        if (pattern) {
          const result = convertMarkdownToFormatting(text, pattern)
          expect(result.newText).toBe(expectedContent)
          expect(result.format).toBe(expectedFormat)
          expect(result.range).toEqual(expectedRange)
        }
      })
    })

    it('should not convert incomplete markdown patterns', () => {
      const incompletePatterns = [
        { text: 'This is **bold*', lastChar: '*', cursorPos: 15 },
        { text: 'This is *italic', lastChar: 'c', cursorPos: 15 },
        { text: 'This is `code', lastChar: 'e', cursorPos: 13 },
        { text: 'This is ~~strike~', lastChar: '~', cursorPos: 17 },
        { text: 'This is [link](', lastChar: '(', cursorPos: 15 },
      ]

      incompletePatterns.forEach(({ text, lastChar, cursorPos }) => {
        const pattern = shouldConvertMarkdown(text, cursorPos, lastChar)
        expect(pattern).toBeFalsy()
      })
    })

    it('should handle multiple patterns in sequence', () => {
      const { store } = renderContainer()

      // Simulate typing text with multiple markdown patterns
      const steps = [
        { content: '**Bold**', format: 'bold', range: { start: 0, end: 4 } },
        { content: 'Bold and *italic*', format: 'italic', range: { start: 9, end: 15 } },
        { content: 'Bold and italic and `code`', format: 'code', range: { start: 20, end: 24 } },
      ]

      steps.forEach((step, index) => {
        // For each step after the first, we need to account for previous conversions
        let currentContent = step.content

        // Apply all previous conversions
        for (let i = 0; i < index; i++) {
          const prevStep = steps[i]
          const pattern = shouldConvertMarkdown(prevStep.content, prevStep.content.length, prevStep.content[prevStep.content.length - 1])
          if (pattern) {
            const { newText } = convertMarkdownToFormatting(prevStep.content, pattern)
            // Update the current content based on previous conversion
            currentContent = currentContent.replace(
              prevStep.content.match(/\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~|\[.*?\]\(.*?\)/)?.[0] || '',
              newText.match(/\w+/)?.[0] || ''
            )
          }
        }

        act(() => {
          store.dispatch({ type: 'UPDATE_BLOCK', blockId: '1', content: currentContent })
        })
      })
    })
  })
})
