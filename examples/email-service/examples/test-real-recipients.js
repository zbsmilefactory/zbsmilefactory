// Test email sending to all real recipients
// This script tests the email service with all specified real email addresses

const { EmailService } = require('../code/email-service')

console.log('🧪 Testing Email Service with All Real Recipients')
console.log('=' .repeat(60))

// Initialize email service using the same implementation as examples
const emailService = new EmailService()

// Real test recipients as specified
const testRecipients = [
  { email: 'effy@weblogik.co.zw', name: 'Effy' },
  { email: 'npmaseko@gmail.com', name: 'Nkosana' },
  { email: 'effysetumeni87@gmail.com', name: 'Effy' },
  { email: 'ben@rilpix.com', name: 'Ben' }
]

async function sendTestEmail(recipient, index) {
  try {
    console.log(`\n📧 Test ${index + 1}/4: Sending to ${recipient.name} (${recipient.email})`)
    
    // Use the same EmailService implementation as examples
    const welcomeContent = emailService.generateWelcomeEmail(recipient.email, recipient.name)
    const result = await emailService.sendEmail({
      to: recipient.email,
      subject: welcomeContent.subject,
      html: welcomeContent.html
    })

    if (!result.success) {
      console.error(`❌ Failed to send to ${recipient.email}:`, result.error)
      return { success: false, error: result.error, recipient }
    }

    console.log(`✅ Email sent successfully to ${recipient.email}`)
    console.log(`📧 Email ID: ${result.data.id}`)

    return { success: true, data: result.data, recipient }

  } catch (error) {
    console.error(`❌ Error sending to ${recipient.email}:`, error.message)
    return { success: false, error: error.message, recipient }
  }
}

async function testAllRecipients() {
  console.log(`\n🚀 Starting email tests for ${testRecipients.length} recipients...`)
  
  const results = []
  
  // Send emails with delay to respect rate limits
  for (let i = 0; i < testRecipients.length; i++) {
    const result = await sendTestEmail(testRecipients[i], i)
    results.push(result)
    
    // Add delay between emails (10 req/sec limit)
    if (i < testRecipients.length - 1) {
      console.log('⏳ Waiting 200ms before next email...')
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(60))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}/${testRecipients.length}`)
  console.log(`❌ Failed: ${failed.length}/${testRecipients.length}`)
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL EMAILS:')
    successful.forEach(result => {
      console.log(`  - ${result.recipient.email}: ${result.data.id}`)
    })
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED EMAILS:')
    failed.forEach(result => {
      console.log(`  - ${result.recipient.email}: ${result.error}`)
    })
  }
  
  console.log('\n🎯 FINAL RESULT:')
  if (failed.length === 0) {
    console.log('🎉 ALL TESTS PASSED! Email service is working perfectly.')
    console.log('📬 Check all recipient inboxes for the test emails.')
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.')
  }
  
  return failed.length === 0
}

// Run the test
testAllRecipients().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
