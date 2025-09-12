# 4. Security and Authentication Design

## 🔒 **Security Architecture Overview**

The ZbInnovation platform implements a comprehensive security framework designed to protect user data, ensure secure communications, and maintain platform integrity. The security design follows industry best practices and compliance requirements.

## 🛡️ **Security Framework**

### **Defense in Depth Strategy**
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  HTTPS/TLS, CSP, CORS, Input Validation, XSS Protection   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│   JWT Authentication, RBAC, Rate Limiting, API Security    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                            │
│    Encryption at Rest, Database Security, Backup Security  │
└─────────────────────────────────────────────────────────────┘
```

### **Security Principles**
- **Zero Trust Architecture**: Verify every request and user
- **Principle of Least Privilege**: Minimum necessary access rights
- **Data Minimization**: Collect only required information
- **Encryption Everywhere**: Data protection in transit and at rest
- **Continuous Monitoring**: Real-time security monitoring and alerting

## 🔐 **Authentication System Design**

### **JWT-Based Authentication**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "profileType": "innovator",
    "roles": ["USER", "VERIFIED"],
    "permissions": ["READ_PROFILE", "WRITE_CONTENT"],
    "iat": 1642248600,
    "exp": 1642335000,
    "iss": "zbinnovation-platform",
    "aud": "zbinnovation-users"
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### **Token Management**
**Access Tokens**:
- **Lifetime**: 24 hours
- **Purpose**: API access and authentication
- **Storage**: Memory only (not localStorage)
- **Refresh**: Automatic refresh before expiration

**Refresh Tokens**:
- **Lifetime**: 30 days
- **Purpose**: Generate new access tokens
- **Storage**: Secure HTTP-only cookies
- **Rotation**: New refresh token with each use

### **Multi-Factor Authentication (MFA)**
**MFA Triggers**:
- First-time login from new device
- Sensitive operations (password change, profile deletion)
- Suspicious activity detection
- User-enabled always-on MFA

**MFA Methods**:
- **SMS OTP**: 6-digit codes via SMS
- **Email OTP**: 6-digit codes via email
- **Authenticator Apps**: TOTP-based (Google Authenticator, Authy)
- **Backup Codes**: Single-use recovery codes

## 🔑 **Authorization and Access Control**

### **Role-Based Access Control (RBAC)**
```typescript
interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  profileTypes: ProfileType[];
}

interface Permission {
  resource: string;
  actions: string[];
  conditions?: AccessCondition[];
}

// Example Role Definitions
const roles = {
  USER: {
    permissions: ['READ_PUBLIC_CONTENT', 'WRITE_OWN_CONTENT', 'CONNECT_USERS']
  },
  VERIFIED_USER: {
    inherits: ['USER'],
    permissions: ['CREATE_EVENTS', 'JOIN_GROUPS', 'ACCESS_MARKETPLACE']
  },
  PREMIUM_USER: {
    inherits: ['VERIFIED_USER'],
    permissions: ['UNLIMITED_CONNECTIONS', 'ADVANCED_ANALYTICS', 'PRIORITY_SUPPORT']
  },
  MODERATOR: {
    inherits: ['VERIFIED_USER'],
    permissions: ['MODERATE_CONTENT', 'MANAGE_REPORTS', 'SUSPEND_USERS']
  },
  ADMIN: {
    inherits: ['MODERATOR'],
    permissions: ['MANAGE_USERS', 'SYSTEM_CONFIGURATION', 'ACCESS_ANALYTICS']
  }
};
```

### **Profile Type-Specific Permissions**
**Innovator Permissions**:
- Create project showcases
- Apply for funding opportunities
- Access investor directory
- Join innovation groups

**Business Investor Permissions**:
- Access startup directory
- Create investment opportunities
- View detailed startup analytics
- Access due diligence tools

**Mentor Permissions**:
- Create educational content
- Access mentee matching system
- Schedule mentoring sessions
- Track mentoring impact

### **Resource-Level Security**
```javascript
// Express.js middleware for resource-level authorization
const checkPostPermission = async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user;

    try {
        const hasWritePermission = await hasPermission(user.id, postId, 'Post', 'WRITE');
        const isModerator = user.roles.includes('MODERATOR');

        if (hasWritePermission || isModerator) {
            next();
        } else {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Permission check failed' });
    }
};

// Route with permission middleware
app.put('/posts/:postId', checkPostPermission, updatePost);

