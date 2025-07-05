import express, { Express } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import workspaceRoutes from './routes/workspace.routes'

export function createApp(): Express {
  const app = express()

  // Middleware
  app.use(
    cors({
      origin: process.env.VITE_API_URL || 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(express.json())

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
