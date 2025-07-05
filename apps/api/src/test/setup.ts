import { PrismaClient } from '@kairos/database'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { DecodedIdToken } from 'firebase-admin/auth'

// Create a mock Prisma client
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Mock the database module
jest.mock('@kairos/database', () => ({
  prisma: prismaMock,
  Prisma: jest.requireActual('@kairos/database').Prisma,
}))

// Mock Firebase Admin
jest.mock('../services/firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn(),
    getUser: jest.fn(),
  },
}))

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock)
  jest.clearAllMocks()
})

// Test environment setup
process.env.NODE_ENV = 'test'
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com'
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----'

// Disable rate limiting and logging in tests
process.env.RATE_LIMIT_MAX_REQUESTS = '9999'
process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = '9999'
process.env.FILE_UPLOAD_RATE_LIMIT_MAX_REQUESTS = '9999'
process.env.SECURITY_LOGGING_ENABLED = 'false'
process.env.IP_BLOCKING_ENABLED = 'false'
process.env.CSP_ENABLED = 'false'

// Helper to create a mock Firebase decoded token
export function createMockDecodedToken(overrides: Partial<DecodedIdToken> = {}): DecodedIdToken {
  return {
    uid: 'test-user-123',
    email: 'test@example.com',
    email_verified: true,
    aud: 'test-project',
    iss: `https://securetoken.google.com/test-project`,
    sub: 'test-user-123',
    auth_time: Math.floor(Date.now() / 1000) - 3600,
    iat: Math.floor(Date.now() / 1000) - 1800,
    exp: Math.floor(Date.now() / 1000) + 1800,
    firebase: {
      identities: {},
      sign_in_provider: 'password',
    },
    ...overrides,
  }
}

// Helper to create auth headers
export function createAuthHeader(token: string = 'valid-token'): { authorization: string } {
  return {
    authorization: `Bearer ${token}`,
  }
}
