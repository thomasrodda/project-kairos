import dotenv from 'dotenv'
import path from 'path'

// Load environment variables BEFORE any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

// Now import other modules after env vars are loaded
import { createServer } from 'http'
import { createApp } from './src/app'
import { createSocketServer } from './src/websocket/socketServer'

const app = createApp()
const PORT = 3001

const server = createServer(app)

// Initialize Socket.io
const io = createSocketServer(server)

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`)
  console.log(`WebSocket server running on ws://localhost:${PORT}`)
  console.log(`Try: http://localhost:${PORT}/api/hello`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed')
  })
})
