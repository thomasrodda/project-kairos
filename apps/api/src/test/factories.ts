import { User, Workspace, Page, Block } from '@kairos/database'
import { BlockType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

// User factory
export function createUser(overrides: Partial<User> = {}): User {
  const id = overrides.id || uuidv4()
  return {
    id,
    firebaseUid: `firebase-${id}`,
    email: `user-${id}@example.com`,
    displayName: `Test User ${id}`,
    photoURL: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Workspace factory
export function createWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  const id = overrides.id || uuidv4()
  return {
    id,
    name: `Workspace ${id}`,
    userId: overrides.userId || uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Page factory
export function createPage(overrides: Partial<Page> = {}): Page {
  const id = overrides.id || uuidv4()
  return {
    id,
    title: `Page ${id}`,
    isFolder: false,
    workspaceId: overrides.workspaceId || uuidv4(),
    parentId: null,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Block factory
export function createBlock(overrides: Partial<Block> = {}): Block {
  const id = overrides.id || uuidv4()
  return {
    id,
    type: BlockType.PARAGRAPH,
    content: `Block content ${id}`,
    metadata: null,
    pageId: overrides.pageId || uuidv4(),
    order: 0,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Block
}

// Factory to create a workspace with pages
export function createWorkspaceWithPages(
  workspaceOverrides: Partial<Workspace> = {},
  pageCount: number = 3
): { workspace: Workspace; pages: Page[] } {
  const workspace = createWorkspace(workspaceOverrides)
  const pages = Array.from({ length: pageCount }, (_, i) =>
    createPage({
      workspaceId: workspace.id,
      order: i,
      title: `Page ${i + 1}`,
    })
  )

  return { workspace, pages }
}

// Factory to create a complete user with workspace and pages
export function createCompleteUserData(
  userOverrides: Partial<User> = {},
  workspaceCount: number = 2,
  pagesPerWorkspace: number = 3
): {
  user: User
  workspaces: Array<{ workspace: Workspace; pages: Page[] }>
} {
  const user = createUser(userOverrides)
  const workspaces = Array.from({ length: workspaceCount }, (_, i) => {
    const { workspace, pages } = createWorkspaceWithPages(
      {
        userId: user.id,
        name: `${user.displayName}'s Workspace ${i + 1}`,
      },
      pagesPerWorkspace
    )
    return { workspace, pages }
  })

  return { user, workspaces }
}
