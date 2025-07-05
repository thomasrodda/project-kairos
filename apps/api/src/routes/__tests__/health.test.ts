import request from 'supertest'
import { setupTestApp, expectSuccessResponse } from '../../test/helpers'
import type { Express } from 'express'

describe('Health Check Endpoint', () => {
  let app: Express

  beforeAll(() => {
    app = setupTestApp()
  })

  describe('✅ Core Functionality', () => {
    it('should return 200 status with correct health check response', async () => {
      const response = await request(app).get('/api/health')

      expectSuccessResponse(response)
      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
      })
    })

    it('should include timestamp in ISO format', async () => {
      const response = await request(app).get('/api/health')

      expectSuccessResponse(response)
      const { timestamp } = response.body

      // Verify it's a valid ISO string
      expect(() => new Date(timestamp)).not.toThrow()
      expect(new Date(timestamp).toISOString()).toBe(timestamp)
    })

    it('should set correct content-type header', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })

  describe('✅ HTTP Method Validation', () => {
    const unsupportedMethods = ['post', 'put', 'delete', 'patch'] as const

    unsupportedMethods.forEach((method) => {
      it(`should return 404 for ${method.toUpperCase()} requests`, async () => {
        const response = await request(app)[method]('/api/health')

        expect(response.status).toBe(404)
      })
    })

    it('should handle HEAD requests', async () => {
      const response = await request(app).head('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({}) // HEAD requests have no body
    })

    it('should handle OPTIONS requests for CORS', async () => {
      const response = await request(app).options('/api/health')

      expect(response.status).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })

  describe('✅ Performance and Reliability', () => {
    it('should respond quickly (under 100ms)', async () => {
      const start = Date.now()
      await request(app).get('/api/health')
      const duration = Date.now() - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () => request(app).get('/api/health'))

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expectSuccessResponse(response)
        expect(response.body.status).toBe('ok')
      })
    })

    it('should not require authentication', async () => {
      const response = await request(app).get('/api/health').set('Authorization', 'Bearer invalid-token')

      expectSuccessResponse(response)
    })
  })

  describe('✅ Edge Cases', () => {
    it('should handle requests with query parameters', async () => {
      const response = await request(app).get('/api/health?test=true&foo=bar')

      expectSuccessResponse(response)
      expect(response.body.status).toBe('ok')
    })

    it('should handle requests with custom headers', async () => {
      const response = await request(app).get('/api/health').set('X-Custom-Header', 'test-value').set('Accept', 'application/json')

      expectSuccessResponse(response)
    })

    it('should ignore request body if provided', async () => {
      const response = await request(app).get('/api/health').send({ unexpected: 'data' })

      expectSuccessResponse(response)
    })

    it('should handle case-insensitive path', async () => {
      const response = await request(app).get('/API/HEALTH')

      // Express routes are case-insensitive in our setup
      expect(response.status).toBe(200)
    })
  })

  describe('✅ Monitoring and Observability', () => {
    it('should return consistent timestamp format across requests', async () => {
      const responses = await Promise.all([request(app).get('/api/health'), request(app).get('/api/health'), request(app).get('/api/health')])

      const timestamps = responses.map((r) => r.body.timestamp)

      timestamps.forEach((timestamp) => {
        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })
    })

    it('should have incrementing timestamps', async () => {
      const response1 = await request(app).get('/api/health')
      await new Promise((resolve) => setTimeout(resolve, 10)) // Small delay
      const response2 = await request(app).get('/api/health')

      const time1 = new Date(response1.body.timestamp).getTime()
      const time2 = new Date(response2.body.timestamp).getTime()

      expect(time2).toBeGreaterThan(time1)
    })
  })
})
