// API Types matching backend models

export interface User {
  id: string
  firebaseUid: string
  email: string
  displayName?: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  userId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  workspaceId: string
  parentId?: string
  title: string
  icon?: string
  order: number
  isFolder: boolean
  createdAt: string
  updatedAt: string
  children?: Page[] // For hierarchical structure
}

export interface Block {
  id: string
  pageId: string
  type: 'PARAGRAPH' | 'HEADING1' | 'HEADING2' | 'HEADING3' | 'BULLET'
  content: string
  metadata?: {
    formatting?: TextFormat[]
    [key: string]: any
  }
  order: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface TextFormat {
  start: number
  end: number
  type: 'bold' | 'italic' | 'underline' | 'link'
  data?: { url: string }
}

// Request/Response types
export interface CreateBlockRequest {
  pageId: string
  type: Block['type']
  content: string
  order?: number
  metadata?: Block['metadata']
}

export interface UpdateBlockRequest {
  content?: string
  type?: Block['type']
  metadata?: Block['metadata']
  version?: number
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete'
  data: {
    id?: string
    pageId?: string
    type?: Block['type']
    content?: string
    order?: number
    metadata?: Block['metadata']
    version?: number
  }
}

export interface ReorderBlocksRequest {
  pageId: string
  blockOrders: Array<{ id: string; order: number }>
}

// Sync status for tracking save state
export type SyncStatus = 'saved' | 'saving' | 'error' | 'offline'

export interface BlockSyncState {
  id: string
  status: SyncStatus
  lastSaved?: string
  error?: string
  retryCount?: number
}
