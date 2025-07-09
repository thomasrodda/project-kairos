// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'

// Try to load .env from current directory first, then from root
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '../../.env.local') })

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import hello from './hello'
import { verify, me, logout } from './auth'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Mount the hello function
app.all('/api/hello', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hello(req as any, res as any)
})

// Mount auth endpoints
app.post('/api/auth/verify', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verify(req as any, res as any)
})

app.get('/api/auth/me', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  me(req as any, res as any)
})

app.post('/api/auth/logout', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout(req as any, res as any)
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
