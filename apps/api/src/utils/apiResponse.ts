import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AppError, ErrorCode } from './errors'

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    requestId?: string
    timestamp?: string
  }
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number
  limit: number
  total: number
}

/**
 * Helper to send a successful response
 */
export function successResponse<T>(res: Response, data: T, statusCode = 200, meta?: Partial<ApiResponse['meta']>): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }

  return res.status(statusCode).json(response)
}

/**
 * Helper to send an error response
 */
export function errorResponse(res: Response, error: AppError | Error, requestId?: string): Response {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const code = error instanceof AppError ? error.code : ErrorCode.INTERNAL_ERROR
  const details = error instanceof AppError ? error.details : undefined

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: error.message,
      details,
    },
    meta: {
      requestId: requestId || res.locals.requestId || uuidv4(),
      timestamp: new Date().toISOString(),
    },
  }

  // Add retry-after header for rate limit errors
  if (error instanceof AppError && error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
    const rateLimitError = error as any
    if (rateLimitError.retryAfter) {
      res.setHeader('Retry-After', rateLimitError.retryAfter)
    }
  }

  return res.status(statusCode).json(response)
}

/**
 * Helper to send a paginated response
 */
export function paginatedResponse<T>(res: Response, data: T[], pagination: PaginationOptions, statusCode = 200): Response {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
    },
  }

  return res.status(statusCode).json(response)
}

/**
 * Helper to send a no content response
 */
export function noContentResponse(res: Response): Response {
  return res.status(204).send()
}

/**
 * Helper to send a created response
 */
export function createdResponse<T>(res: Response, data: T, location?: string): Response {
  if (location) {
    res.setHeader('Location', location)
  }
  return successResponse(res, data, 201)
}

/**
 * Helper to calculate pagination metadata
 */
export function calculatePagination(page: number, limit: number, total: number): PaginationOptions {
  const validPage = Math.max(1, page)
  const validLimit = Math.max(1, Math.min(100, limit))

  return {
    page: validPage,
    limit: validLimit,
    total,
  }
}

/**
 * Helper to parse pagination query params
 */
export function parsePaginationParams(query: any): {
  page: number
  limit: number
  offset: number
} {
  const page = parseInt(query.page as string, 10) || 1
  const limit = parseInt(query.limit as string, 10) || 20
  const offset = (page - 1) * limit

  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(100, limit)),
    offset: Math.max(0, offset),
  }
}
