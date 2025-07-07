import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { v4 as uuidv4 } from 'uuid'
import { securityConfig } from '../config/security.config'

// Request ID middleware for tracking
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4()
  req.headers['x-request-id'] = requestId
  res.setHeader('x-request-id', requestId)
  next()
}

// General rate limiter - configurable via environment variables
export const generalRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.general.windowMs,
  max: securityConfig.rateLimits.general.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    const requestId = req.headers['x-request-id']
    console.warn(`[Rate Limit] [${requestId}] General rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      requestId,
    })
  },
})

// Auth rate limiter - stricter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.auth.windowMs,
  max: securityConfig.rateLimits.auth.max,
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests (wrong password, etc.)
  handler: (req, res) => {
    const requestId = req.headers['x-request-id']
    console.warn(`[Rate Limit] [${requestId}] Auth rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again later.',
      requestId,
    })
  },
})

// File upload rate limiter
export const fileUploadRateLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.fileUpload.windowMs,
  max: securityConfig.rateLimits.fileUpload.max,
  message: 'Too many file uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const requestId = req.headers['x-request-id']
    console.warn(`[Rate Limit] [${requestId}] File upload rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json({
      error: 'Too many file uploads from this IP, please try again later.',
      requestId,
    })
  },
})

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for the editor
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'], // Allow data URLs and HTTPS images
      connectSrc: ["'self'", process.env.VITE_API_URL || 'http://localhost:3000'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // May need to be false for some integrations
})

// MongoDB/NoSQL injection protection
// Custom implementation for Express 5 compatibility
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Helper function to sanitize objects
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (key.startsWith('$') || key.includes('.')) {
            // Log potential injection attempt
            console.warn(`Potential NoSQL injection blocked - Request ID: ${req.headers['x-request-id']}, Key: ${key}`)
            delete obj[key]
          } else if (typeof obj[key] === 'object') {
            obj[key] = sanitize(obj[key] as Record<string, unknown>)
          }
        }
      }
    }
    return obj
  }

  // Sanitize body, params, and query without modifying the request object
  if (req.body) {
    sanitize(req.body as Record<string, unknown>)
  }

  // For query and params, we need to be careful with Express 5's read-only properties
  // We'll sanitize in place if possible, otherwise skip
  try {
    if (req.query) {
      sanitize(req.query as Record<string, unknown>)
    }
    if (req.params) {
      sanitize(req.params as Record<string, unknown>)
    }
  } catch (_err) {
    // If we can't modify query/params (Express 5), that's okay
    // The important one is body which we can still sanitize
  }

  next()
}

// Custom security headers middleware
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Additional security headers not covered by Helmet
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Remove powered by header
  res.removeHeader('X-Powered-By')

  next()
}

// Request size limits configuration
export const requestSizeLimits = {
  json: securityConfig.requestSizeLimits.json,
  urlencoded: securityConfig.requestSizeLimits.urlencoded,
  raw: securityConfig.requestSizeLimits.raw, // For file uploads
}

// IP-based blocking middleware (optional, for known bad actors)
const blockedIPs = new Set<string>(securityConfig.ipBlocking.blocklist)

export const ipBlockingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!securityConfig.ipBlocking.enabled) {
    next()
    return
  }

  const clientIP = req.ip || req.socket.remoteAddress || ''

  if (blockedIPs.has(clientIP)) {
    const requestId = req.headers['x-request-id']
    console.warn(`[IP Block] [${requestId}] Blocked IP attempted access: ${clientIP}`)
    res.status(403).json({
      error: 'Access denied',
      requestId,
    })
    return
  }

  next()
}

// Function to add an IP to the blocklist
export const blockIP = (ip: string) => {
  blockedIPs.add(ip)
}

// Function to unblock an IP
export const unblockIP = (ip: string) => {
  blockedIPs.delete(ip)
}

// Logging middleware for security events
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.logging.enabled) {
    return next()
  }

  const requestId = req.headers['x-request-id']
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const ip = req.ip || req.socket.remoteAddress
  const userAgent = req.headers['user-agent']

  // Log the request
  if (securityConfig.logging.level !== 'error') {
    console.log(`[${timestamp}] [${requestId}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`)
  }

  // Log the response
  const originalSend = res.send
  res.send = function (data) {
    if (securityConfig.logging.level !== 'error' || res.statusCode >= 400) {
      console.log(`[${timestamp}] [${requestId}] Response: ${res.statusCode}`)
    }
    return originalSend.call(this, data)
  }

  next()
}
