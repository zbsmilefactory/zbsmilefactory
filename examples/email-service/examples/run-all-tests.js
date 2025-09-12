// Run All Tests
// Comprehensive test runner for the email service

const { spawn } = require('child_process')
const path = require('path')

console.log('🧪 Running All Email Service Tests')
console.log('=' .repeat(50))

const tests = [
  {
    name: 'Basic Email Test',
    file: 'test-basic-email.js',
    description: 'Tests basic email sending functionality'
  },
  {
    name: 'API Functionality Test',
    file: 'test-api-functionality.js',
    description: 'Tests email service class and API functionality'
  },
  {
    name: 'Real Recipients Test',
    file: 'test-real-recipients.js',
    description: 'Tests email sending to real recipients'
  }
]

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n📧 Running: ${test.name}`)
    console.log(`📝 Description: ${test.description}`)
    console.log(`📁 File: ${test.file}`)
    console.log('-' .repeat(40))

    const testProcess = spawn('node', [path.join(__dirname, test.file)], {
      stdio: 'inherit',
      cwd: __dirname
    })

    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} PASSED`)
      } else {
        console.log(`❌ ${test.name} FAILED (exit code: ${code})`)
      }
      resolve(code === 0)
    })

    testProcess.on('error', (error) => {
      console.error(`❌ ${test.name} ERROR:`, error.message)
      resolve(false)
    })
  })
}

async function runAllTests() {
  console.log(`\n🚀 Starting ${tests.length} tests...\n`)

  const results = []
  
  for (const test of tests) {
    const success = await runTest(test)
    results.push({ test: test.name, success })
    
    // Add delay between tests
    if (test !== tests[tests.length - 1]) {
      console.log('\n⏳ Waiting 2 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(50))

  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`✅ Passed: ${passed}/${tests.length}`)
  console.log(`❌ Failed: ${failed}/${tests.length}`)

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('✅ Email service is working correctly')
  } else {
    console.log('\n⚠️  Some tests failed')
    console.log('❌ Please check the errors above')
  }

  console.log('\n📋 Individual Results:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`  ${status} ${result.test}`)
  })

  console.log('')
  process.exit(failed === 0 ? 0 : 1)
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner error:', error)
  process.exit(1)
})
