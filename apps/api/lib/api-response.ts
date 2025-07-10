import { VercelRequest, VercelResponse } from '@vercel/node'
import { ZodError } from 'zod'

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
}

// Standard HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const

// Success response helper
export function sendSuccess<T>(res: VercelResponse, data: T, status: number = HttpStatus.OK): VercelResponse {
  return res.status(status).json({ data })
}

// Error response helper
export function sendError(
  res: VercelResponse,
  code: string,
  message: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: unknown
): VercelResponse {
  const error: ApiError = { code, message }
  if (details !== undefined) {
    error.details = details
  }
  return res.status(status).json({ error })
}

// Handle Zod validation errors
export function handleValidationError(res: VercelResponse, error: ZodError): VercelResponse {
  const formattedErrors = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return sendError(res, 'VALIDATION_ERROR', 'Invalid request data', HttpStatus.BAD_REQUEST, formattedErrors)
}

// Method not allowed helper
export function methodNotAllowed(res: VercelResponse, allowedMethods: string[]): VercelResponse {
  res.setHeader('Allow', allowedMethods.join(', '))
  return sendError(res, 'METHOD_NOT_ALLOWED', `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`, HttpStatus.METHOD_NOT_ALLOWED)
}

// Async handler wrapper with error catching
export function asyncHandler<T = unknown>(handler: (req: VercelRequest, res: VercelResponse) => Promise<T>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ZodError) {
        return handleValidationError(res, error)
      }

      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return sendError(res, 'INTERNAL_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
