import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../utils/apiResponse'
import { AppError, isOperationalError, toAppError, ErrorCode, ValidationError } from '../utils/errors'
import { logger } from './requestLogger'
import { ZodError } from 'zod'

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err)
  }

  const requestId = res.locals.requestId || (req.headers['x-request-id'] as string)

  // Convert to AppError if needed
  let appError: AppError

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      reason: e.message,
    }))
    appError = new ValidationError('Validation failed', details)
  } else {
    appError = toAppError(err)
  }

  // Log error details
  logger.error(requestId, appError.message, err, {
    path: req.path,
    method: req.method,
    statusCode: appError.statusCode,
    code: appError.code,
    isOperational: appError.isOperational,
    userId: (req as any).user?.id,
  })

  // In production, don't leak error details for non-operational errors
  if (process.env.NODE_ENV === 'production' && !isOperationalError(err)) {
    const genericError = new AppError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR, 500)
    errorResponse(res, genericError, requestId)
    return
  }

  // Send error response
  errorResponse(res, appError, requestId)
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Route ${req.method} ${req.path} not found`, ErrorCode.NOT_FOUND, 404)
  next(error)
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation error handler for express-validator
 */
export function validationErrorHandler(req: Request, res: Response, next: NextFunction): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { validationResult } = require('express-validator')
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.param,
      value: err.value,
      reason: err.msg,
    }))

    const error = new AppError('Validation failed', ErrorCode.VALIDATION_ERROR, 400, formattedErrors)

    next(error)
  } else {
    next()
  }
}
