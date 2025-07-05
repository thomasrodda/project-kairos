export const securityConfig = {
  // Rate limiting configurations
  rateLimits: {
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
    auth: {
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute default
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '20'),
    },
    fileUpload: {
      windowMs: parseInt(process.env.FILE_UPLOAD_RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour default
      max: parseInt(process.env.FILE_UPLOAD_RATE_LIMIT_MAX_REQUESTS || '10'),
    },
  },

  // Request size limits
  requestSizeLimits: {
    json: process.env.JSON_SIZE_LIMIT || '10mb',
    urlencoded: process.env.URL_ENCODED_SIZE_LIMIT || '10mb',
    raw: process.env.RAW_SIZE_LIMIT || '50mb',
  },

  // CORS allowed origins
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [process.env.VITE_API_URL || 'http://localhost:3000'],

  // Security headers
  contentSecurityPolicy: {
    enabled: process.env.CSP_ENABLED !== 'false',
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'default-dev-secret-change-this',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours default
  },

  // JWT configuration (if used)
  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-jwt-secret-change-this',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // IP blocking
  ipBlocking: {
    enabled: process.env.IP_BLOCKING_ENABLED === 'true',
    blocklist: process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [],
  },

  // Security logging
  logging: {
    enabled: process.env.SECURITY_LOGGING_ENABLED !== 'false',
    level: process.env.SECURITY_LOG_LEVEL || 'info',
  },
}
