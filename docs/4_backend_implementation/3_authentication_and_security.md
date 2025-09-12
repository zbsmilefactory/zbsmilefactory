# 3. Authentication and Security Implementation

## 🔐 **Authentication and Security Implementation Overview**

This document provides detailed implementation guidance for the authentication and security systems in the ZbInnovation platform using Node.js/Express.js, including JWT implementation with Passport.js, role-based access control, security middleware, and comprehensive security measures.

## 🔑 **JWT Token Implementation**

### **JWT Token Service (Node.js)**

**Node.js/JWT Approach**: Using the `jsonwebtoken` library for token generation and verification, with environment-based configuration for security.

```javascript
// services/jwtService.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JwtService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
    this.refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '30d';

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  /**
   * Generate access token with user information
   * @param {Object} user - User object with profile information
   * @returns {string} - JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      profileType: user.profileType,
      roles: user.roles || ['USER'],
      profileCompletion: user.profileCompletion,
      isVerified: user.isVerified,
      profileState: user.profileState
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
      issuer: 'zbinnovation-platform',
      audience: 'zbinnovation-users'
    });
  }

  /**
   * Generate refresh token
   * @param {string} userId - User ID
   * @returns {string} - JWT refresh token
   */
  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
      tokenId: crypto.randomUUID()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiration,
      issuer: 'zbinnovation-platform',
      audience: 'zbinnovation-users'
    });
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'zbinnovation-platform',
        audience: 'zbinnovation-users'
      });
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Extract user ID from token
   * @param {string} token - JWT token
   * @returns {string} - User ID
   */
  getUserIdFromToken(token) {
    const decoded = this.verifyToken(token);
    return decoded.userId;
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} - True if token is expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Generate token pair (access + refresh)
   * @param {Object} user - User object
   * @returns {Object} - Object containing access and refresh tokens
   */
  generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user.id),
      expiresIn: this.jwtExpiration
    };
  }
}

module.exports = new JwtService();
```
## 🛡️ **Authentication Middleware**

### **Passport.js Configuration**

**Node.js Authentication Strategy**: Using Passport.js with JWT strategy for secure authentication middleware.

```javascript
// config/passport.js
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwtService = require('../services/jwtService');
const userService = require('../services/userService');

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: 'zbinnovation-platform',
  audience: 'zbinnovation-users'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userService.findById(payload.userId);

    if (user && user.isActive) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;
```

### **Authentication Middleware Functions**

```javascript
// middleware/auth.js
const passport = require('../config/passport');
const jwtService = require('../services/jwtService');

class AuthMiddleware {
  /**
   * Require authentication for protected routes
   */
  requireAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Authentication error',
          timestamp: new Date().toISOString()
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  }

  /**
   * Optional authentication (doesn't fail if no token)
   */
  optionalAuth(req, res, next) {
    const token = this.extractToken(req);

    if (!token) {
      return next();
    }

    this.requireAuth(req, res, next);
  }

  /**
   * Require specific roles
   */
  requireRoles(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        });
      }

      const userRoles = req.user.roles || ['USER'];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          requiredRoles: roles,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Require profile completion
   */
  requireCompleteProfile(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      });
    }

    if (req.user.profileState !== 'COMPLETE') {
      return res.status(403).json({
        success: false,
        error: 'Complete profile required',
        profileState: req.user.profileState,
        timestamp: new Date().toISOString()
      });
    }

    next();
  }

  /**
   * Extract token from request headers
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}

module.exports = new AuthMiddleware();
```

## 🔒 **Password Security**

### **Password Hashing Service**

**Node.js Password Security**: Using bcrypt for secure password hashing with configurable rounds.

