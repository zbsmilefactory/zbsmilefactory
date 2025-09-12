// Welcome Email Example
// Demonstrates how to send welcome emails using the EmailService

const { EmailService } = require('../code/email-service')

console.log('📧 Welcome Email Example')
console.log('=' .repeat(40))

async function sendWelcomeEmail() {
  try {
    // Initialize email service
    const emailService = new EmailService()
    console.log('✅ Email service initialized')

    // Example recipients (replace with real email addresses)
    const recipients = [
      { email: 'effy@weblogik.co.zw', name: 'Effy' },
      { email: 'npmaseko@gmail.com', name: 'Nkosana' },
      { email: 'ben@rilpix.com', name: 'Ben' }
    ]

    console.log(`\n🚀 Sending welcome emails to ${recipients.length} recipients...\n`)

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      
      console.log(`📧 ${i + 1}/${recipients.length}: Sending to ${recipient.name} (${recipient.email})`)

      // Generate welcome email content
      const welcomeContent = emailService.generateWelcomeEmail(recipient.email, recipient.name)
      
      // Send the email
      const result = await emailService.sendEmail({
        to: recipient.email,
        subject: welcomeContent.subject,
        html: welcomeContent.html
      })

      if (result.success) {
        console.log(`✅ Email sent successfully!`)
        console.log(`   Email ID: ${result.data.id}`)
      } else {
        console.log(`❌ Failed to send email: ${result.error}`)
      }

      // Add delay to respect rate limits (10 req/sec)
      if (i < recipients.length - 1) {
        console.log('⏳ Waiting 200ms...')
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      console.log('')
    }

    console.log('🎉 Welcome email example completed!')
    console.log('📬 Check recipient inboxes for the emails')

  } catch (error) {
    console.error('❌ Welcome email example failed:', error.message)
    process.exit(1)
  }
}

// Run the example
if (require.main === module) {
  sendWelcomeEmail()
}

module.exports = { sendWelcomeEmail }
