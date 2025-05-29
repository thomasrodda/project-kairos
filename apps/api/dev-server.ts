import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import hello from './hello'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Mount the hello function
app.all('/api/hello', (req, res) => {
  hello(req as any, res as any)
})

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
