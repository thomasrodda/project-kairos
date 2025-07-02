// apps/api/hello.test.ts
import handler from './hello'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock response object for testing
const createMockResponse = () => {
  const res = {
    headers: new Map<string, string>(),
  } as unknown as VercelResponse

  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.end = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn((key: string, value: string) => {
    ;(res.headers as Map<string, string>).set(key, value)
    return res
  })

  return res
}

// Mock request object for testing
const createMockRequest = (overrides: Partial<VercelRequest> = {}) => {
  return {
    method: 'GET',
    headers: {},
    ...overrides,
  } as VercelRequest
}

describe('Hello API Endpoint', () => {
  describe('✅ Core Functionality', () => {
    it('should return 200 status with correct message for GET request', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Hello from Project Kairos API!',
        timestamp: expect.any(String),
      })
    })

    it('should include timestamp in ISO format', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0]
      expect(new Date(jsonCall.timestamp)).toBeInstanceOf(Date)
      expect(() => new Date(jsonCall.timestamp).toISOString()).not.toThrow()
    })

    it('should set Content-Type header to application/json', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
    })

    it('should handle OPTIONS preflight requests', () => {
      const req = createMockRequest({ method: 'OPTIONS' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.end).toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe('✅ HTTP Method Validation', () => {
    const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']

    unsupportedMethods.forEach((method) => {
      it(`should reject ${method} requests with 405 status`, () => {
        const req = createMockRequest({ method })
        const res = createMockResponse()

        handler(req, res)

        expect(res.status).toHaveBeenCalledWith(405)
        expect(res.json).toHaveBeenCalledWith({
          error: 'Method Not Allowed',
          message: `HTTP method ${method} is not supported. Only GET is allowed.`,
        })
      })
    })

    it('should accept GET requests', () => {
      const req = createMockRequest({ method: 'GET' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should accept OPTIONS requests for CORS preflight', () => {
      const req = createMockRequest({ method: 'OPTIONS' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.end).toHaveBeenCalled()
    })
  })

  describe('✅ CORS Headers', () => {
    it('should set CORS headers for GET requests', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS')
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type')
    })

    it('should set CORS headers for OPTIONS requests', () => {
      const req = createMockRequest({ method: 'OPTIONS' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, OPTIONS')
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type')
    })

    it('should set CORS headers even for error responses', () => {
      const req = createMockRequest({ method: 'POST' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
      expect(res.status).toHaveBeenCalledWith(405)
    })
  })

  describe('✅ Security Headers', () => {
    it('should set security headers for all requests', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    })

    it('should set security headers for error responses', () => {
      const req = createMockRequest({ method: 'DELETE' })
      const res = createMockResponse()

      handler(req, res)

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    })
  })

  describe('✅ Content Negotiation', () => {
    it('should accept requests with Accept: application/json', () => {
      const req = createMockRequest({
        headers: { accept: 'application/json' },
      })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should accept requests with Accept: */*', () => {
      const req = createMockRequest({
        headers: { accept: '*/*' },
      })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should accept requests without Accept header', () => {
      const req = createMockRequest()
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should reject requests with incompatible Accept header', () => {
      const req = createMockRequest({
        headers: { accept: 'text/html' },
      })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(406)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not Acceptable',
        message: 'This endpoint only returns application/json',
      })
    })

    it('should reject requests with Accept: text/plain', () => {
      const req = createMockRequest({
        headers: { accept: 'text/plain' },
      })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(406)
    })

    it('should accept requests with multiple Accept values including json', () => {
      const req = createMockRequest({
        headers: { accept: 'text/html, application/json, application/xml' },
      })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('✅ Error Handling', () => {
    it('should return proper error structure for 405 errors', () => {
      const req = createMockRequest({ method: 'POST' })
      const res = createMockResponse()

      handler(req, res)

      const errorResponse = (res.json as jest.Mock).mock.calls[0][0]
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse).toHaveProperty('message')
      expect(typeof errorResponse.error).toBe('string')
      expect(typeof errorResponse.message).toBe('string')
    })

    it('should return proper error structure for 406 errors', () => {
      const req = createMockRequest({
        headers: { accept: 'text/xml' },
      })
      const res = createMockResponse()

      handler(req, res)

      const errorResponse = (res.json as jest.Mock).mock.calls[0][0]
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse).toHaveProperty('message')
      expect(typeof errorResponse.error).toBe('string')
      expect(typeof errorResponse.message).toBe('string')
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle requests with empty headers object', () => {
      const req = createMockRequest({ headers: {} })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should handle requests with null headers', () => {
      const req = createMockRequest({ headers: null as any })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should handle case-insensitive HTTP methods', () => {
      const req = createMockRequest({ method: 'get' as any })
      const res = createMockResponse()

      handler(req, res)

      // Should treat lowercase 'get' as unsupported since we check exact match
      expect(res.status).toHaveBeenCalledWith(405)
    })

    it('should handle undefined method as GET', () => {
      const req = createMockRequest({ method: undefined as any })
      const res = createMockResponse()

      handler(req, res)

      expect(res.status).toHaveBeenCalledWith(405)
    })
  })

  describe('✅ Response Headers Order', () => {
    it('should set headers before sending response', () => {
      const req = createMockRequest()
      const res = createMockResponse()
      const callOrder: string[] = []

      res.setHeader = jest.fn((key: string, value: string) => {
        callOrder.push(`setHeader:${key}`)
        return res
      })
      res.status = jest.fn(() => {
        callOrder.push('status')
        return res
      })
      res.json = jest.fn(() => {
        callOrder.push('json')
        return res
      })

      handler(req, res)

      // Headers should be set before status and json
      const setHeaderIndex = callOrder.findIndex((call) => call.startsWith('setHeader'))
      const statusIndex = callOrder.findIndex((call) => call === 'status')
      const jsonIndex = callOrder.findIndex((call) => call === 'json')

      expect(setHeaderIndex).toBeLessThan(statusIndex)
      expect(setHeaderIndex).toBeLessThan(jsonIndex)
    })
  })
})
