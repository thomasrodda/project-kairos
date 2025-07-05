/**
 * Custom error classes for standardized error handling
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorDetails {
  field?: string
  value?: any
  reason?: string
  [key: string]: any
}

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: ErrorDetails | ErrorDetails[]
  public readonly isOperational: boolean

  constructor(message: string, code: ErrorCode, statusCode: number, details?: ErrorDetails | ErrorDetails[], isOperational = true) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error - 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails | ErrorDetails[]) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details)
  }
}

/**
 * Authentication error - 401 Unauthorized
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ErrorCode.AUTHENTICATION_ERROR, 401)
  }
}

/**
 * Authorization error - 403 Forbidden
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, ErrorCode.AUTHORIZATION_ERROR, 403)
  }
}

/**
 * Not found error - 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier ? `${resource} with identifier '${identifier}' not found` : `${resource} not found`
    super(message, ErrorCode.NOT_FOUND, 404)
  }
}

/**
 * Conflict error - 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails | ErrorDetails[]) {
    super(message, ErrorCode.CONFLICT, 409, details)
  }
}

/**
 * Rate limit error - 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429)
    this.retryAfter = retryAfter
  }
}

/**
 * Type guard to check if an error is an operational error
 */
export function isOperationalError(error: Error): error is AppError {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Helper to convert unknown errors to AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.INTERNAL_ERROR, 500, undefined, false)
  }

  return new AppError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR, 500, undefined, false)
}
