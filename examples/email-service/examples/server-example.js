// Server Example
// Demonstrates how to integrate the email service into your own Express.js application

const express = require('express')
const { EmailService } = require('../code/email-service')

console.log('🚀 Server Integration Example')
console.log('=' .repeat(40))

// Create Express app
const app = express()
const PORT = 3002 // Different port to avoid conflicts

// Initialize email service
const emailService = new EmailService()

// Middleware
app.use(express.json())

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Email Service Integration Example',
    endpoints: [
      'GET / - This message',
      'POST /register - Simulate user registration with welcome email',
      'POST /notify - Send custom notification email',
      'GET /health - Service health check'
    ]
  })
})

// Simulate user registration with welcome email
app.post('/register', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      })
    }

    console.log(`📝 New user registration: ${email}`)

    // Simulate user creation in database
    const user = {
      id: Date.now(),
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString()
    }

    // Send welcome email
    const welcomeContent = emailService.generateWelcomeEmail(email, firstName)
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: welcomeContent.subject,
      html: welcomeContent.html
    })

    if (emailResult.success) {
      console.log(`✅ Welcome email sent to ${email} (ID: ${emailResult.data.id})`)
      
      res.json({
        success: true,
        message: 'User registered successfully',
        user,
        email: {
          sent: true,
          id: emailResult.data.id
        }
      })
    } else {
      console.log(`❌ Failed to send welcome email: ${emailResult.error}`)
      
      res.json({
        success: true,
        message: 'User registered but email failed',
        user,
        email: {
          sent: false,
          error: emailResult.error
        }
      })
    }

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    })
  }
})

// Send custom notification email
app.post('/notify', async (req, res) => {
  try {
    const { email, subject, message, type = 'info' } = req.body

    if (!email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email, subject, and message are required'
      })
    }

    console.log(`📧 Sending notification to ${email}`)

    // Create notification email HTML
    const typeColors = {
      info: '#17a2b8',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545'
    }

    const typeIcons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: ${typeColors[type]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2>${typeIcons[type]} ${subject}</h2>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 6px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This is an automated notification from SmileFactory.
          </p>
        </div>
      </div>
    `

    // Send notification email
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: `[${type.toUpperCase()}] ${subject}`,
      html
    })

    if (emailResult.success) {
      console.log(`✅ Notification sent to ${email} (ID: ${emailResult.data.id})`)
      
      res.json({
        success: true,
        message: 'Notification sent successfully',
        email: {
          id: emailResult.data.id,
          to: email,
          subject: `[${type.toUpperCase()}] ${subject}`
        }
      })
    } else {
      console.log(`❌ Failed to send notification: ${emailResult.error}`)
      
      res.status(500).json({
        success: false,
        error: emailResult.error
      })
    }

  } catch (error) {
    console.error('Notification error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send notification'
    })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Email Service Integration Example',
    version: '1.0.0'
  })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🌐 Server running on http://localhost:${PORT}`)
    console.log('\n📋 Try these examples:')
    console.log('\n1. Register a user with welcome email:')
    console.log(`   curl -X POST http://localhost:${PORT}/register \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{"email": "user@example.com", "firstName": "John", "lastName": "Doe"}'`)
    console.log('\n2. Send a notification:')
    console.log(`   curl -X POST http://localhost:${PORT}/notify \\`)
    console.log(`     -H "Content-Type: application/json" \\`)
    console.log(`     -d '{"email": "user@example.com", "subject": "Test Notification", "message": "This is a test message", "type": "info"}'`)
    console.log('\n✅ Server ready for email integration testing!')
  })
}

module.exports = app
