import { Socket } from 'socket.io'
import { auth } from '../services/firebase-admin'
import { AuthenticatedSocket } from '../websocket/socketServer'

export async function requireSocketAuth(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token as string)

    // Attach user ID to socket
    socket.userId = decodedToken.uid

    next()
  } catch (error) {
    console.error('Socket authentication error:', error)
    next(new Error('Invalid authentication token'))
  }
}
