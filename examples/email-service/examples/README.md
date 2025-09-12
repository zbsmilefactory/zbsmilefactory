# Examples & Tests

Working examples and comprehensive tests for the Resend email service.

## 🌐 Visual Testing Interface

**Start here!** Open the visual testing interface in your browser:

```bash
# Start the main service
npm start

# Open browser to: http://localhost:3001
```

The visual interface provides:
- 📧 **Email Form** - Send emails with a simple web form
- 🎯 **Email Types** - Choose between welcome and custom emails
- ✅ **Real-time Results** - See success/error messages instantly
- 🔍 **Service Status** - Check if the service is healthy

## 📚 Working Examples

### 1. **`welcome-email.js`** - Welcome Email Example
Demonstrates sending welcome emails to multiple recipients.

```bash
npm run example:welcome
```

### 2. **`custom-email.js`** - Custom Email Example
Shows how to send custom emails with your own HTML content.

```bash
npm run example:custom
```

### 3. **`server-example.js`** - Server Integration Example
Complete Express.js server showing email service integration.

```bash
npm run example:server
```

## 🧪 Test Suite

### 1. **`run-all-tests.js`** - Complete Test Suite
Runs all tests in sequence with detailed reporting.

```bash
npm test
```

### 2. **`test-real-recipients.js`** - Real Email Testing
Tests email sending to actual recipients.

```bash
npm run test:recipients
```

**What it tests:**
- Sends emails to 4 real recipients
- Tests rate limiting (200ms delays)
- Verifies email delivery
- Returns email IDs for tracking

### 3. **`test-api-functionality.js`** - API Functionality
Tests the EmailService class and API functionality.

```bash
# Test API functionality
npm run test:api

# Or directly
node tests/test-api-functionality.js
```

**What it tests:**
- EmailService class initialization
- Email template generation
- HTML content processing
- Email sending functionality
- Error handling

### 4. **`test-basic-email.js`** - Basic Email Test
Tests basic email sending functionality.

```bash
# Test basic email sending
npm run test:basic

# Or directly
node tests/test-basic-email.js
```

**What it tests:**
- Resend API integration
- Basic email sending
- Response handling
- Error scenarios

## 🚀 Quick Test

Run the complete test suite:

```bash
npm test
```

Expected output:
```
🧪 Running All Email Service Tests
==================================================

🚀 Starting 3 tests...

📧 Running: Basic Email Test
📝 Description: Tests basic email sending functionality
📁 File: test-basic-email.js
----------------------------------------
🚀 Starting email sending test...
📦 Loading Resend...
🔧 Initializing Resend with API key...
📧 Preparing test email...
📤 Sending email...
✅ Email sent successfully!
📧 Email ID: abc123...
✅ Basic Email Test PASSED

⏳ Waiting 2 seconds before next test...

📧 Running: API Functionality Test
📝 Description: Tests email service class and API functionality
📁 File: test-api-functionality.js
----------------------------------------
🧪 Testing Email Service API Functionality
==================================================
📦 Loading email service module...
✅ Resend module loaded successfully
🔧 Testing Resend initialization...
✅ Resend initialized successfully
📧 Testing EmailService class...
✅ EmailService class created successfully
📝 Testing email generation...
✅ Welcome email generated
📤 Testing actual email sending...
✅ Email sent successfully!
📧 Email ID: def456...
🎉 Email sending test PASSED!
✅ API Functionality Test PASSED

⏳ Waiting 2 seconds before next test...

📧 Running: Real Recipients Test
📝 Description: Tests email sending to real recipients
📁 File: test-real-recipients.js
----------------------------------------
🧪 Testing Email Service with All Real Recipients
============================================================
🚀 Starting email tests for 4 recipients...
📧 Test 1/4: Sending to Effy (effy@weblogik.co.zw)
✅ Email sent successfully to effy@weblogik.co.zw
📧 Email ID: ghi789...
⏳ Waiting 200ms before next email...
📧 Test 2/4: Sending to Nkosana (npmaseko@gmail.com)
✅ Email sent successfully to npmaseko@gmail.com
📧 Email ID: jkl012...
⏳ Waiting 200ms before next email...
📧 Test 3/4: Sending to Effy (effysetumeni87@gmail.com)
✅ Email sent successfully to effysetumeni87@gmail.com
📧 Email ID: mno345...
⏳ Waiting 200ms before next email...
📧 Test 4/4: Sending to Ben (ben@rilpix.com)
✅ Email sent successfully to ben@rilpix.com
📧 Email ID: pqr678...
🎉 ALL TESTS PASSED! Email service is working perfectly.
✅ Real Recipients Test PASSED

==================================================
📊 TEST RESULTS SUMMARY
==================================================
✅ Passed: 3/3
❌ Failed: 0/3

🎉 ALL TESTS PASSED!
✅ Email service is working correctly

📋 Individual Results:
  ✅ Basic Email Test
  ✅ API Functionality Test
  ✅ Real Recipients Test
```

