// Test basic email sending using EmailService
console.log('🚀 Starting basic email sending test...')

async function testEmailSending() {
  try {
    console.log('📦 Loading EmailService...')
    const { EmailService } = require('../code/email-service')

    console.log('🔧 Initializing EmailService...')
    const emailService = new EmailService()

    console.log('📧 Preparing test email...')
    const testEmail = {
      to: 'effy@weblogik.co.zw',
      subject: 'Test Email from Node.js Service',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 24px; font-family: Arial, sans-serif;">
          <h1 style="color: #0D8A3E;">Hello Effy!</h1>
          <p>This is a test email sent from the Node.js email service.</p>
          <p>If you receive this email, the service is working correctly!</p>
          <p>Best regards,<br>The SmileFactory Team</p>
        </div>
      `
    }

    console.log('📤 Sending email...')
    console.log('- To:', testEmail.to)
    console.log('- Subject:', testEmail.subject)

    const result = await emailService.sendEmail(testEmail)

    if (!result.success) {
      console.error('❌ Email sending failed:')
      console.error('Error:', result.error)
      return false
    }

    console.log('✅ Email sent successfully!')
    console.log('📧 Email ID:', result.data.id)
    console.log('📧 Response:', result.data)

    return true
    
  } catch (error) {
    console.error('❌ Email sending test failed:')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    return false
  }
}

// Run the test
testEmailSending().then(success => {
  if (success) {
    console.log('🎉 Email sending test completed successfully!')
    console.log('📬 Check your email inbox (and spam folder) for the test email.')
  } else {
    console.log('💥 Email sending test failed!')
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error)
})
