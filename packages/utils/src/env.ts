// packages/utils/src/env.ts
import { z } from 'zod'

// Client-side environment variables (accessible in browser)
const clientEnvSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),
  VITE_API_URL: z.string().url(),
})

// Server-side environment variables (backend only)
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
})

// Optional environment variables
const optionalEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
})

export function validateClientEnv() {
  // For testing environments, return mock data
  if (process.env.NODE_ENV === 'test') {
    return {
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_API_URL: 'http://localhost:3001',
    }
  }

  try {
    return clientEnvSchema.parse({
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
      VITE_API_URL: process.env.VITE_API_URL,
    })
  } catch (error) {
    console.error('❌ Invalid client environment variables:', error)
    throw new Error('Invalid client environment configuration')
  }
}

export function validateServerEnv() {
  try {
    return {
      ...serverEnvSchema.parse(process.env),
      ...optionalEnvSchema.parse(process.env),
    }
  } catch (error) {
    console.error('❌ Invalid server environment variables:', error)
    throw new Error('Invalid server environment configuration')
  }
}

// Type exports for better TypeScript support
export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema> & z.infer<typeof optionalEnvSchema>