// Filter posts based on read permissions
const filterUserPosts = async (posts, user) => {
    return posts.filter(post => {
        return hasPermission(user.id, post.id, 'READ') || post.visibility === 'PUBLIC';
    });
};
```

## 🔒 **Data Protection and Encryption**

### **Encryption Standards**
**Data in Transit**:
- **TLS 1.3**: All client-server communications
- **Certificate Pinning**: Mobile app security
- **HSTS**: HTTP Strict Transport Security
- **Perfect Forward Secrecy**: Ephemeral key exchange

**Data at Rest**:
- **AES-256**: Database encryption
- **Field-Level Encryption**: Sensitive data (PII, financial)
- **Key Management**: AWS KMS or HashiCorp Vault
- **Backup Encryption**: Encrypted database backups

### **Sensitive Data Handling**
```javascript
// Prisma schema for UserProfile with encryption annotations
// prisma/schema.prisma
model UserProfile {
  userId    String @id
  email     String // Hashed for search, encrypted for storage
  phoneNumber String? // Field-level encryption required
  socialSecurityNumber String? // High-sensitivity data - encrypted
  profileType String // Non-sensitive, not encrypted

  @@map("user_profiles")
}

// Service layer with encryption handling
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class UserProfileService {
  // Encrypt sensitive fields before storage
  async encryptSensitiveData(data) {
    const encrypted = { ...data };

    if (data.phoneNumber) {
      encrypted.phoneNumber = this.encrypt(data.phoneNumber);
    }

    if (data.socialSecurityNumber) {
      encrypted.socialSecurityNumber = this.encrypt(data.socialSecurityNumber);
    }

    return encrypted;
  }

  encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }
}
```

### **Password Security**
```javascript
const bcrypt = require('bcrypt');

class PasswordService {
    constructor() {
        this.BCRYPT_ROUNDS = 12;
        this.PASSWORD_HISTORY_COUNT = 5;
    }

    async hashPassword(plainPassword) {
        return await bcrypt.hash(plainPassword, this.BCRYPT_ROUNDS);
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async isPasswordReused(userId, newPassword) {
        const passwordHistory = await this.getPasswordHistory(userId);

        for (const oldHash of passwordHistory) {
            if (await bcrypt.compare(newPassword, oldHash)) {
                return true;
            }
        }
        return false;
    }

    async getPasswordHistory(userId) {
        // Retrieve password history from database
        const history = await prisma.passwordHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: this.PASSWORD_HISTORY_COUNT,
            select: { hashedPassword: true }
        });

        return history.map(entry => entry.hashedPassword);
    }
}

module.exports = PasswordService;
```

## 🛡️ **Application Security**

### **Input Validation and Sanitization**
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

const router = express.Router();

// Input validation middleware
const validateUserInput = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .custom(async (email) => {
            await validateEmailDomain(email);
            return true;
        }),
    body('name')
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s]+$/)
        .customSanitizer(value => sanitizeHtml(value)),
    body('phoneNumber')
        .optional()
        .isMobilePhone()
];

// User creation endpoint
router.post('/users', validateUserInput, async (req, res) => {
    try {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Additional sanitization
        const sanitizedData = {
            email: validator.normalizeEmail(req.body.email),
            name: sanitizeHtml(req.body.name),
            phoneNumber: req.body.phoneNumber
        };

        const user = await userService.createUser(sanitizedData);
        res.status(201).json(user);

    } catch (error) {
        res.status(500).json({ error: 'User creation failed' });
    }
});

function sanitizeHtml(input) {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
}

async function validateEmailDomain(email) {
    const domain = email.split('@')[1];
    // Add domain validation logic
    if (blockedDomains.includes(domain)) {
        throw new Error('Email domain not allowed');
    }
}

module.exports = router;
```

### **Cross-Site Scripting (XSS) Prevention**
**Content Security Policy (CSP)**:
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.zbinnovation.com;
  font-src 'self' https://fonts.gstatic.com;
```

**Output Encoding**:
```typescript
// Frontend XSS prevention
import DOMPurify from 'dompurify';

const sanitizeUserContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });
};
```

### **Cross-Site Request Forgery (CSRF) Protection**
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// CSRF protection middleware setup
const csrfProtection = csrf({
    cookie: {
        httpOnly: false, // Allow client-side access for SPA
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Apply CSRF protection selectively
app.use(cookieParser());

// Skip CSRF for authentication endpoints
app.use((req, res, next) => {
    const skipCsrfPaths = ['/api/auth/login', '/api/auth/register'];

    if (skipCsrfPaths.includes(req.path)) {
        return next();
    }

    // Apply CSRF protection for other routes
    csrfProtection(req, res, next);
});

// Provide CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// JWT-based stateless session management
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
```

