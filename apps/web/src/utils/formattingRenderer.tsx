import React from 'react'
import { TextFormat, FormatType } from '../contexts/EditorContext'
import { splitIntoSegments, TextSegment } from './textFormatting'

export interface FormattingRendererProps {
  content: string
  formatting?: TextFormat[]
}

function renderSegment(segment: TextSegment, index: number): React.ReactElement {
  const { text, formats } = segment

  if (formats.length === 0) {
    return <React.Fragment key={index}>{text}</React.Fragment>
  }

  // Sort formats to ensure consistent nesting order
  const sortedFormats = [...formats].sort((a, b) => {
    const order: FormatType[] = ['link', 'code', 'bold', 'italic', 'strikethrough']
    return order.indexOf(a) - order.indexOf(b)
  })

  // Build nested elements from inside out
  let element: React.ReactElement = <React.Fragment>{text}</React.Fragment>

  // Apply formats in reverse order so the first format is the outermost element
  for (let i = sortedFormats.length - 1; i >= 0; i--) {
    const format = sortedFormats[i]

    switch (format) {
      case 'bold':
        element = <strong>{element}</strong>
        break
      case 'italic':
        element = <em>{element}</em>
        break
      case 'strikethrough':
        element = <del>{element}</del>
        break
      case 'code':
        element = <code>{element}</code>
        break
      case 'link': {
        // Find the link formatting for this segment
        const linkFormat = segment.formats.find((f) => f === 'link')
        if (linkFormat) {
          // For now, we'll need to pass URL data differently
          // This is a placeholder - we'll need to enhance FormattedText to include URLs
          element = (
            <a href="#" onClick={(e) => e.preventDefault()}>
              {element}
            </a>
          )
        }
        break
      }
    }
  }

  return <React.Fragment key={index}>{element}</React.Fragment>
}

export function renderFormattedText({ content, formatting = [] }: FormattingRendererProps): React.ReactElement {
  if (!formatting || formatting.length === 0) {
    return <React.Fragment>{content}</React.Fragment>
  }

  const segments = splitIntoSegments(content, formatting)

  return <React.Fragment>{segments.map((segment, index) => renderSegment(segment, index))}</React.Fragment>
}