```javascript
// services/passwordService.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class PasswordService {
  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.passwordHistoryCount = 5;
  }

  /**
   * Hash password with bcrypt
   * @param {string} plainPassword - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(plainPassword) {
    try {
      return await bcrypt.hash(plainPassword, this.saltRounds);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Verify password against hash
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Password verification failed: ${error.message}`);
    }
  }

  /**
   * Check if password meets security requirements
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with details
   */
  validatePasswordStrength(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonPatterns: !this.isCommonPassword(password)
    };

    const isValid = Object.values(requirements).every(req => req);

    return {
      isValid,
      requirements,
      score: this.calculatePasswordScore(password)
    };
  }

  /**
   * Generate secure random password
   * @param {number} length - Password length (default: 16)
   * @returns {string} - Generated password
   */
  generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  /**
   * Check if password was recently used
   * @param {string} userId - User ID
   * @param {string} newPassword - New password to check
   * @returns {Promise<boolean>} - True if password was recently used
   */
  async isPasswordReused(userId, newPassword) {
    try {
      const passwordHistory = await this.getPasswordHistory(userId);

      for (const oldHash of passwordHistory) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      throw new Error(`Password reuse check failed: ${error.message}`);
    }
  }

  /**
   * Get user's password history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of password hashes
   */
  async getPasswordHistory(userId) {
    const prisma = require('../lib/prisma');

    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: this.passwordHistoryCount,
      select: { hashedPassword: true }
    });

    return history.map(entry => entry.hashedPassword);
  }

  /**
   * Save password to history
   * @param {string} userId - User ID
   * @param {string} hashedPassword - Hashed password
   */
  async savePasswordHistory(userId, hashedPassword) {
    const prisma = require('../lib/prisma');

    await prisma.passwordHistory.create({
      data: {
        userId,
        hashedPassword,
        createdAt: new Date()
      }
    });

    // Clean up old password history
    const oldPasswords = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: this.passwordHistoryCount
    });

    if (oldPasswords.length > 0) {
      await prisma.passwordHistory.deleteMany({
        where: {
          id: {
            in: oldPasswords.map(p => p.id)
          }
        }
      });
    }
  }

  /**
   * Check if password is commonly used
   * @param {string} password - Password to check
   * @returns {boolean} - True if password is common
   */
  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password to score
   * @returns {number} - Score from 0-100
   */
  calculatePasswordScore(password) {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 4, 25);

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    // Penalty for common patterns
    if (this.isCommonPassword(password)) score -= 30;
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new PasswordService();
```

---

## ✅ **Authentication & Security Summary**

### **Key Security Features Implemented**
- **JWT Authentication**: Secure token-based authentication with configurable expiration
- **Password Security**: Bcrypt hashing with strength validation and history tracking
- **Role-Based Access Control**: Flexible middleware for permission management
- **Profile State Validation**: Ensure users complete required profile information
- **Token Management**: Access and refresh token pair generation with proper validation

### **Security Best Practices**
- Environment-based configuration for sensitive values
- Comprehensive input validation and sanitization
- Secure password policies with complexity requirements
- Token expiration and refresh mechanisms
- Audit logging for security events
- Protection against common vulnerabilities (brute force, password reuse)

### **Implementation Guidelines**
- Use environment variables for all security-sensitive configuration
- Implement proper error handling without exposing sensitive information
- Regular security audits and dependency updates
- Monitor authentication failures and suspicious activities
- Implement rate limiting for authentication endpoints

The authentication and security implementation provides enterprise-grade security for the SmileFactory platform with comprehensive protection against common security threats.
@Service
@Slf4j
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours
    private long jwtExpirationMs;
    
    @Value("${jwt.refresh-expiration:2592000000}") // 30 days
    private long refreshTokenExpirationMs;
    
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    public String generateAccessToken(UserPrincipal userPrincipal) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationMs);
        
        return Jwts.builder()
            .setSubject(userPrincipal.getId())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .claim("email", userPrincipal.getEmail())
            .claim("profileType", userPrincipal.getProfileType())
            .claim("roles", userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()))
            .claim("profileCompletion", userPrincipal.getProfileCompletion())
            .claim("isVerified", userPrincipal.isVerified())
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String generateRefreshToken(String userId) {
        Date expiryDate = new Date(System.currentTimeMillis() + refreshTokenExpirationMs);
        
        return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .claim("type", "refresh")
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
    
    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
```

### **User Principal Implementation**
```java
@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    
    private String id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private ProfileType profileType;
    private Integer profileCompletion;
    private boolean isVerified;
    private boolean emailVerified;
    private Collection<? extends GrantedAuthority> authorities;
    
    public static UserPrincipal create(PersonalDetails user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
        
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getFirstName(),
            user.getLastName(),
            user.getProfileType(),
            user.getProfileCompletion(),
            user.getIsVerified(),
            user.getEmailVerified(),
            authorities
        );
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return emailVerified;
    }
}
```

## 🛡️ **Role-Based Access Control (RBAC)**

### **Role and Permission Entities**
```java
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {
    
    @Column(name = "name", unique = true, nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @ManyToMany(mappedBy = "roles")
    private Set<PersonalDetails> users = new HashSet<>();
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
}

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {
    
    @Column(name = "name", unique = true, nullable = false)
    private String name;
    
    @Column(name = "resource")
    private String resource;
    
    @Column(name = "action")
    private String action;
    
    @Column(name = "description")
    private String description;
    
    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles = new HashSet<>();
}
```

