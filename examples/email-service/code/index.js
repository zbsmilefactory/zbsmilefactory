// Main Email Service Server
// Production-ready Node.js email service using Resend API

const express = require('express')
const cors = require('cors')
const path = require('path')
const { EmailService } = require('./email-service')

const app = express()
const PORT = process.env.PORT || 3001

// Initialize email service
const emailService = new EmailService()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../examples')))

// Serve the visual testing interface at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../examples/index.html'))
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Resend Email Service',
    version: '1.0.0',
    domain: 'smilefactory.co.zw'
  })
})

// Main email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { type, data } = req.body

    // Validate request
    if (!type || !data || !data.to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, data.to'
      })
    }

    let emailContent

    // Generate email content based on type
    if (type === 'welcome') {
      emailContent = emailService.generateWelcomeEmail(data.to, data.firstName)
    } else if (type === 'custom') {
      if (!data.subject || !data.html) {
        return res.status(400).json({
          success: false,
          error: 'Custom emails require subject and html fields'
        })
      }
      emailContent = {
        subject: data.subject,
        html: data.html
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type. Use "welcome" or "custom"'
      })
    }

    // Send email
    const result = await emailService.sendEmail({
      to: data.to,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (result.success) {
      res.json({
        success: true,
        data: {
          id: result.data.id,
          to: data.to,
          subject: emailContent.subject
        }
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      })
    }

  } catch (error) {
    console.error('Email API error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Test endpoint for quick testing
app.post('/api/test-email', async (req, res) => {
  try {
    const { email = 'effy@weblogik.co.zw', firstName = 'Test User' } = req.body

    const welcomeContent = emailService.generateWelcomeEmail(email, firstName)
    const result = await emailService.sendEmail({
      to: email,
      subject: welcomeContent.subject,
      html: welcomeContent.html
    })

    if (result.success) {
      res.json({
        success: true,
        message: `Test email sent to ${email}`,
        data: result.data
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      })
    }

  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send test email'
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log('🚀 Resend Email Service Started')
  console.log(`📧 Server running on http://localhost:${PORT}`)
  console.log(`🌐 Visual interface: http://localhost:${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
  console.log(`📤 Send email: POST http://localhost:${PORT}/api/send-email`)
  console.log('')
  console.log('✅ Ready to send emails!')
})

module.exports = app
