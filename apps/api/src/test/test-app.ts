import express, { Express } from 'express'
import cors from 'cors'
import authRoutes from '../routes/auth.routes'
import workspaceRoutes from '../routes/workspace.routes'
import syncRoutes from '../routes/sync.routes'
import { checkRedisHealth } from '../config/redis'
import { errorHandler } from '../middleware/errorHandler'

// Create a simplified app for testing without problematic middleware
export function createTestApp(): Express {
  const app = express()

  // Basic middleware
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Add a simple request ID for tests
  app.use((req, res, next) => {
    req.headers['x-request-id'] = 'test-request-id'
    next()
  })

  // Health check
  app.get('/api/health', async (req, res) => {
    const redisHealth = await checkRedisHealth()
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: redisHealth,
    })
  })

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/workspaces', workspaceRoutes)
  app.use('/api/sync', syncRoutes)

  // Error handling
  app.use(errorHandler)

  return app
}
