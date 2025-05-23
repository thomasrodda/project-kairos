// Workspace types
export interface Workspace {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// Page types
export interface Page {
  id: string
  workspaceId: string
  parentId?: string
  title: string
  order: number
  isFolder: boolean
  createdAt: Date
  updatedAt: Date
}

// Block types
export interface Block {
  id: string
  pageId: string
  type: 'heading1' | 'heading2' | 'paragraph' | 'bullet'
  content: string
  order: number
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}
