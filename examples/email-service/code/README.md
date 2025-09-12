# Core Implementation

This folder contains the production-ready Node.js email service implementation.

## 📁 Files

- **`index.js`** - Main Express server with API endpoints
- **`email-service.js`** - EmailService class for sending emails

## 🚀 Quick Start

```bash
# From the root directory
npm start
```

The service starts on `http://localhost:3001` with:
- Visual testing interface at `/`
- API endpoints at `/api/send-email` and `/api/test-email`
- Health check at `/health`

## 📧 EmailService Class

### Usage

```javascript
const { EmailService } = require('./email-service')

const emailService = new EmailService()

// Send welcome email
const welcomeContent = emailService.generateWelcomeEmail('user@example.com', 'John')
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: welcomeContent.subject,
  html: welcomeContent.html
})

// Send custom email
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Hello!</h1><p>Custom message</p>'
})
```

### Methods

#### `generateWelcomeEmail(email, firstName)`
Generates welcome email content.

**Parameters:**
- `email` (string) - Recipient email address
- `firstName` (string, optional) - Recipient's first name

**Returns:**
```javascript
{
  subject: 'Welcome to SmileFactory!',
  html: '<div>...</div>'
}
```

#### `sendEmail(emailData)`
Sends an email using Resend API.

**Parameters:**
```javascript
{
  to: 'recipient@example.com',
  subject: 'Email Subject',
  html: '<h1>Email content</h1>',
  from: 'optional-sender@domain.com' // defaults to SmileFactory
}
```

**Returns:**
```javascript
{
  success: true,
  data: { id: 'resend-email-id' }
}
// or
{
  success: false,
  error: 'Error message'
}
```

## 🔧 Configuration

### Environment Variables

```bash
EMAIL_API_KEY=re_3kB6iXzi_JoEJLekkdR2q8YyZQmrHE9Qs  # Resend API key
PORT=3001                                            # Server port
NODE_ENV=development                                 # Environment
```

### Default Settings

```javascript
{
  defaultFrom: {
    email: 'verification@smilefactory.co.zw',
    name: 'SmileFactory'
  },
  siteUrl: 'https://smilefactory.co.zw',
  apiKey: 're_3kB6iXzi_JoEJLekkdR2q8YyZQmrHE9Qs'
}
```

## 🌐 API Endpoints

### POST `/api/send-email`

Send welcome or custom emails.

**Request:**
```json
{
  "type": "welcome",
  "data": {
    "to": "user@example.com",
    "firstName": "John"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "email-id-from-resend",
    "to": "user@example.com",
    "subject": "Welcome to SmileFactory!"
  }
}
```

### POST `/api/test-email`

Quick test endpoint.

**Request:**
```json
{
  "email": "test@example.com",
  "firstName": "Test User"
}
```

### GET `/health`

Service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T10:30:00.000Z",
  "service": "Resend Email Service",
  "version": "1.0.0"
}
```

## 🚨 Error Handling

The service includes comprehensive error handling:

- **400 Bad Request** - Missing required fields
- **500 Internal Server Error** - Email sending failures
- **404 Not Found** - Invalid endpoints

All errors return:
```json
{
  "success": false,
  "error": "Error description"
}
```

## 🔗 Integration

### Express.js App

```javascript
const express = require('express')
const { EmailService } = require('./email-service')

const app = express()
const emailService = new EmailService()

app.post('/send-welcome', async (req, res) => {
  const { email, firstName } = req.body
  
  const welcomeContent = emailService.generateWelcomeEmail(email, firstName)
  const result = await emailService.sendEmail({
    to: email,
    subject: welcomeContent.subject,
    html: welcomeContent.html
  })
  
  res.json(result)
})
```

### Standalone Usage

```javascript
const { EmailService } = require('./email-service')

async function sendEmail() {
  const emailService = new EmailService()
  
  const result = await emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Hello!',
    html: '<h1>Hello World!</h1>'
  })
  
  console.log('Email sent:', result)
}

sendEmail()
```

---

**Ready to integrate?** Copy these files to your project and start sending emails!
