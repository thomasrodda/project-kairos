// apps/web/src/components/Editor/PageTitle/PageTitle.tsx
// Editable page title component that appears at the top of every page.
// Cannot be deleted, only edited. Defaults to "New Page" for new documents.
// Updates are saved to the editor state as the user types.

import { useRef, useEffect, useState } from 'react'
import { useEditorDispatch } from '../../../contexts/EditorContext'
import './PageTitle.scss'

interface PageTitleProps {
  title: string
}

export function PageTitle({ title }: PageTitleProps) {
  const dispatch = useEditorDispatch()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update content when title prop changes (but not during typing)
  useEffect(() => {
    if (!isUpdating && titleRef.current) {
      // Only update if content is different
      const currentContent = titleRef.current.textContent || ''
      if (currentContent !== title) {
        titleRef.current.textContent = title
      }
    }
  }, [title, isUpdating])

  // Handle title changes
  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    setIsUpdating(true)
    const newTitle = e.currentTarget.textContent || ''
    dispatch({ type: 'UPDATE_TITLE', title: newTitle })

    // Reset updating flag after a short delay
    setTimeout(() => setIsUpdating(false), 10)
  }

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    // Prevent Enter key from creating line breaks in title
    if (e.key === 'Enter') {
      e.preventDefault()
      // Blur the title to move focus away
      e.currentTarget.blur()
    }
  }

  // Handle paste to strip formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLHeadingElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const selection = window.getSelection()
    if (!selection?.rangeCount) return

    selection.deleteFromDocument()
    selection.getRangeAt(0).insertNode(document.createTextNode(text))
  }

  return (
    <h1
      ref={titleRef}
      className="page-title"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      data-placeholder="New Page"
    />
  )
}
