// apps/api/hello.test.ts
import handler from './hello'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock response object for testing
const createMockResponse = () => {
  const res = {} as VercelResponse
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// Mock request object for testing
const createMockRequest = () => {
  return {} as VercelRequest
}

describe('Hello API Endpoint', () => {
  describe('✅ Returns correct JSON response', () => {
    it('should return 200 status with correct message', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Hello from Project Kairos API!',
      })
    })
  })
})
