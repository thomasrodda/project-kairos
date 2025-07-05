import express, { Express } from 'express'
import cors from 'cors'
import authRoutes from '../routes/auth.routes'
import workspaceRoutes from '../routes/workspace.routes'

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
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

  // Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/workspaces', workspaceRoutes)

  // Error handling
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    })
  })

  return app
}
