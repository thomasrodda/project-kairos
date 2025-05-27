// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client'

// Declare global type for Prisma client caching
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// Create a singleton Prisma client for development
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Use global variable in development to prevent exhausting database connections
const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }
export * from '@prisma/client'

// Type exports for convenience
export type { User, Workspace, Page, Block, Link, BlockType } from '@prisma/client'