### **Security Service Implementation**
```java
@Service
@Transactional
@Slf4j
public class SecurityService {
    
    @Autowired
    private PersonalDetailsRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    public boolean hasPermission(String userId, String resource, String action) {
        PersonalDetails user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        return user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .anyMatch(permission -> 
                permission.getResource().equals(resource) && 
                permission.getAction().equals(action));
    }
    
    public boolean canAccessProfile(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            return true; // Users can always access their own profile
        }
        
        PersonalDetails targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        // Check profile visibility
        switch (targetUser.getProfileVisibility()) {
            case PUBLIC:
                return true;
            case CONNECTIONS_ONLY:
                return areConnected(currentUserId, targetUserId);
            case PRIVATE:
                return hasPermission(currentUserId, "PROFILE", "VIEW_PRIVATE");
            default:
                return false;
        }
    }
    
    public boolean canModifyContent(String userId, String contentId) {
        Post post = postRepository.findById(contentId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found"));
        
        // Content owner can always modify
        if (post.getAuthor().getId().equals(userId)) {
            return true;
        }
        
        // Check if user has moderation permissions
        return hasPermission(userId, "CONTENT", "MODERATE");
    }
    
    private boolean areConnected(String userId1, String userId2) {
        return connectionRepository.existsByRequesterIdAndRecipientIdAndStatus(
            userId1, userId2, ConnectionStatus.ACCEPTED) ||
            connectionRepository.existsByRequesterIdAndRecipientIdAndStatus(
                userId2, userId1, ConnectionStatus.ACCEPTED);
    }
    
    @PostConstruct
    public void initializeDefaultRoles() {
        createRoleIfNotExists("USER", "Basic user role", Arrays.asList(
            "PROFILE:READ", "PROFILE:WRITE_OWN", "CONTENT:CREATE", "CONTENT:READ"
        ));
        
        createRoleIfNotExists("VERIFIED_USER", "Verified user role", Arrays.asList(
            "PROFILE:READ", "PROFILE:WRITE_OWN", "CONTENT:CREATE", "CONTENT:READ",
            "EVENT:CREATE", "GROUP:JOIN", "MARKETPLACE:ACCESS"
        ));
        
        createRoleIfNotExists("PREMIUM_USER", "Premium user role", Arrays.asList(
            "PROFILE:READ", "PROFILE:WRITE_OWN", "CONTENT:CREATE", "CONTENT:READ",
            "EVENT:CREATE", "GROUP:JOIN", "MARKETPLACE:ACCESS", "ANALYTICS:VIEW",
            "CONNECTION:UNLIMITED"
        ));
        
        createRoleIfNotExists("MODERATOR", "Content moderator role", Arrays.asList(
            "CONTENT:MODERATE", "USER:SUSPEND", "REPORT:MANAGE"
        ));
        
        createRoleIfNotExists("ADMIN", "System administrator role", Arrays.asList(
            "SYSTEM:ADMIN", "USER:MANAGE", "CONTENT:MODERATE", "ANALYTICS:FULL"
        ));
    }
    
    private void createRoleIfNotExists(String roleName, String description, List<String> permissionNames) {
        if (!roleRepository.existsByName(roleName)) {
            Role role = Role.builder()
                .name(roleName)
                .description(description)
                .build();
            
            Set<Permission> permissions = permissionNames.stream()
                .map(this::createPermissionIfNotExists)
                .collect(Collectors.toSet());
            
            role.setPermissions(permissions);
            roleRepository.save(role);
            
            log.info("Created role: {} with {} permissions", roleName, permissions.size());
        }
    }
    
    private Permission createPermissionIfNotExists(String permissionName) {
        String[] parts = permissionName.split(":");
        String resource = parts[0];
        String action = parts[1];
        
        return permissionRepository.findByResourceAndAction(resource, action)
            .orElseGet(() -> {
                Permission permission = Permission.builder()
                    .name(permissionName)
                    .resource(resource)
                    .action(action)
                    .description("Permission to " + action + " " + resource)
                    .build();
                return permissionRepository.save(permission);
            });
    }
}
```

## 🔒 **Password Security Implementation**

