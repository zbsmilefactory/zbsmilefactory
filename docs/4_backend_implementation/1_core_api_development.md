# 1. Core API Development

## 🔧 **Core API Development Overview**

This document outlines the comprehensive backend API development approach for the SmileFactory platform using Node.js and Express.js, including REST API framework setup, authentication middleware, error handling, validation, and API versioning strategies.

## 🏗️ **API Framework Architecture**

### **Express.js REST API Structure**

**Node.js/Express.js Approach**: Unlike Spring Boot's annotation-based controllers, Express.js uses a more functional approach with middleware and route handlers. We create a base controller class that provides common functionality and standardized response patterns.

**Key Node.js Libraries Used**:
- **express**: Core web framework for Node.js
- **express-validator**: Input validation middleware (replaces Spring's @Validated)
- **winston**: Structured logging (replaces Spring's @Slf4j)

```javascript
const express = require('express');
const { validationResult } = require('express-validator');
const winston = require('winston');

class BaseController {
    constructor() {
        this.router = express.Router();

        // Initialize logger (replaces @Slf4j annotation)
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'api.log' })
            ]
        });

        // Initialize response builder service
        this.responseBuilder = require('../services/responseBuilder');
        this.validationService = require('../services/validationService');
    }

    // Standardized success response helper (replaces Spring's ResponseEntity)
    buildSuccessResponse(res, data, message, statusCode = 200) {
        return this.responseBuilder.success(res, data, message, statusCode);
    }

    // Standardized error response helper
    buildErrorResponse(res, error, statusCode = 400) {
        return this.responseBuilder.error(res, error, statusCode);
    }

    // Validation middleware wrapper (replaces @Validated)
    validateRequest(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.buildErrorResponse(res, {
                message: 'Validation failed',
                errors: errors.array()
            }, 400);
        }
        next();
    }
}

module.exports = BaseController;
```

### **Standardized API Response Format**

**Node.js/Express.js Approach**: Instead of Java's class-based approach with annotations like @Data and @Builder, we use JavaScript objects and factory functions. This provides the same standardization with a more functional programming style that's idiomatic in Node.js.

**Why This Pattern**: Consistent API responses improve client-side integration and debugging. The factory pattern ensures all responses follow the same structure across all endpoints.

```javascript
// services/responseBuilder.js
class ResponseBuilder {
    /**
     * Creates a standardized success response
     * @param {Object} res - Express response object
     * @param {*} data - Response data (can be any type)
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code (default: 200)
     * @param {Object} pagination - Optional pagination info
     * @param {Object} metadata - Optional additional metadata
     */
    success(res, data, message, statusCode = 200, pagination = null, metadata = {}) {
        const response = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
            ...(pagination && { pagination }),
            ...(Object.keys(metadata).length > 0 && { metadata })
        };

        return res.status(statusCode).json(response);
    }

    /**
     * Creates a standardized error response
     * @param {Object} res - Express response object
     * @param {string|Object} error - Error message or error object
     * @param {number} statusCode - HTTP status code (default: 400)
     * @param {Object} metadata - Optional additional metadata
     */
    error(res, error, statusCode = 400, metadata = {}) {
        const response = {
            success: false,
            error: typeof error === 'string' ? error : error.message,
            timestamp: new Date().toISOString(),
            ...(Object.keys(metadata).length > 0 && { metadata })
        };

        // Include error details in development environment
        if (process.env.NODE_ENV === 'development' && typeof error === 'object') {
            response.stack = error.stack;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Creates a paginated success response
     * @param {Object} res - Express response object
     * @param {Array} data - Array of data items
     * @param {Object} paginationInfo - Pagination metadata
     * @param {string} message - Success message
     */
    paginated(res, data, paginationInfo, message = 'Data retrieved successfully') {
        return this.success(res, data, message, 200, paginationInfo);
    }
}

module.exports = new ResponseBuilder();
```
```

## 🔐 **Authentication Middleware Implementation**

### **JWT Authentication Middleware**

**Node.js/Express.js Approach**: Express.js uses middleware functions instead of Spring's filter chain. Middleware functions have access to the request and response objects and can modify them or terminate the request-response cycle.

**Key Libraries Used**:
- **jsonwebtoken**: JWT token creation and verification
- **passport**: Authentication middleware for Node.js
- **passport-jwt**: JWT strategy for Passport

**Why Middleware Pattern**: Express middleware provides a clean, functional approach to request processing that's more flexible than Spring's filter chain pattern.

```javascript
// middleware/jwtAuthentication.js
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const winston = require('winston');

class JwtAuthenticationMiddleware {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [new winston.transports.Console()]
        });

        this.userService = require('../services/userService');
        this.setupPassportStrategy();
    }

    /**
     * Configure Passport JWT strategy (replaces Spring Security configuration)
     */
    setupPassportStrategy() {
        const options = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
            algorithms: ['HS256']
        };

        passport.use(new JwtStrategy(options, async (payload, done) => {
            try {
                // Load user details (replaces UserDetailsService)
                const user = await this.userService.findById(payload.userId);

                if (user && user.isActive) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (error) {
                this.logger.error('JWT authentication error:', error);
                return done(error, false);
            }
        }));
    }

    /**
     * JWT authentication middleware (replaces doFilterInternal)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    authenticate(req, res, next) {
        const token = this.extractTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided',
                timestamp: new Date().toISOString()
            });
        }

        // Use Passport JWT strategy for authentication
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                this.logger.error('Authentication error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Authentication failed',
                    timestamp: new Date().toISOString()
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired token',
                    timestamp: new Date().toISOString()
                });
            }

            // Add user context to request (replaces SecurityContextHolder)
            req.user = user;
            req.userId = user.id;

            next();
        })(req, res, next);
    }

    /**
     * Extract JWT token from Authorization header
     * @param {Object} req - Express request object
     * @returns {string|null} - JWT token or null
     */
    extractTokenFromRequest(req) {
        const bearerToken = req.headers.authorization;
        if (bearerToken && bearerToken.startsWith('Bearer ')) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * Optional authentication middleware (doesn't fail if no token)
     */
    optionalAuthenticate(req, res, next) {
        const token = this.extractTokenFromRequest(req);

        if (!token) {
            return next(); // Continue without authentication
        }

        this.authenticate(req, res, next);
    }
}

module.exports = new JwtAuthenticationMiddleware();
```

### **Security Configuration**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

## ✅ **Input Validation and Error Handling**

### **Request Validation**
```java
@Data
@Validated
public class CreateUserRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotNull(message = "Profile type is required")
    @Enumerated(EnumType.STRING)
    private ProfileType profileType;
    
    @AssertTrue(message = "Terms and conditions must be accepted")
    private boolean agreeToTerms;
}
```

### **Global Exception Handler**
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
            .success(false)
            .error("Validation failed")
            .data(errors)
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .error(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .error("Access denied")
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    @ExceptionHandler(BusinessLogicException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessLogicException(BusinessLogicException ex) {
        log.warn("Business logic error: {}", ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .error(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
            .success(false)
            .error("An unexpected error occurred")
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

## 📊 **API Versioning Strategy**

### **URL-Based Versioning**
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    // Version 1 implementation
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    // Version 2 implementation with enhanced features
}
```

