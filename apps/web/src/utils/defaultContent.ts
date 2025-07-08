// apps/web/src/utils/defaultContent.ts
// Default content generator for new workspaces, providing a helpful onboarding experience
// that showcases editor features and helps users get started.

import { generateId } from '@kairos/utils'
import { EditorBlock, TextFormat } from '../contexts/EditorContext'

/**
 * Generates welcome page content for new workspaces
 * @returns Array of EditorBlock objects with formatted content
 */
export function generateWelcomePageContent(): EditorBlock[] {
  return [
    {
      id: generateId(),
      type: 'h1',
      content: 'Welcome to Your Workspace',
      metadata: {
        placeholder: 'Heading 1',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'This is your creative writing and worldbuilding workspace. Here you can organize your ideas, write your stories, and build immersive worlds for your novels or campaigns.',
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'h2',
      content: 'Getting Started',
      metadata: {
        placeholder: 'Heading 2',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: 'Try these powerful features to enhance your writing experience:',
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'Slash Commands - Type "/" at the beginning of any block to see available block types. Transform paragraphs into headings, lists, and more.',
      formatting: [
        {
          start: 0,
          end: 14,
          type: 'bold',
        },
        {
          start: 22,
          end: 25,
          type: 'code',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'Text Formatting - Select any text and use the formatting toolbar, or use keyboard shortcuts: Ctrl/Cmd+B for bold, Ctrl/Cmd+I for italic, Ctrl/Cmd+U for underline, and Ctrl/Cmd+K for links.',
      formatting: [
        {
          start: 0,
          end: 15,
          type: 'bold',
        },
        {
          start: 90,
          end: 99,
          type: 'code',
        },
        {
          start: 104,
          end: 108,
          type: 'bold',
        },
        {
          start: 110,
          end: 119,
          type: 'code',
        },
        {
          start: 124,
          end: 130,
          type: 'italic',
        },
        {
          start: 132,
          end: 141,
          type: 'code',
        },
        {
          start: 146,
          end: 155,
          type: 'underline',
        },
        {
          start: 161,
          end: 170,
          type: 'code',
        },
        {
          start: 175,
          end: 180,
          type: 'link',
          url: 'https://kairos.app',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: 'Drag and Drop - Hover over any block to reveal the drag handle. Click and drag to reorder your content effortlessly.',
      formatting: [
        {
          start: 0,
          end: 13,
          type: 'bold',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'Multi-Block Selection - Hold Shift and click to select multiple blocks, or use Ctrl/Cmd+click to toggle individual block selection. Perfect for organizing large sections of content.',
      formatting: [
        {
          start: 0,
          end: 21,
          type: 'bold',
        },
        {
          start: 29,
          end: 34,
          type: 'code',
        },
        {
          start: 79,
          end: 92,
          type: 'code',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'h2',
      content: 'Try These Features',
      metadata: {
        placeholder: 'Heading 2',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'This paragraph demonstrates various text formatting options. You can make text bold, italic, underlined, or even combine multiple formats together. Try selecting this text to see the formatting toolbar!',
      formatting: [
        {
          start: 77,
          end: 81,
          type: 'bold',
        },
        {
          start: 83,
          end: 89,
          type: 'italic',
        },
        {
          start: 91,
          end: 101,
          type: 'underline',
        },
        {
          start: 110,
          end: 138,
          type: 'bold',
        },
        {
          start: 110,
          end: 138,
          type: 'italic',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'Create lists to organize your thoughts',
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'Press Enter to create a new list item',
      formatting: [
        {
          start: 6,
          end: 11,
          type: 'code',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'Press Tab to indent (coming soon)',
      formatting: [
        {
          start: 6,
          end: 9,
          type: 'code',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'Press Backspace on an empty item to exit the list',
      formatting: [
        {
          start: 6,
          end: 15,
          type: 'code',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'h3',
      content: 'Ready to Create?',
      metadata: {
        placeholder: 'Heading 3',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'Delete these blocks and start writing your own content. Your workspace will automatically save your changes as you type. Happy writing!',
      metadata: {
        placeholder: 'Start writing...',
      },
    },
  ]
}

/**
 * Generates a minimal empty page with just a title and paragraph
 * @param title - Optional title for the page
 * @returns Array of EditorBlock objects
 */
export function generateEmptyPageContent(title: string = 'Untitled'): EditorBlock[] {
  return [
    {
      id: generateId(),
      type: 'h1',
      content: title,
      metadata: {
        placeholder: 'Heading 1',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: '',
      metadata: {
        placeholder: 'Start writing...',
      },
    },
  ]
}

/**
 * Generates example content for demonstration purposes
 * @returns Array of EditorBlock objects with rich formatting
 */
export function generateExampleContent(): EditorBlock[] {
  return [
    {
      id: generateId(),
      type: 'h1',
      content: 'The Adventure Begins',
      metadata: {
        placeholder: 'Heading 1',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'The ancient tome lay open on the dusty table, its pages yellowed with age. Strange symbols danced before my eyes, seeming to shift and change as I watched.',
      formatting: [
        {
          start: 4,
          end: 16,
          type: 'italic',
        },
        {
          start: 69,
          end: 84,
          type: 'bold',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'h2',
      content: 'Chapter 1: Discovery',
      metadata: {
        placeholder: 'Heading 2',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content:
        'I had stumbled upon the hidden library quite by accident. While exploring the abandoned mansion, a loose floorboard had given way beneath my feet, revealing a spiral staircase descending into darkness.',
      formatting: [
        {
          start: 24,
          end: 38,
          type: 'italic',
        },
        {
          start: 162,
          end: 178,
          type: 'bold',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
    {
      id: generateId(),
      type: 'h3',
      content: 'What I Found',
      metadata: {
        placeholder: 'Heading 3',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'Rows upon rows of ancient books',
      formatting: [
        {
          start: 18,
          end: 31,
          type: 'italic',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'A desk covered in cryptic notes and diagrams',
      formatting: [
        {
          start: 18,
          end: 31,
          type: 'bold',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'bullet',
      content: 'The mysterious tome that would change everything',
      formatting: [
        {
          start: 4,
          end: 19,
          type: 'italic',
        },
        {
          start: 4,
          end: 19,
          type: 'bold',
        },
      ],
      metadata: {
        placeholder: 'List item',
      },
    },
    {
      id: generateId(),
      type: 'paragraph',
      content: 'As I reached for the book, a voice whispered from the shadows...',
      formatting: [
        {
          start: 30,
          end: 45,
          type: 'italic',
        },
      ],
      metadata: {
        placeholder: 'Start writing...',
      },
    },
  ]
}
