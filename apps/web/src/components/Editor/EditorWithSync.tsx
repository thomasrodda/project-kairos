import React from 'react'
import { Editor } from './Editor'
import { EditorLoading } from './EditorLoading'
import { EditorError } from './EditorError'
import { useEditorSync } from '../../contexts/EditorProvider'

export function EditorWithSync() {
  const { loading, error } = useEditorSync()

  if (loading) {
    return <EditorLoading />
  }

  if (error) {
    return <EditorError error={error} onRetry={() => window.location.reload()} />
  }

  return <Editor />
}