## 🔧 Test Configuration

### Environment Variables

Tests will use environment variables if available:

```bash
# Create .env file in root directory
EMAIL_API_KEY=re_3kB6iXzi_JoEJLekkdR2q8YyZQmrHE9Qs
NODE_ENV=test
```

### Test Recipients

The real recipients test sends emails to:
- `effy@weblogik.co.zw`
- `npmaseko@gmail.com`
- `effysetumeni87@gmail.com`
- `ben@rilpix.com`

To modify recipients, edit `test-real-recipients.js`:

```javascript
const testRecipients = [
  { email: 'your-email@example.com', name: 'Your Name' },
  { email: 'another@example.com', name: 'Another Name' }
]
```

## 🚨 Troubleshooting

### Tests Failing

1. **Check API Key**
   ```bash
   # Verify API key is working
   curl -H "Authorization: Bearer re_3kB6iXzi_JoEJLekkdR2q8YyZQmrHE9Qs" \
        https://api.resend.com/emails
   ```

2. **Check Internet Connection**
   - Tests require internet access to reach Resend API
   - Verify firewall settings

3. **Check Rate Limits**
   - Resend free tier: 10 requests/second
   - Tests include delays to respect limits
   - If rate limited, wait and retry

### Individual Test Failures

**Basic Email Test Fails:**
- Check Resend API key
- Verify internet connection
- Check console for specific errors

**API Functionality Test Fails:**
- Check EmailService class import
- Verify Resend module installation
- Check for syntax errors

**Real Recipients Test Fails:**
- Verify recipient email addresses are valid
- Check spam folders for delivered emails
- Ensure domain `smilefactory.co.zw` is verified

### Debug Mode

Run tests with detailed logging:

```bash
NODE_ENV=development npm test
```

## 📊 Test Coverage

The test suite covers:

- ✅ **Resend API Integration** - Basic connectivity and authentication
- ✅ **Email Service Class** - Class initialization and methods
- ✅ **Email Generation** - Template creation and content processing
- ✅ **Email Sending** - Actual email delivery
- ✅ **Error Handling** - Proper error responses
- ✅ **Rate Limiting** - Compliance with API limits
- ✅ **Real Recipients** - End-to-end email delivery

## 🎯 Adding New Tests

1. **Create test file** in `/tests/` folder
2. **Follow naming convention**: `test-[feature].js`
3. **Add to test runner** in `run-all-tests.js`:

```javascript
const tests = [
  // ... existing tests
  {
    name: 'Your New Test',
    file: 'test-your-feature.js',
    description: 'Tests your new feature'
  }
]
```

4. **Add npm script** in `package.json`:

```json
{
  "scripts": {
    "test:your-feature": "node tests/test-your-feature.js"
  }
}
```

## 🔗 Related

- [Examples](../examples/) - Working examples and visual testing
- [Source Code](../src/) - Core implementation
- [Documentation](../) - Complete documentation

---

**Ready to test?** Run `npm test` to verify everything is working!
