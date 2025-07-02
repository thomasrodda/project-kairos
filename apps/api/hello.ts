import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method Not Allowed',
      message: `HTTP method ${req.method} is not supported. Only GET is allowed.`,
    })
    return
  }

  // Validate Accept header if present
  const acceptHeader = req.headers?.accept
  if (acceptHeader && !acceptHeader.includes('application/json') && !acceptHeader.includes('*/*')) {
    res.status(406).json({
      error: 'Not Acceptable',
      message: 'This endpoint only returns application/json',
    })
    return
  }

  // Set content type
  res.setHeader('Content-Type', 'application/json')

  // Return success response
  res.status(200).json({
    message: 'Hello from Project Kairos API!',
    timestamp: new Date().toISOString(),
  })
}
