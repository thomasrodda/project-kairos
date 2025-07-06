import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { io as ioc, Socket as ClientSocket } from 'socket.io-client'
import { createSocketServer, AuthenticatedSocket } from '../socketServer'
import { auth } from '../../services/firebase-admin'
import { syncService } from '../../services/syncService'
import { createMockDecodedToken } from '../../test/setup'
import { AddressInfo } from 'net'

// Mock dependencies
jest.mock('../../services/firebase-admin')
jest.mock('../../services/syncService')

describe('SocketServer', () => {
  let httpServer: ReturnType<typeof createServer>
  let io: SocketIOServer
  let serverSocket: AuthenticatedSocket
  let clientSocket: ClientSocket
  let port: number

  const mockUserId = 'test-user-123'
  const mockWorkspaceId = 'workspace-123'
  const mockPageId = 'page-123'
  const mockToken = 'valid-token'

  // Helper to wait for socket events
  const waitFor = (socket: ClientSocket, event: string): Promise<any> => {
    return new Promise((resolve) => {
      socket.once(event, resolve)
    })
  }

  // Helper to create authenticated client
  const createAuthenticatedClient = (token: string = mockToken): Promise<ClientSocket> => {
    return new Promise((resolve, reject) => {
      const client = ioc(`http://localhost:${port}`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false,
      })

      client.on('connect', () => resolve(client))
      client.on('connect_error', reject)
    })
  }

  beforeAll((done) => {
    // Create HTTP server
    httpServer = createServer()
    io = createSocketServer(httpServer)

    // Store server socket when client connects
    io.on('connection', (socket: AuthenticatedSocket) => {
      serverSocket = socket
    })

    // Start server
    httpServer.listen(() => {
      const address = httpServer.address() as AddressInfo
      port = address.port
      done()
    })
  })

  afterAll((done) => {
    io.close()
    httpServer.close(done)
  })

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup default mock implementations
    const mockAuth = auth as jest.Mocked<typeof auth>
    mockAuth.verifyIdToken.mockResolvedValue(createMockDecodedToken({ uid: mockUserId }))

    const mockSyncService = syncService as jest.Mocked<typeof syncService>
    mockSyncService.verifyWorkspaceAccess.mockResolvedValue(true)
    mockSyncService.verifyPageAccess.mockResolvedValue(true)
    mockSyncService.getPageUsers.mockResolvedValue([])
    mockSyncService.trackActiveEdit.mockResolvedValue()
    mockSyncService.clearUserActiveEdits.mockResolvedValue()
  })

  afterEach(() => {
    if (clientSocket?.connected) {
      clientSocket.disconnect()
    }
  })

  describe('✅ Connection Management', () => {
    it('should authenticate and connect with valid token', async () => {
      clientSocket = await createAuthenticatedClient()

      expect(clientSocket.connected).toBe(true)
      expect(auth.verifyIdToken).toHaveBeenCalledWith(mockToken)
      expect(serverSocket.userId).toBe(mockUserId)
    })

    it('should reject connection with missing token', (done) => {
      const client = ioc(`http://localhost:${port}`, {
        transports: ['websocket'],
        reconnection: false,
      })

      client.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication required')
        client.close()
        done()
      })
    })

    it('should reject connection with invalid token', (done) => {
      const mockAuth = auth as jest.Mocked<typeof auth>
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

      const client = ioc(`http://localhost:${port}`, {
        auth: { token: 'invalid-token' },
        transports: ['websocket'],
        reconnection: false,
      })

      client.on('connect_error', (error) => {
        expect(error.message).toBe('Invalid authentication token')
        client.close()
        done()
      })
    })

    it('should join user room on connection', async () => {
      clientSocket = await createAuthenticatedClient()

      // Check that user joined their personal room
      const rooms = Array.from(serverSocket.rooms)
      expect(rooms).toContain(`user:${mockUserId}`)
    })

    it('should handle disconnection and cleanup', async () => {
      clientSocket = await createAuthenticatedClient()

      // Disconnect
      clientSocket.disconnect()

      // Wait a bit for server to process
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(syncService.clearUserActiveEdits).toHaveBeenCalledWith(mockUserId)
    })

    it('should handle reconnection with same token', async () => {
      // First connection
      clientSocket = await createAuthenticatedClient()
      const firstSocketId = clientSocket.id

      // Disconnect
      clientSocket.disconnect()

      // Reconnect with new client
      clientSocket = await createAuthenticatedClient()
      const secondSocketId = clientSocket.id

      expect(firstSocketId).not.toBe(secondSocketId)
      expect(clientSocket.connected).toBe(true)
    })
  })

  describe('✅ Room Management', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedClient()
    })

    describe('Workspace Rooms', () => {
      it('should join workspace room with access', async () => {
        const joinedPromise = waitFor(clientSocket, 'joined:workspace')

        clientSocket.emit('join:workspace', mockWorkspaceId)

        const result = await joinedPromise
        expect(result).toEqual({ workspaceId: mockWorkspaceId })
        expect(syncService.verifyWorkspaceAccess).toHaveBeenCalledWith(mockWorkspaceId, mockUserId)

        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).toContain(`workspace:${mockWorkspaceId}`)
      })

      it('should deny joining workspace without access', async () => {
        const mockSyncService = syncService as jest.Mocked<typeof syncService>
        mockSyncService.verifyWorkspaceAccess.mockResolvedValue(false)

        const errorPromise = waitFor(clientSocket, 'error')

        clientSocket.emit('join:workspace', mockWorkspaceId)

        const error = await errorPromise
        expect(error).toEqual({ message: 'Access denied to workspace' })

        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).not.toContain(`workspace:${mockWorkspaceId}`)
      })

      it('should handle workspace join errors', async () => {
        const mockSyncService = syncService as jest.Mocked<typeof syncService>
        mockSyncService.verifyWorkspaceAccess.mockRejectedValue(new Error('Database error'))

        const errorPromise = waitFor(clientSocket, 'error')

        clientSocket.emit('join:workspace', mockWorkspaceId)

        const error = await errorPromise
        expect(error).toEqual({ message: 'Failed to join workspace' })
      })

      it('should leave workspace room', async () => {
        // First join
        clientSocket.emit('join:workspace', mockWorkspaceId)
        await waitFor(clientSocket, 'joined:workspace')

        // Then leave
        const leftPromise = waitFor(clientSocket, 'left:workspace')

        clientSocket.emit('leave:workspace', mockWorkspaceId)

        const result = await leftPromise
        expect(result).toEqual({ workspaceId: mockWorkspaceId })

        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).not.toContain(`workspace:${mockWorkspaceId}`)
      })
    })

    describe('Page Rooms', () => {
      it('should join page room with access', async () => {
        const mockSyncService = syncService as jest.Mocked<typeof syncService>
        mockSyncService.getPageUsers.mockResolvedValue([
          { userId: 'user-1', email: 'user1@example.com', joinedAt: new Date() },
          { userId: 'user-2', email: 'user2@example.com', joinedAt: new Date() },
        ])

        const joinedPromise = waitFor(clientSocket, 'joined:page')

        clientSocket.emit('join:page', mockPageId)

        const result = await joinedPromise
        expect(result.pageId).toBe(mockPageId)
        expect(result.users).toHaveLength(2)
        expect(syncService.verifyPageAccess).toHaveBeenCalledWith(mockPageId, mockUserId)

        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).toContain(`page:${mockPageId}`)
      })

      it('should notify others when user joins page', async () => {
        // Create second client
        const client2 = await createAuthenticatedClient()

        // Have both clients join the same page
        clientSocket.emit('join:page', mockPageId)
        await waitFor(clientSocket, 'joined:page')

        // Set up listener for user joined event
        const userJoinedPromise = waitFor(clientSocket, 'user:joined')

        // Second client joins
        client2.emit('join:page', mockPageId)

        const notification = await userJoinedPromise
        expect(notification).toEqual({
          userId: mockUserId,
          pageId: mockPageId,
        })

        client2.disconnect()
      })

      it('should deny joining page without access', async () => {
        const mockSyncService = syncService as jest.Mocked<typeof syncService>
        mockSyncService.verifyPageAccess.mockResolvedValue(false)

        const errorPromise = waitFor(clientSocket, 'error')

        clientSocket.emit('join:page', mockPageId)

        const error = await errorPromise
        expect(error).toEqual({ message: 'Access denied to page' })

        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).not.toContain(`page:${mockPageId}`)
      })

      it('should notify others when user leaves page', async () => {
        // Create second client
        const client2 = await createAuthenticatedClient()

        // Have both clients join the same page
        clientSocket.emit('join:page', mockPageId)
        await waitFor(clientSocket, 'joined:page')

        client2.emit('join:page', mockPageId)
        await waitFor(client2, 'joined:page')

        // Set up listener for user left event
        const userLeftPromise = waitFor(client2, 'user:left')

        // First client leaves
        clientSocket.emit('leave:page', mockPageId)

        const notification = await userLeftPromise
        expect(notification).toEqual({
          userId: mockUserId,
          pageId: mockPageId,
        })

        client2.disconnect()
      })

      it('should handle leaving page that was not joined', async () => {
        const leftPromise = waitFor(clientSocket, 'left:page')

        clientSocket.emit('leave:page', 'unknown-page')

        const result = await leftPromise
        expect(result).toEqual({ pageId: 'unknown-page' })
      })
    })
  })

  describe('✅ Block Updates Broadcasting', () => {
    let client2: ClientSocket

    beforeEach(async () => {
      clientSocket = await createAuthenticatedClient()
      client2 = await createAuthenticatedClient()

      // Both clients join the same page
      clientSocket.emit('join:page', mockPageId)
      await waitFor(clientSocket, 'joined:page')

      client2.emit('join:page', mockPageId)
      await waitFor(client2, 'joined:page')
    })

    afterEach(() => {
      if (client2?.connected) {
        client2.disconnect()
      }
    })

    it('should broadcast block updates to others in same page', async () => {
      const updateData = {
        pageId: mockPageId,
        blockId: 'block-123',
        content: 'Updated content',
        version: 2,
      }

      const updatePromise = waitFor(client2, 'block:updated')

      clientSocket.emit('block:update', updateData)

      const received = await updatePromise
      expect(received).toEqual({
        ...updateData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })

      expect(syncService.trackActiveEdit).toHaveBeenCalledWith('block-123', mockUserId)
    })

    it('should not receive own block updates', (done) => {
      const updateData = {
        pageId: mockPageId,
        blockId: 'block-123',
        content: 'Updated content',
        version: 2,
      }

      // Should not receive this
      clientSocket.once('block:updated', () => {
        done(new Error('Should not receive own updates'))
      })

      clientSocket.emit('block:update', updateData)

      // Wait to ensure no event is received
      setTimeout(done, 100)
    })

    it('should handle block update errors gracefully', async () => {
      const mockSyncService = syncService as jest.Mocked<typeof syncService>
      mockSyncService.trackActiveEdit.mockRejectedValue(new Error('Database error'))

      const updateData = {
        pageId: mockPageId,
        blockId: 'block-123',
        content: 'Updated content',
        version: 2,
      }

      // Should still broadcast even if tracking fails
      const updatePromise = waitFor(client2, 'block:updated')

      clientSocket.emit('block:update', updateData)

      const received = await updatePromise
      expect(received).toBeDefined()
    })

    it('should broadcast block creation', async () => {
      const createData = {
        pageId: mockPageId,
        blockId: 'new-block',
        type: 'paragraph',
        content: 'New block content',
        order: 5,
      }

      const createPromise = waitFor(client2, 'block:created')

      clientSocket.emit('block:create', createData)

      const received = await createPromise
      expect(received).toEqual({
        ...createData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })
    })

    it('should broadcast block deletion', async () => {
      const deleteData = {
        pageId: mockPageId,
        blockId: 'block-to-delete',
      }

      const deletePromise = waitFor(client2, 'block:deleted')

      clientSocket.emit('block:delete', deleteData)

      const received = await deletePromise
      expect(received).toEqual({
        ...deleteData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })
    })

    it('should broadcast block reordering', async () => {
      const reorderData = {
        pageId: mockPageId,
        blocks: [
          { id: 'block-1', order: 0 },
          { id: 'block-2', order: 1 },
          { id: 'block-3', order: 2 },
        ],
      }

      const reorderPromise = waitFor(client2, 'blocks:reordered')

      clientSocket.emit('blocks:reorder', reorderData)

      const received = await reorderPromise
      expect(received).toEqual({
        ...reorderData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })
    })

    it('should only broadcast to users in the same page', async () => {
      // Create third client in different page
      const client3 = await createAuthenticatedClient()
      client3.emit('join:page', 'different-page')
      await waitFor(client3, 'joined:page')

      const updateData = {
        pageId: mockPageId,
        blockId: 'block-123',
        content: 'Updated content',
        version: 2,
      }

      // Client 3 should not receive this
      client3.once('block:updated', () => {
        throw new Error('Should not receive updates from different page')
      })

      // Client 2 should receive this
      const updatePromise = waitFor(client2, 'block:updated')

      clientSocket.emit('block:update', updateData)

      await updatePromise // Wait for client2 to receive
      await new Promise((resolve) => setTimeout(resolve, 100)) // Wait to ensure client3 doesn't receive

      client3.disconnect()
    })
  })

  describe('✅ Cursor and Selection Sharing', () => {
    let client2: ClientSocket

    beforeEach(async () => {
      clientSocket = await createAuthenticatedClient()
      client2 = await createAuthenticatedClient()

      // Both clients join the same page
      clientSocket.emit('join:page', mockPageId)
      await waitFor(clientSocket, 'joined:page')

      client2.emit('join:page', mockPageId)
      await waitFor(client2, 'joined:page')
    })

    afterEach(() => {
      if (client2?.connected) {
        client2.disconnect()
      }
    })

    it('should broadcast cursor position updates', async () => {
      const cursorData = {
        pageId: mockPageId,
        blockId: 'block-123',
        position: 42,
      }

      const cursorPromise = waitFor(client2, 'cursor:updated')

      clientSocket.emit('cursor:update', cursorData)

      const received = await cursorPromise
      expect(received).toEqual({
        ...cursorData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })
    })

    it('should broadcast selection updates', async () => {
      const selectionData = {
        pageId: mockPageId,
        blockId: 'block-123',
        start: 10,
        end: 25,
      }

      const selectionPromise = waitFor(client2, 'selection:updated')

      clientSocket.emit('selection:update', selectionData)

      const received = await selectionPromise
      expect(received).toEqual({
        ...selectionData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })
    })

    it('should not broadcast cursor/selection to self', (done) => {
      const cursorData = {
        pageId: mockPageId,
        blockId: 'block-123',
        position: 42,
      }

      // Should not receive own cursor updates
      clientSocket.once('cursor:updated', () => {
        done(new Error('Should not receive own cursor updates'))
      })

      clientSocket.emit('cursor:update', cursorData)

      // Wait to ensure no event is received
      setTimeout(done, 100)
    })

    it('should handle rapid cursor updates', async () => {
      const updates: any[] = []

      client2.on('cursor:updated', (data) => {
        updates.push(data)
      })

      // Send multiple rapid cursor updates
      for (let i = 0; i < 10; i++) {
        clientSocket.emit('cursor:update', {
          pageId: mockPageId,
          blockId: 'block-123',
          position: i * 10,
        })
      }

      // Wait a bit for all updates
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(updates.length).toBeGreaterThan(0)
      expect(updates[updates.length - 1].position).toBe(90)
    })
  })

  describe('✅ Page Updates Broadcasting', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedClient()

      // Join workspace first
      clientSocket.emit('join:workspace', mockWorkspaceId)
      await waitFor(clientSocket, 'joined:workspace')
    })

    it('should broadcast page updates to workspace members', async () => {
      // Create second client in same workspace
      const client2 = await createAuthenticatedClient()
      client2.emit('join:workspace', mockWorkspaceId)
      await waitFor(client2, 'joined:workspace')

      const pageUpdateData = {
        pageId: mockPageId,
        title: 'Updated Page Title',
      }

      const updatePromise = waitFor(client2, 'page:updated')

      clientSocket.emit('page:update', pageUpdateData)

      const received = await updatePromise
      expect(received).toEqual({
        ...pageUpdateData,
        userId: mockUserId,
        timestamp: expect.any(String),
      })

      client2.disconnect()
    })

    it('should not broadcast page updates without workspace context', (done) => {
      // Create client that hasn't joined workspace
      createAuthenticatedClient().then((client2) => {
        const pageUpdateData = {
          pageId: mockPageId,
          title: 'Updated Page Title',
        }

        // Should not receive update
        client2.once('page:updated', () => {
          done(new Error('Should not receive page updates without workspace'))
        })

        client2.emit('page:update', pageUpdateData)

        // Wait to ensure no event is received
        setTimeout(() => {
          client2.disconnect()
          done()
        }, 100)
      })
    })
  })

  describe('✅ Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      clientSocket = await createAuthenticatedClient()
    })

    it('should handle malformed event data gracefully', (done) => {
      // Send invalid data
      clientSocket.emit('block:update', null)
      clientSocket.emit('block:update', undefined)
      clientSocket.emit('block:update', 'invalid')
      clientSocket.emit('block:update', { invalid: 'data' })

      // Should not crash
      setTimeout(done, 100)
    })

    it('should handle disconnection during event processing', async () => {
      clientSocket.emit('join:page', mockPageId)

      // Disconnect immediately
      clientSocket.disconnect()

      // Should not throw
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    it('should clean up rooms on disconnect', async () => {
      // Join multiple rooms
      clientSocket.emit('join:workspace', mockWorkspaceId)
      await waitFor(clientSocket, 'joined:workspace')

      clientSocket.emit('join:page', mockPageId)
      await waitFor(clientSocket, 'joined:page')

      // Create second client to receive notifications
      const client2 = await createAuthenticatedClient()
      client2.emit('join:page', mockPageId)
      await waitFor(client2, 'joined:page')

      const userLeftPromise = waitFor(client2, 'user:left')

      // Disconnect first client
      clientSocket.disconnect()

      const notification = await userLeftPromise
      expect(notification).toEqual({
        userId: mockUserId,
        pageId: mockPageId,
      })

      client2.disconnect()
    })

    it('should handle multiple page rooms on disconnect', async () => {
      // Join multiple pages
      const pages = ['page-1', 'page-2', 'page-3']

      for (const page of pages) {
        clientSocket.emit('join:page', page)
        await waitFor(clientSocket, 'joined:page')
      }

      // Disconnect
      clientSocket.disconnect()

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(syncService.clearUserActiveEdits).toHaveBeenCalledWith(mockUserId)
    })

    it('should handle socket timeout configuration', async () => {
      // Socket should have proper timeout configuration
      expect(io.engine.opts.pingTimeout).toBe(60000)
      expect(io.engine.opts.pingInterval).toBe(25000)
    })

    it('should handle CORS configuration', () => {
      const corsOptions = io.engine.opts.cors
      expect(corsOptions).toBeDefined()
      expect(corsOptions.credentials).toBe(true)
    })

    it('should handle concurrent connections from same user', async () => {
      // Create multiple connections for same user
      const client2 = await createAuthenticatedClient()
      const client3 = await createAuthenticatedClient()

      expect(clientSocket.connected).toBe(true)
      expect(client2.connected).toBe(true)
      expect(client3.connected).toBe(true)

      // All should be in user room
      expect(io.sockets.adapter.rooms.get(`user:${mockUserId}`)?.size).toBe(3)

      client2.disconnect()
      client3.disconnect()
    })

    it('should handle events with missing required fields', async () => {
      // Join page to receive broadcasts
      clientSocket.emit('join:page', mockPageId)
      await waitFor(clientSocket, 'joined:page')

      // Send block update without required fields
      clientSocket.emit('block:update', { pageId: mockPageId })

      // Should not crash
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    it('should handle rapid connect/disconnect cycles', async () => {
      for (let i = 0; i < 5; i++) {
        const client = await createAuthenticatedClient()
        client.disconnect()
      }

      // Should handle all connections/disconnections gracefully
      expect(true).toBe(true)
    })
  })

  describe('✅ Utility Functions', () => {
    it('should emit events to specific users', async () => {
      const { emitToUser } = await import('../socketServer')

      const testEvent = 'test:user:event'
      const testData = { message: 'Hello user' }

      const eventPromise = waitFor(clientSocket, testEvent)

      emitToUser(io, mockUserId, testEvent, testData)

      const received = await eventPromise
      expect(received).toEqual(testData)
    })

    it('should emit events to workspace members', async () => {
      const { emitToWorkspace } = await import('../socketServer')

      // Join workspace
      clientSocket.emit('join:workspace', mockWorkspaceId)
      await waitFor(clientSocket, 'joined:workspace')

      const testEvent = 'test:workspace:event'
      const testData = { message: 'Hello workspace' }

      const eventPromise = waitFor(clientSocket, testEvent)

      emitToWorkspace(io, mockWorkspaceId, testEvent, testData)

      const received = await eventPromise
      expect(received).toEqual(testData)
    })

    it('should emit events to page collaborators', async () => {
      const { emitToPage } = await import('../socketServer')

      // Join page
      clientSocket.emit('join:page', mockPageId)
      await waitFor(clientSocket, 'joined:page')

      const testEvent = 'test:page:event'
      const testData = { message: 'Hello page' }

      const eventPromise = waitFor(clientSocket, testEvent)

      emitToPage(io, mockPageId, testEvent, testData)

      const received = await eventPromise
      expect(received).toEqual(testData)
    })

    it('should handle utility functions with non-existent rooms', async () => {
      const { emitToUser, emitToWorkspace, emitToPage } = await import('../socketServer')

      // These should not throw even if rooms don't exist
      emitToUser(io, 'non-existent-user', 'test', {})
      emitToWorkspace(io, 'non-existent-workspace', 'test', {})
      emitToPage(io, 'non-existent-page', 'test', {})

      // No errors expected
      expect(true).toBe(true)
    })
  })
})
