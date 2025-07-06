import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { requireSocketAuth } from '../middleware/socketAuth'
import { syncService } from '../services/syncService'

export interface AuthenticatedSocket extends Socket {
  userId?: string
  workspaceId?: string
}

export function createSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.VITE_API_URL || 'http://localhost:3000',
      credentials: true,
    },
    // Connection options
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Apply authentication middleware
  io.use(requireSocketAuth)

  // Handle connections
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected from socket ${socket.id}`)

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Handle joining workspace rooms
    socket.on('join:workspace', async (workspaceId: string) => {
      try {
        // Verify user has access to workspace
        const hasAccess = await syncService.verifyWorkspaceAccess(workspaceId, socket.userId!)

        if (hasAccess) {
          socket.workspaceId = workspaceId
          socket.join(`workspace:${workspaceId}`)
          socket.emit('joined:workspace', { workspaceId })
          console.log(`User ${socket.userId} joined workspace ${workspaceId}`)
        } else {
          socket.emit('error', { message: 'Access denied to workspace' })
        }
      } catch (error) {
        console.error('Error joining workspace:', error)
        socket.emit('error', { message: 'Failed to join workspace' })
      }
    })

    // Handle leaving workspace rooms
    socket.on('leave:workspace', (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`)
      socket.emit('left:workspace', { workspaceId })
      console.log(`User ${socket.userId} left workspace ${workspaceId}`)
    })

    // Handle joining page rooms for real-time collaboration
    socket.on('join:page', async (pageId: string) => {
      try {
        // Verify user has access to page
        const hasAccess = await syncService.verifyPageAccess(pageId, socket.userId!)

        if (hasAccess) {
          socket.join(`page:${pageId}`)

          // Notify others in the page
          socket.to(`page:${pageId}`).emit('user:joined', {
            userId: socket.userId,
            pageId,
          })

          // Get current users in the page
          const users = await syncService.getPageUsers(pageId)
          socket.emit('joined:page', { pageId, users })

          console.log(`User ${socket.userId} joined page ${pageId}`)
        } else {
          socket.emit('error', { message: 'Access denied to page' })
        }
      } catch (error) {
        console.error('Error joining page:', error)
        socket.emit('error', { message: 'Failed to join page' })
      }
    })

    // Handle leaving page rooms
    socket.on('leave:page', (pageId: string) => {
      socket.leave(`page:${pageId}`)

      // Notify others in the page
      socket.to(`page:${pageId}`).emit('user:left', {
        userId: socket.userId,
        pageId,
      })

      socket.emit('left:page', { pageId })
      console.log(`User ${socket.userId} left page ${pageId}`)
    })

    // Handle block updates
    socket.on('block:update', async (data: { pageId: string; blockId: string; content: string; version: number }) => {
      try {
        // Broadcast to others in the same page
        socket.to(`page:${data.pageId}`).emit('block:updated', {
          ...data,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        })

        // Track active edit
        await syncService.trackActiveEdit(data.blockId, socket.userId!)
      } catch (error) {
        console.error('Error broadcasting block update:', error)
      }
    })

    // Handle cursor position updates
    socket.on('cursor:update', (data: { pageId: string; blockId: string; position: number }) => {
      // Broadcast cursor position to others in the same page
      socket.to(`page:${data.pageId}`).emit('cursor:updated', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle selection updates
    socket.on('selection:update', (data: { pageId: string; blockId: string; start: number; end: number }) => {
      // Broadcast selection to others in the same page
      socket.to(`page:${data.pageId}`).emit('selection:updated', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle block creation
    socket.on('block:create', (data: { pageId: string; blockId: string; type: string; content: string; order: number }) => {
      // Broadcast to others in the same page
      socket.to(`page:${data.pageId}`).emit('block:created', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle block deletion
    socket.on('block:delete', (data: { pageId: string; blockId: string }) => {
      // Broadcast to others in the same page
      socket.to(`page:${data.pageId}`).emit('block:deleted', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle block reordering
    socket.on('blocks:reorder', (data: { pageId: string; blocks: Array<{ id: string; order: number }> }) => {
      // Broadcast to others in the same page
      socket.to(`page:${data.pageId}`).emit('blocks:reordered', {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle page updates
    socket.on('page:update', (data: { pageId: string; title: string }) => {
      // Broadcast to others in the workspace
      if (socket.workspaceId) {
        socket.to(`workspace:${socket.workspaceId}`).emit('page:updated', {
          ...data,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected from socket ${socket.id}`)

      // Clear any active edits
      if (socket.userId) {
        await syncService.clearUserActiveEdits(socket.userId)
      }

      // Notify pages that user left
      const rooms = Array.from(socket.rooms)
      for (const room of rooms) {
        if (room.startsWith('page:')) {
          const pageId = room.replace('page:', '')
          socket.to(room).emit('user:left', {
            userId: socket.userId,
            pageId,
          })
        }
      }
    })
  })

  return io
}

// Utility function to emit events to specific users
export function emitToUser(io: SocketIOServer, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data)
}

// Utility function to emit events to workspace members
export function emitToWorkspace(io: SocketIOServer, workspaceId: string, event: string, data: any) {
  io.to(`workspace:${workspaceId}`).emit(event, data)
}

// Utility function to emit events to page collaborators
export function emitToPage(io: SocketIOServer, pageId: string, event: string, data: any) {
  io.to(`page:${pageId}`).emit(event, data)
}