### **Password Service**
```java
@Service
@Slf4j
public class PasswordService {
    
    private static final int BCRYPT_ROUNDS = 12;
    private static final int PASSWORD_HISTORY_COUNT = 5;
    
    @Autowired
    private PasswordHistoryRepository passwordHistoryRepository;
    
    public String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }
    
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
    
    public boolean isPasswordReused(String userId, String newPassword) {
        List<PasswordHistory> passwordHistory = passwordHistoryRepository
            .findTop5ByUserIdOrderByCreatedAtDesc(userId);
        
        return passwordHistory.stream()
            .anyMatch(history -> BCrypt.checkpw(newPassword, history.getPasswordHash()));
    }
    
    public void savePasswordHistory(String userId, String hashedPassword) {
        PasswordHistory history = PasswordHistory.builder()
            .userId(userId)
            .passwordHash(hashedPassword)
            .build();
        
        passwordHistoryRepository.save(history);
        
        // Keep only last 5 passwords
        List<PasswordHistory> allHistory = passwordHistoryRepository
            .findByUserIdOrderByCreatedAtDesc(userId);
        
        if (allHistory.size() > PASSWORD_HISTORY_COUNT) {
            List<PasswordHistory> toDelete = allHistory.subList(PASSWORD_HISTORY_COUNT, allHistory.size());
            passwordHistoryRepository.deleteAll(toDelete);
        }
    }
    
    public boolean isPasswordStrong(String password) {
        return password.length() >= 8 &&
               password.matches(".*[a-z].*") &&
               password.matches(".*[A-Z].*") &&
               password.matches(".*\\d.*") &&
               password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");
    }
    
    public PasswordStrengthResult checkPasswordStrength(String password) {
        PasswordStrengthResult result = new PasswordStrengthResult();
        
        if (password.length() < 8) {
            result.addIssue("Password must be at least 8 characters long");
        }
        
        if (!password.matches(".*[a-z].*")) {
            result.addIssue("Password must contain at least one lowercase letter");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            result.addIssue("Password must contain at least one uppercase letter");
        }
        
        if (!password.matches(".*\\d.*")) {
            result.addIssue("Password must contain at least one number");
        }
        
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            result.addIssue("Password must contain at least one special character");
        }
        
        // Calculate strength score
        int score = 0;
        if (password.length() >= 8) score += 20;
        if (password.length() >= 12) score += 10;
        if (password.matches(".*[a-z].*")) score += 20;
        if (password.matches(".*[A-Z].*")) score += 20;
        if (password.matches(".*\\d.*")) score += 20;
        if (password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) score += 10;
        
        result.setScore(score);
        result.setStrength(getStrengthLevel(score));
        
        return result;
    }
    
    private PasswordStrength getStrengthLevel(int score) {
        if (score >= 90) return PasswordStrength.VERY_STRONG;
        if (score >= 70) return PasswordStrength.STRONG;
        if (score >= 50) return PasswordStrength.MEDIUM;
        if (score >= 30) return PasswordStrength.WEAK;
        return PasswordStrength.VERY_WEAK;
    }
}
```

## 🚨 **Security Monitoring and Audit**

### **Security Event Logging**
```java
@Service
@Slf4j
public class SecurityAuditService {
    
    @Autowired
    private SecurityEventRepository securityEventRepository;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @EventListener
    @Async
    public void handleAuthenticationSuccess(AuthenticationSuccessEvent event) {
        UserPrincipal userPrincipal = (UserPrincipal) event.getAuthentication().getPrincipal();
        
        SecurityEvent securityEvent = SecurityEvent.builder()
            .eventType(SecurityEventType.AUTHENTICATION_SUCCESS)
            .userId(userPrincipal.getId())
            .ipAddress(getClientIpAddress())
            .userAgent(getUserAgent())
            .timestamp(LocalDateTime.now())
            .severity(SecuritySeverity.INFO)
            .details(Map.of(
                "email", userPrincipal.getEmail(),
                "profileType", userPrincipal.getProfileType().toString()
            ))
            .build();
        
        securityEventRepository.save(securityEvent);
        log.info("Authentication success for user: {}", userPrincipal.getEmail());
    }
    
    @EventListener
    @Async
    public void handleAuthenticationFailure(AbstractAuthenticationFailureEvent event) {
        String username = event.getAuthentication().getName();
        
        SecurityEvent securityEvent = SecurityEvent.builder()
            .eventType(SecurityEventType.AUTHENTICATION_FAILURE)
            .userId(username)
            .ipAddress(getClientIpAddress())
            .userAgent(getUserAgent())
            .timestamp(LocalDateTime.now())
            .severity(SecuritySeverity.WARNING)
            .details(Map.of(
                "reason", event.getException().getMessage(),
                "attemptedUsername", username
            ))
            .build();
        
        securityEventRepository.save(securityEvent);
        log.warn("Authentication failure for user: {}, reason: {}", username, event.getException().getMessage());
        
        // Check for brute force attacks
        checkForBruteForceAttack(username);
    }
    
    public void logSecurityEvent(SecurityEventType eventType, String userId, SecuritySeverity severity, Map<String, Object> details) {
        SecurityEvent event = SecurityEvent.builder()
            .eventType(eventType)
            .userId(userId)
            .ipAddress(getClientIpAddress())
            .userAgent(getUserAgent())
            .timestamp(LocalDateTime.now())
            .severity(severity)
            .details(details)
            .build();
        
        securityEventRepository.save(event);
        
        // Publish event for real-time monitoring
        eventPublisher.publishEvent(new SecurityEventCreatedEvent(event));
    }
    
    private void checkForBruteForceAttack(String username) {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        long failureCount = securityEventRepository.countByUserIdAndEventTypeAndTimestampAfter(
            username, SecurityEventType.AUTHENTICATION_FAILURE, fiveMinutesAgo);
        
        if (failureCount >= 5) {
            logSecurityEvent(
                SecurityEventType.BRUTE_FORCE_DETECTED,
                username,
                SecuritySeverity.HIGH,
                Map.of("failureCount", failureCount, "timeWindow", "5 minutes")
            );
            
            // Trigger account lockout
            eventPublisher.publishEvent(new BruteForceDetectedEvent(username, failureCount));
        }
    }
    
    private String getClientIpAddress() {
        HttpServletRequest request = getCurrentHttpRequest();
        if (request == null) return "unknown";
        
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private String getUserAgent() {
        HttpServletRequest request = getCurrentHttpRequest();
        return request != null ? request.getHeader("User-Agent") : "unknown";
    }
    
    private HttpServletRequest getCurrentHttpRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) requestAttributes).getRequest();
        }
        return null;
    }
}
```