## 🚨 **Security Monitoring and Incident Response**

### **Security Event Monitoring**
```javascript
const EventEmitter = require('events');
const winston = require('winston');

class SecurityEventLogger extends EventEmitter {
    constructor() {
        super();
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ filename: 'security-events.log' }),
                new winston.transports.Console()
            ]
        });

        // Listen for authentication failures
        this.on('authenticationFailure', this.handleAuthenticationFailure.bind(this));
    }

    async handleAuthenticationFailure(eventData) {
        const securityEvent = {
            eventType: 'AUTHENTICATION_FAILURE',
            userId: eventData.username,
            ipAddress: eventData.ipAddress,
            timestamp: new Date().toISOString(),
            severity: 'MEDIUM',
            userAgent: eventData.userAgent
        };

        await this.logSecurityEvent(securityEvent);

        // Check for brute force attacks
        const isExcessive = await this.isExcessiveFailures(eventData.username, eventData.ipAddress);
        if (isExcessive) {
            await this.triggerAccountLockout(eventData.username);
        }
    }

    async logSecurityEvent(event) {
        this.logger.warn('Security Event', event);
        // Store in database for analysis
        await prisma.securityEvent.create({ data: event });
    }

    async isExcessiveFailures(username, ipAddress) {
        const recentFailures = await prisma.securityEvent.count({
            where: {
                eventType: 'AUTHENTICATION_FAILURE',
                OR: [
                    { userId: username },
                    { ipAddress: ipAddress }
                ],
                timestamp: {
                    gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
                }
            }
        });

        return recentFailures >= 5;
    }

    async triggerAccountLockout(username) {
        await prisma.user.update({
            where: { username },
            data: {
                isLocked: true,
                lockoutUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            }
        });

        this.emit('accountLocked', { username });
    }
}

module.exports = SecurityEventLogger;
```

### **Anomaly Detection**
**Behavioral Monitoring**:
- Unusual login patterns (time, location, device)
- Excessive API requests or data access
- Privilege escalation attempts
- Suspicious content creation patterns

**Automated Responses**:
- Account temporary lockout
- Additional authentication requirements
- Rate limiting enforcement
- Security team notifications

### **Incident Response Procedures**
**Security Incident Classification**:
- **P1 (Critical)**: Data breach, system compromise
- **P2 (High)**: Unauthorized access, service disruption
- **P3 (Medium)**: Suspicious activity, policy violations
- **P4 (Low)**: Security warnings, minor vulnerabilities

**Response Timeline**:
- **P1**: 15 minutes detection, 1 hour response
- **P2**: 1 hour detection, 4 hours response
- **P3**: 4 hours detection, 24 hours response
- **P4**: 24 hours detection, 72 hours response

## 🔍 **Security Testing and Validation**

### **Security Testing Strategy**
**Static Application Security Testing (SAST)**:
- SonarQube integration in CI/CD pipeline
- Code vulnerability scanning
- Dependency vulnerability checking
- Security code review requirements

**Dynamic Application Security Testing (DAST)**:
- OWASP ZAP automated scanning
- Penetration testing (quarterly)
- API security testing
- Infrastructure vulnerability scanning

### **Security Compliance**
**Compliance Requirements**:
- **GDPR**: Data protection and privacy
- **OWASP Top 10**: Web application security
- **ISO 27001**: Information security management
- **SOC 2 Type II**: Security and availability controls

**Security Auditing**:
- Monthly security assessments
- Quarterly penetration testing
- Annual compliance audits
- Continuous vulnerability monitoring

## 📊 **Security Metrics and KPIs**

### **Security Performance Indicators**
- **Mean Time to Detection (MTTD)**: Average time to detect security incidents
- **Mean Time to Response (MTTR)**: Average time to respond to incidents
- **Vulnerability Remediation Time**: Time to fix identified vulnerabilities
- **Security Training Completion**: Team security awareness metrics

### **Security Dashboard**
- Real-time security event monitoring
- Threat intelligence feeds
- Vulnerability status tracking
- Compliance status reporting

---

## 📚 **Reference Documents**

**Authentication APIs**: See `/2_technical_architecture/api_specifications/1_authentication_apis.md`
**Database Security**: See `/2_technical_architecture/2_database_schema_and_design.md`
**Development Standards**: See `/3_development_setup/2_coding_standards_and_guidelines.md`
**Compliance Requirements**: See `/1_planning_and_requirements/4_business_requirements.md`

*This security design ensures comprehensive protection for the ZbInnovation platform and its users.*
