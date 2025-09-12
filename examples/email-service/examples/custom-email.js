// Custom Email Example
// Demonstrates how to send custom emails with your own content

const { EmailService } = require('../code/email-service')

console.log('📧 Custom Email Example')
console.log('=' .repeat(40))

async function sendCustomEmail() {
  try {
    // Initialize email service
    const emailService = new EmailService()
    console.log('✅ Email service initialized')

    // Example custom emails
    const customEmails = [
      {
        to: 'effy@weblogik.co.zw',
        subject: 'Welcome to Our Platform!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #0D8A3E;">Hello Effy!</h1>
            <p>Welcome to our amazing platform. We're excited to have you on board!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://smilefactory.co.zw" 
                 style="background-color: #0D8A3E; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                Get Started
              </a>
            </div>
            <p>Best regards,<br>The SmileFactory Team</p>
          </div>
        `
      },
      {
        to: 'npmaseko@gmail.com',
        subject: 'Your Account is Ready!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #0D8A3E;">Account Activated Successfully</h2>
            <p>Hi Nkosana,</p>
            <p>Your account has been successfully activated and is ready to use.</p>
            <ul>
              <li>✅ Email verified</li>
              <li>✅ Profile created</li>
              <li>✅ Welcome bonus applied</li>
            </ul>
            <p>You can now access all features of our platform.</p>
            <p>Happy coding!<br>The Development Team</p>
          </div>
        `
      },
      {
        to: 'ben@rilpix.com',
        subject: 'Project Update Notification',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #0D8A3E;">Project Status Update</h2>
            <p>Hi Ben,</p>
            <p>We wanted to update you on the progress of your project:</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📊 Progress Summary</h3>
              <p><strong>Completion:</strong> 75%</p>
              <p><strong>Next Milestone:</strong> Beta Testing</p>
              <p><strong>Expected Delivery:</strong> Next Week</p>
            </div>
            <p>We'll keep you updated as we make progress.</p>
            <p>Best regards,<br>Project Management Team</p>
          </div>
        `
      }
    ]

    console.log(`\n🚀 Sending ${customEmails.length} custom emails...\n`)

    for (let i = 0; i < customEmails.length; i++) {
      const email = customEmails[i]
      
      console.log(`📧 ${i + 1}/${customEmails.length}: Sending to ${email.to}`)
      console.log(`   Subject: ${email.subject}`)

      // Send the custom email
      const result = await emailService.sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html
      })

      if (result.success) {
        console.log(`✅ Email sent successfully!`)
        console.log(`   Email ID: ${result.data.id}`)
      } else {
        console.log(`❌ Failed to send email: ${result.error}`)
      }

      // Add delay to respect rate limits (10 req/sec)
      if (i < customEmails.length - 1) {
        console.log('⏳ Waiting 200ms...')
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      console.log('')
    }

    console.log('🎉 Custom email example completed!')
    console.log('📬 Check recipient inboxes for the emails')

  } catch (error) {
    console.error('❌ Custom email example failed:', error.message)
    process.exit(1)
  }
}

// Run the example
if (require.main === module) {
  sendCustomEmail()
}

module.exports = { sendCustomEmail }
