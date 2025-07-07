import express, { Express } from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import workspaceRoutes from './routes/workspace.routes'
import pageRoutes from './routes/pages'
import blockRoutes from './routes/blocks'
import historyRoutes from './routes/history.routes'
import searchRoutes from './routes/search.routes'
import exportRoutes from './routes/export.routes'
import syncRoutes from './routes/sync.routes'
import {
  requestIdMiddleware,
  generalRateLimiter,
  authRateLimiter,
  helmetConfig,
  sanitizeInput,
  customSecurityHeaders,
  requestSizeLimits,
  ipBlockingMiddleware,
  securityLogger,
} from './middleware/security'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { successResponse } from './utils/apiResponse'
import { checkRedisHealth } from './config/redis'

export function createApp(): Express {
  const app = express()

  // Trust proxy - important for rate limiting behind reverse proxies
  app.set('trust proxy', 1)

  // Security middleware - apply early in the chain
  app.use(requestIdMiddleware) // Add request ID first for tracking
  app.use(securityLogger) // Log all requests
  app.use(ipBlockingMiddleware) // Block banned IPs
  app.use(helmetConfig) // Security headers
  app.use(customSecurityHeaders) // Additional security headers

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
      exposedHeaders: ['x-request-id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
    })
  )

  // Body parsing with size limits
  app.use(express.json({ limit: requestSizeLimits.json }))
  app.use(express.urlencoded({ extended: true, limit: requestSizeLimits.urlencoded }))
  app.use(express.raw({ limit: requestSizeLimits.raw }))

  // Input sanitization
  app.use(sanitizeInput)

  // Apply general rate limiter to all routes
  app.use(generalRateLimiter)

  // Health check (exempt from auth rate limiting)
  app.get('/api/health', async (_req, res) => {
    const redisHealth = await checkRedisHealth()

    successResponse(res, {
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      redis: redisHealth,
    })
  })

  // Routes with specific rate limiters
  app.use('/api/auth', authRateLimiter, authRoutes)
  app.use('/api/workspaces', workspaceRoutes)
  app.use('/api/pages', pageRoutes)
  app.use('/api/blocks', blockRoutes)
  app.use('/api/history', historyRoutes)
  app.use('/api/search', searchRoutes)
  app.use('/api/export', exportRoutes)
  app.use('/api/sync', syncRoutes)

  // 404 handler for unmatched routes
  app.use(notFoundHandler)

  // Global error handler
  app.use(errorHandler)

  return app
}