### **Version Management Configuration**
```java
@Configuration
public class ApiVersioningConfig {
    
    @Bean
    public RequestMappingHandlerMapping requestMappingHandlerMapping() {
        RequestMappingHandlerMapping mapping = new RequestMappingHandlerMapping();
        mapping.setOrder(0);
        mapping.setInterceptors(apiVersionInterceptor());
        return mapping;
    }
    
    @Bean
    public ApiVersionInterceptor apiVersionInterceptor() {
        return new ApiVersionInterceptor();
    }
}

@Component
public class ApiVersionInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String version = extractVersionFromPath(request.getRequestURI());
        
        if (version != null) {
            request.setAttribute("apiVersion", version);
            
            // Add deprecation warnings for old versions
            if ("v1".equals(version)) {
                response.setHeader("X-API-Deprecation-Warning", 
                    "API version v1 is deprecated. Please migrate to v2.");
            }
        }
        
        return true;
    }
    
    private String extractVersionFromPath(String path) {
        Pattern pattern = Pattern.compile("/api/(v\\d+)/");
        Matcher matcher = pattern.matcher(path);
        return matcher.find() ? matcher.group(1) : null;
    }
}
```

## 📝 **API Documentation with OpenAPI**

### **OpenAPI Configuration**
```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "ZbInnovation Platform API",
        version = "1.0.0",
        description = "Comprehensive API for Zimbabwe's premier innovation ecosystem platform",
        contact = @Contact(
            name = "ZbInnovation Development Team",
            email = "api@zbinnovation.com",
            url = "https://zbinnovation.com"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(url = "https://api.zbinnovation.com", description = "Production server"),
        @Server(url = "https://staging-api.zbinnovation.com", description = "Staging server"),
        @Server(url = "http://localhost:8080", description = "Development server")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
public class OpenApiConfig {
    
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .pathsToMatch("/api/v1/public/**")
            .build();
    }
    
    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
            .group("authentication")
            .pathsToMatch("/api/v1/auth/**")
            .build();
    }
    
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
            .group("user-management")
            .pathsToMatch("/api/v1/profiles/**", "/api/v1/users/**")
            .build();
    }
}
```

