// EmailService Class - Production-ready email service using Resend API
// Clean, simple implementation for sending emails

const { Resend } = require('resend')

class EmailService {
  constructor() {
    // Initialize Resend with API key
    this.resend = new Resend(process.env.EMAIL_API_KEY || 're_3kB6iXzi_JoEJLekkdR2q8YyZQmrHE9Qs')

    // Default configuration
    this.defaultFrom = {
      email: 'verification@smilefactory.co.zw',
      name: 'SmileFactory'
    }
    this.siteUrl = 'https://smilefactory.co.zw'
  }

  /**
   * Generate welcome email content
   * @param {string} email - Recipient email address
   * @param {string} firstName - Recipient's first name (optional)
   * @returns {object} Email content with subject and html
   */
  generateWelcomeEmail(email, firstName = 'there') {
    const subject = 'Welcome to SmileFactory!'

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #0D8A3E 0%, #0a6b31 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to SmileFactory!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We're excited to have you on board</p>
        </div>

        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 30px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #0D8A3E; margin-top: 0;">Hello ${firstName}!</h2>

            <p>Thank you for joining SmileFactory. We're thrilled to welcome you to our community of innovators and creators.</p>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #0D8A3E;">
              <h3 style="margin-top: 0; color: #0D8A3E;">🚀 What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Explore our platform features</li>
                <li>Connect with other members</li>
                <li>Start your first project</li>
                <li>Join our community discussions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.siteUrl}"
                 style="background-color: #0D8A3E; color: white; padding: 15px 30px;
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block; transition: background-color 0.3s;">
                Get Started Now
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-bottom: 0;">
              If you have any questions, feel free to reach out to our support team. We're here to help!
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Best regards,<br><strong>The SmileFactory Team</strong></p>
            <p style="margin-top: 20px;">
              <a href="${this.siteUrl}" style="color: #0D8A3E; text-decoration: none;">${this.siteUrl}</a>
            </p>
          </div>
        </div>
      </div>
    `

    return { subject, html }
  }

  /**
   * Strip HTML tags from content (for plain text fallback)
   * @param {string} html - HTML content
   * @returns {string} Plain text content
   */
  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Send an email using Resend API
   * @param {object} emailData - Email data
   * @param {string} emailData.to - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.html - HTML content
   * @param {string} emailData.from - Sender email (optional)
   * @returns {object} Result object with success status and data/error
   */
  async sendEmail({ to, subject, html, from }) {
    try {
      // Validate required fields
      if (!to || !subject || !html) {
        throw new Error('Missing required fields: to, subject, html')
      }

      // Prepare email data
      const emailData = {
        from: from || `${this.defaultFrom.name} <${this.defaultFrom.email}>`,
        to: [to],
        subject: subject,
        html: html,
        text: this.stripHtml(html) // Fallback plain text
      }

      // Send email via Resend
      const result = await this.resend.emails.send(emailData)

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Export the EmailService class
module.exports = { EmailService }
