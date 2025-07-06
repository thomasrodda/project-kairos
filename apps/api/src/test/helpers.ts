import request from 'supertest'
import { Express } from 'express'
import { auth } from '../services/firebase-admin'
import { createTestApp } from './test-app'
import { createUser } from './factories'
import { createMockDecodedToken } from './setup'
import type { User } from '@kairos/database'

// Create an authenticated request helper
export function createAuthenticatedRequest(app: Express, user?: User) {
  const testUser = user || createUser()
  const decodedToken = createMockDecodedToken({
    uid: testUser.firebaseUid,
    email: testUser.email,
  })

  // Mock Firebase auth verification
  ;(auth.verifyIdToken as jest.Mock).mockResolvedValue(decodedToken)
  ;(auth.getUser as jest.Mock).mockResolvedValue({
    uid: testUser.firebaseUid,
    email: testUser.email,
    displayName: testUser.displayName,
    photoURL: testUser.photoURL,
  })

  // Mock the user lookup in database
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { prismaMock } = require('./setup')
  prismaMock.user.findUnique.mockResolvedValue(testUser)

  return {
    user: testUser,
    decodedToken,
    request: (method: 'get' | 'post' | 'put' | 'delete', url: string) => {
      return request(app)[method](url).set('Authorization', `Bearer test-token-${testUser.id}`)
    },
  }
}

// Helper to setup test app
export function setupTestApp(): Express {
  return createTestApp()
}

// Helper to assert error response
export function expectErrorResponse(response: request.Response, statusCode: number, errorMessage?: string | RegExp) {
  expect(response.status).toBe(statusCode)
  expect(response.body).toHaveProperty('error')

  if (errorMessage) {
    // Handle both simple string errors and error objects with message property
    const actualError = typeof response.body.error === 'string' ? response.body.error : response.body.error.message

    if (typeof errorMessage === 'string') {
      expect(actualError).toBe(errorMessage)
    } else {
      expect(actualError).toMatch(errorMessage)
    }
  }
}

// Helper to assert successful response
export function expectSuccessResponse(response: request.Response, statusCode: number = 200) {
  expect(response.status).toBe(statusCode)
  expect(response.body).not.toHaveProperty('error')
}

// Helper to create validation error test cases
export function createValidationTests(
  app: Express,
  method: 'post' | 'put',
  endpoint: string,
  validPayload: Record<string, any>,
  authRequired: boolean = true
) {
  const testCases: Array<{
    name: string
    payload: any
    expectedError?: string | RegExp
  }> = []

  // Test missing fields
  Object.keys(validPayload).forEach((field) => {
    const payload = { ...validPayload }
    delete payload[field]
    testCases.push({
      name: `should return 400 when ${field} is missing`,
      payload,
      expectedError: /Invalid input|required/i,
    })
  })

  // Test invalid types
  Object.entries(validPayload).forEach(([field, value]) => {
    if (typeof value === 'string') {
      testCases.push({
        name: `should return 400 when ${field} is not a string`,
        payload: { ...validPayload, [field]: 123 },
        expectedError: /Invalid input|string/i,
      })
    } else if (typeof value === 'number') {
      testCases.push({
        name: `should return 400 when ${field} is not a number`,
        payload: { ...validPayload, [field]: 'not-a-number' },
        expectedError: /Invalid input|number/i,
      })
    }
  })

  return testCases
}

// Helper to test pagination
export async function testPaginationResponse(app: Express, endpoint: string, authToken?: string, expectedItemCount?: number) {
  const req = request(app).get(endpoint)

  if (authToken) {
    req.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await req

  expectSuccessResponse(response)

  // Check response structure
  expect(response.body).toHaveProperty('items')
  expect(Array.isArray(response.body.items)).toBe(true)

  if (expectedItemCount !== undefined) {
    expect(response.body.items).toHaveLength(expectedItemCount)
  }

  return response
}