### **API Documentation Annotations**
```java
@RestController
@RequestMapping("/api/v1/profiles")
@Tag(name = "Profile Management", description = "APIs for managing user profiles")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController extends BaseController {
    
    @Operation(
        summary = "Get current user profile",
        description = "Retrieves the complete profile information for the authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully",
            content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = ProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getCurrentUserProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails) {
        
        ProfileResponse profile = profileService.getCurrentUserProfile(userDetails.getUsername());
        return buildSuccessResponse(profile, "Profile retrieved successfully");
    }
}
```

## 🔄 **Asynchronous Processing**

### **Async Configuration**
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ZbInnovation-Async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
    
    @Bean
    public AsyncUncaughtExceptionHandler asyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}
```

### **Async Service Implementation**
```java
@Service
@Slf4j
public class AsyncNotificationService {
    
    @Async("taskExecutor")
    public CompletableFuture<Void> sendWelcomeEmail(String userId, String email) {
        try {
            log.info("Sending welcome email to user: {}", userId);
            emailService.sendWelcomeEmail(email);
            log.info("Welcome email sent successfully to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send welcome email to user: {}", userId, e);
            throw new AsyncProcessingException("Failed to send welcome email", e);
        }
        return CompletableFuture.completedFuture(null);
    }
    
    @Async("taskExecutor")
    public CompletableFuture<Void> generateUserEmbeddings(String userId) {
        try {
            log.info("Generating AI embeddings for user: {}", userId);
            aiService.generateUserEmbeddings(userId);
            log.info("AI embeddings generated successfully for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to generate AI embeddings for user: {}", userId, e);
        }
        return CompletableFuture.completedFuture(null);
    }
}
```

## 📊 **API Monitoring and Metrics**

### **Actuator Configuration**
```java
@Configuration
public class ActuatorConfig {
    
    @Bean
    public HealthIndicator customHealthIndicator() {
        return new CustomHealthIndicator();
    }
    
    @Component
    public static class CustomHealthIndicator implements HealthIndicator {
        
        @Autowired
        private DatabaseHealthService databaseHealthService;
        
        @Autowired
        private ExternalServiceHealthService externalServiceHealthService;
        
        @Override
        public Health health() {
            Health.Builder builder = new Health.Builder();
            
            // Check database connectivity
            if (databaseHealthService.isDatabaseHealthy()) {
                builder.up().withDetail("database", "Connection successful");
            } else {
                builder.down().withDetail("database", "Connection failed");
            }
            
            // Check external services
            Map<String, String> externalServices = externalServiceHealthService.checkAllServices();
            externalServices.forEach(builder::withDetail);
            
            return builder.build();
        }
    }
}
```

### **Custom Metrics**
```java
@Component
public class ApiMetrics {
    
    private final Counter apiRequestCounter;
    private final Timer apiRequestTimer;
    private final Gauge activeUsersGauge;
    
    public ApiMetrics(MeterRegistry meterRegistry) {
        this.apiRequestCounter = Counter.builder("api.requests.total")
            .description("Total number of API requests")
            .register(meterRegistry);
            
        this.apiRequestTimer = Timer.builder("api.requests.duration")
            .description("API request duration")
            .register(meterRegistry);
            
        this.activeUsersGauge = Gauge.builder("users.active")
            .description("Number of active users")
            .register(meterRegistry, this, ApiMetrics::getActiveUserCount);
    }
    
    public void incrementApiRequest(String endpoint, String method) {
        apiRequestCounter.increment(
            Tags.of("endpoint", endpoint, "method", method)
        );
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
    
    public void recordRequestDuration(Timer.Sample sample, String endpoint) {
        sample.stop(apiRequestTimer.tag("endpoint", endpoint));
    }
    
    private double getActiveUserCount() {
        // Implementation to get active user count
        return userService.getActiveUserCount();
    }
}
```

---

## 📚 **Reference Documents**

**Authentication Design**: See `/2_technical_architecture/4_security_and_authentication_design.md`
**API Specifications**: See `/2_technical_architecture/api_specifications/`
**Database Implementation**: See `/4_backend_implementation/2_database_implementation.md`
**Testing Strategies**: See `/4_backend_implementation/5_api_testing_and_validation.md`

*This core API development framework provides a robust, scalable foundation for all ZbInnovation platform backend services.*
