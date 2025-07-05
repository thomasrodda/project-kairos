import { createServer } from 'http'
import { createApp } from './src/app'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../../.env' })

const app = createApp()
const PORT = 3001

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`)
  console.log(`Try: http://localhost:${PORT}/api/hello`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed')
  })
})