## 🔐 **Multi-Factor Authentication (MFA)**

### **MFA Service Implementation**
```java
@Service
@Slf4j
public class MfaService {
    
    @Autowired
    private MfaTokenRepository mfaTokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SmsService smsService;
    
    public MfaChallenge initiateMfaChallenge(String userId, MfaMethod method) {
        PersonalDetails user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        String token = generateMfaToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);
        
        MfaToken mfaToken = MfaToken.builder()
            .userId(userId)
            .token(token)
            .method(method)
            .expiresAt(expiresAt)
            .used(false)
            .build();
        
        mfaTokenRepository.save(mfaToken);
        
        // Send token based on method
        switch (method) {
            case EMAIL:
                emailService.sendMfaToken(user.getEmail(), token);
                break;
            case SMS:
                smsService.sendMfaToken(user.getPhoneNumber(), token);
                break;
            case TOTP:
                // TOTP tokens are generated by authenticator apps
                break;
        }
        
        return MfaChallenge.builder()
            .challengeId(mfaToken.getId())
            .method(method)
            .expiresAt(expiresAt)
            .build();
    }
    
    public boolean verifyMfaToken(String challengeId, String token) {
        MfaToken mfaToken = mfaTokenRepository.findById(challengeId)
            .orElseThrow(() -> new InvalidMfaTokenException("Invalid MFA challenge"));
        
        if (mfaToken.isUsed()) {
            throw new InvalidMfaTokenException("MFA token already used");
        }
        
        if (mfaToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidMfaTokenException("MFA token expired");
        }
        
        boolean isValid = false;
        
        switch (mfaToken.getMethod()) {
            case EMAIL:
            case SMS:
                isValid = mfaToken.getToken().equals(token);
                break;
            case TOTP:
                isValid = verifyTotpToken(mfaToken.getUserId(), token);
                break;
        }
        
        if (isValid) {
            mfaToken.setUsed(true);
            mfaTokenRepository.save(mfaToken);
        }
        
        return isValid;
    }
    
    private String generateMfaToken() {
        return String.format("%06d", new SecureRandom().nextInt(1000000));
    }
    
    private boolean verifyTotpToken(String userId, String token) {
        // Implementation for TOTP verification using libraries like Google Authenticator
        // This would involve checking the token against the user's TOTP secret
        return false; // Placeholder
    }
}
```

---

## 📚 **Reference Documents**

**Security Design**: See `/2_technical_architecture/4_security_and_authentication_design.md`
**Core API Development**: See `/4_backend_implementation/1_core_api_development.md`
**Database Implementation**: See `/4_backend_implementation/2_database_implementation.md`
**API Testing**: See `/4_backend_implementation/5_api_testing_and_validation.md`

*This authentication and security implementation provides comprehensive protection and access control for the ZbInnovation platform.*
