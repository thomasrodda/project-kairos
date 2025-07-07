import Redis from 'ioredis'

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    // Reconnect after
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
}

// Create Redis client
export const redis = new Redis(redisConfig)

// Handle Redis connection events
let redisErrorLogged = false

redis.on('connect', () => {
  console.log('Redis connected successfully')
  redisErrorLogged = false
})

redis.on('error', (_err) => {
  // Only log the first error to avoid spam
  if (!redisErrorLogged) {
    console.warn('Redis not available - sync features will be disabled. To enable, install and start Redis.')
    redisErrorLogged = true
  }
})

redis.on('ready', () => {
  console.log('Redis ready to accept commands')
  redisErrorLogged = false
})

redis.on('close', () => {
  // Silent close
})

redis.on('reconnecting', (_delay: number) => {
  // Silent reconnect attempts
})

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<{ connected: boolean; error?: string }> {
  try {
    const result = await redis.ping()
    return { connected: result === 'PONG' }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Gracefully close Redis connection
 */
export async function closeRedis(): Promise<void> {
  await redis.quit()
}
