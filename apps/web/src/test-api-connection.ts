// Test script to verify API connection
import { api } from './utils/api/client'

async function testConnection() {
  console.log('Testing API connection...')

  try {
    // Test basic connection
    const response = await fetch('http://localhost:3001/api/health')
    console.log('Health check response:', response.status)

    // Test auth endpoints without authentication
    try {
      await api.auth.me()
      console.log('❌ Auth check should have failed without token')
    } catch (error: any) {
      console.log('✅ Auth check properly rejected:', error.message)
    }

    console.log('\nAPI connection test complete!')
  } catch (error) {
    console.error('❌ API connection failed:', error)
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  testConnection()
}
