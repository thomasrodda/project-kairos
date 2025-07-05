import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel
  timestamp: string
  requestId: string
  method: string
  path: string
  statusCode?: number
  duration?: number
  userId?: string
  ip?: string
  userAgent?: string
  error?: {
    message: string
    stack?: string
    code?: string
  }
  meta?: Record<string, any>
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private static instance: Logger

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(entry: LogEntry): string {
    // In production, you might want to use JSON format
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(entry)
    }

    // Human-readable format for development
    const { level, timestamp, requestId, method, path, statusCode, duration, error, meta } = entry
    let message = `[${timestamp}] ${level.toUpperCase()} [${requestId}] ${method} ${path}`

    if (statusCode) {
      message += ` ${statusCode}`
    }

    if (duration) {
      message += ` ${duration}ms`
    }

    if (error) {
      message += ` - ${error.message}`
    }

    if (meta && Object.keys(meta).length > 0) {
      message += ` - ${JSON.stringify(meta)}`
    }

    return message
  }

  log(entry: LogEntry): void {
    const formattedLog = this.formatLog(entry)

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedLog)
        if (entry.error?.stack && process.env.NODE_ENV !== 'production') {
          console.error(entry.error.stack)
        }
        break
      case LogLevel.WARN:
        console.warn(formattedLog)
        break
      case LogLevel.INFO:
        console.info(formattedLog)
        break
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV !== 'production') {
          console.debug(formattedLog)
        }
        break
    }
  }

  error(requestId: string, message: string, error?: Error, meta?: Record<string, any>): void {
    this.log({
      level: LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      requestId,
      method: '',
      path: '',
      error: error ? { message: error.message, stack: error.stack } : { message },
      meta,
    })
  }

  warn(requestId: string, message: string, meta?: Record<string, any>): void {
    this.log({
      level: LogLevel.WARN,
      timestamp: new Date().toISOString(),
      requestId,
      method: '',
      path: '',
      error: { message },
      meta,
    })
  }

  info(requestId: string, message: string, meta?: Record<string, any>): void {
    this.log({
      level: LogLevel.INFO,
      timestamp: new Date().toISOString(),
      requestId,
      method: '',
      path: '',
      error: { message },
      meta,
    })
  }

  debug(requestId: string, message: string, meta?: Record<string, any>): void {
    this.log({
      level: LogLevel.DEBUG,
      timestamp: new Date().toISOString(),
      requestId,
      method: '',
      path: '',
      error: { message },
      meta,
    })
  }
}

/**
 * Express middleware to log requests and responses
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // Generate and attach request ID
  const requestId = uuidv4()
  req.headers['x-request-id'] = requestId
  res.locals.requestId = requestId

  // Capture start time
  const startTime = Date.now()

  // Get logger instance
  const logger = Logger.getInstance()

  // Extract request details
  const requestDetails = {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  }

  // Log incoming request
  logger.log({
    level: LogLevel.INFO,
    timestamp: new Date().toISOString(),
    requestId,
    ...requestDetails,
    meta: {
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
    },
  })

  // Capture response details
  const originalSend = res.send
  res.send = function (data) {
    res.send = originalSend
    const duration = Date.now() - startTime

    // Log response
    logger.log({
      level: res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO,
      timestamp: new Date().toISOString(),
      requestId,
      ...requestDetails,
      statusCode: res.statusCode,
      duration,
    })

    return res.send(data)
  }

  next()
}

/**
 * Get logger instance
 */
export const logger = Logger.getInstance()
