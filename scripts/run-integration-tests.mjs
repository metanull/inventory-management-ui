#!/usr/bin/env node

/**
 * Integration Test Runner
 * 
 * This script provides an interactive way to run integration tests
 * with proper safety checks and guidance.
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function main() {
  console.log('🧪 Integration Test Runner')
  console.log('=' .repeat(50))
  
  // Check if API server is running
  console.log('\n1️⃣ Checking API server...')
  const apiUrl = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${apiUrl}/country`, { stdio: 'pipe' })
    console.log('✅ API server is accessible')
  } catch (error) {
    console.log('❌ API server is not accessible')
    console.log(`Please ensure your API server is running at: ${apiUrl}`)
    process.exit(1)
  }
  
  // Check environment configuration
  console.log('\n2️⃣ Checking environment configuration...')
  if (existsSync('.env.integration.local')) {
    console.log('✅ Found .env.integration.local')
  } else {
    console.log('⚠️ No .env.integration.local found')
    console.log('Copy .env.integration to .env.integration.local and configure it')
  }
  
  // Safety check for destructive tests
  console.log('\n3️⃣ Test Mode Selection')
  console.log('Choose test mode:')
  console.log('1. Read-only tests (safe - only GET requests)')
  console.log('2. Full CRUD tests (destructive - creates/modifies/deletes data)')
  
  const mode = await question('\nEnter your choice (1 or 2): ')
  
  if (mode === '2') {
    console.log('\n⚠️  DESTRUCTIVE TEST MODE')
    console.log('This will create, modify, and delete real data!')
    console.log('Only proceed if you are using a test database.')
    
    const confirm = await question('\nAre you using a TEST database? (yes/no): ')
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Aborted for safety')
      process.exit(0)
    }
    
    const doubleConfirm = await question('Type "DELETE MY DATA" to confirm: ')
    
    if (doubleConfirm !== 'DELETE MY DATA') {
      console.log('❌ Confirmation failed, aborted for safety')
      process.exit(0)
    }
  }
  
  rl.close()
  
  // Run the appropriate tests
  console.log('\n4️⃣ Running tests...')
  console.log('=' .repeat(50))
  
  try {
    if (mode === '2') {
      console.log('🔥 Running DESTRUCTIVE integration tests')
      execSync('npm run test:integration:destructive', { stdio: 'inherit' })
    } else {
      console.log('📖 Running READ-ONLY integration tests')
      execSync('npm run test:integration', { stdio: 'inherit' })
    }
    
    console.log('\n✅ Integration tests completed successfully!')
    
  } catch (error) {
    console.log('\n❌ Integration tests failed')
    process.exit(1)
  }
}

main().catch(console.error)
