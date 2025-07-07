#!/usr/bin/env node

// Test Firebase Setup Script
// Run with: node scripts/test-firebase.mjs

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

console.log('🔥 Testing Firebase Configuration...\n')

// Check Frontend Environment Variables
const frontendVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

console.log('📱 Frontend Configuration:')
let frontendValid = true
frontendVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
    frontendValid = false
  }
})

// Check Backend Environment Variables
console.log('\n🖥️  Backend Configuration:')
let backendValid = true
const backendVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
]

backendVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    if (varName === 'FIREBASE_PRIVATE_KEY') {
      console.log(`✅ ${varName}: ${value.includes('BEGIN PRIVATE KEY') ? 'Valid private key format' : 'Invalid format'}`)
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 30)}...`)
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`)
    backendValid = false
  }
})

// Summary
console.log('\n📊 Summary:')
if (frontendValid && backendValid) {
  console.log('✅ All Firebase environment variables are configured!')
  console.log('\nNext steps:')
  console.log('1. Run "yarn dev" to start the development servers')
  console.log('2. Test authentication by implementing login/signup components')
} else {
  console.log('❌ Some Firebase configuration is missing.')
  console.log('\nPlease check your .env.local file and ensure all values are set correctly.')
  console.log('Refer to the Firebase Console for the correct values.')
}