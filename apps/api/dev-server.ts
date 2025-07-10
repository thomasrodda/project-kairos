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
import workspaces from './workspaces'
import pages from './pages'
import blocks from './blocks'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

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

// Mount workspace endpoints
app.all('/api/workspaces', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaces(req as any, res as any)
})

// Mount page endpoints
app.all('/api/pages', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages(req as any, res as any)
})

app.put('/api/pages/reorder', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pages(req as any, res as any)
})

// Mount block endpoints
app.all('/api/blocks', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks(req as any, res as any)
})

app.put('/api/blocks/bulk', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks(req as any, res as any)
})

app.put('/api/blocks/reorder', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks(req as any, res as any)
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
