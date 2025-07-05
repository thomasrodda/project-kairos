/**
 * Central export for all API utilities
 */

// Error classes and utilities
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ErrorCode,
  isOperationalError,
  toAppError,
} from './errors'

export type { ErrorDetails } from './errors'

// API response utilities
export {
  successResponse,
  errorResponse,
  paginatedResponse,
  noContentResponse,
  createdResponse,
  calculatePagination,
  parsePaginationParams,
} from './apiResponse'

export type { ApiResponse, PaginationOptions } from './apiResponse'
