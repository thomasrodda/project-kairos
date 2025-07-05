/**
 * Example usage of the new API response and error handling utilities
 *
 * This file demonstrates how to use the utilities in your routes.
 * DO NOT import this file - it's for reference only.
 */

import { Request, Response, NextFunction } from 'express'
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  parsePaginationParams,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ConflictError,
} from '../utils'
import { asyncHandler } from '../middleware'

// Example: Simple success response
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserFromDatabase(req.params.id)

  if (!user) {
    throw new NotFoundError('User', req.params.id)
  }

  return successResponse(res, user)
})

// Example: Created response with location header
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Validation
  if (!req.body.email) {
    throw new ValidationError('Email is required', { field: 'email' })
  }

  // Check for existing user
  const existing = await findUserByEmail(req.body.email)
  if (existing) {
    throw new ConflictError('User with this email already exists', {
      field: 'email',
      value: req.body.email,
    })
  }

  const newUser = await createUserInDatabase(req.body)

  return createdResponse(res, newUser, `/api/users/${newUser.id}`)
})

// Example: Paginated response
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, offset } = parsePaginationParams(req.query)

  const [users, total] = await Promise.all([getUsersFromDatabase({ offset, limit }), getTotalUsersCount()])

  return paginatedResponse(res, users, { page, limit, total })
})

// Example: Protected route with authentication
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError()
  }

  // Multiple validation errors
  const errors = []
  if (req.body.age && req.body.age < 0) {
    errors.push({ field: 'age', value: req.body.age, reason: 'Age must be positive' })
  }
  if (req.body.email && !isValidEmail(req.body.email)) {
    errors.push({ field: 'email', value: req.body.email, reason: 'Invalid email format' })
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors)
  }

  const updatedUser = await updateUserInDatabase(req.user.id, req.body)

  return successResponse(res, updatedUser)
})

// Example: Error handling in try-catch (for non-async handler)
export const syncOperation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = performSyncOperation()
    successResponse(res, result)
  } catch (error) {
    next(error) // Pass to error handler
  }
}

// Mock functions for example purposes
async function getUserFromDatabase(id: string) {
  return null
}
async function findUserByEmail(email: string) {
  return null
}
async function createUserInDatabase(data: any) {
  return { id: '123' }
}
async function getUsersFromDatabase(opts: any) {
  return []
}
async function getTotalUsersCount() {
  return 0
}
async function updateUserInDatabase(id: string, data: any) {
  return {}
}
function isValidEmail(email: string) {
  return true
}
function performSyncOperation() {
  return {}
}
