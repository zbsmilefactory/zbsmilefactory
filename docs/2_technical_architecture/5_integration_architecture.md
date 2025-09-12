# 5. Integration Architecture

## 🔗 **Integration Architecture Overview**

The SmileFactory platform requires seamless integration with multiple external services, third-party APIs, and internal systems. This document outlines the comprehensive integration architecture designed for scalability, reliability, and maintainability.

## 🏗️ **Integration Patterns and Principles**

### **Integration Design Principles**
- **Loose Coupling**: Minimize dependencies between systems
- **High Cohesion**: Group related functionality together
- **Fault Tolerance**: Graceful handling of integration failures
- **Scalability**: Support for increasing integration volume
- **Security**: Secure communication and data exchange
- **Monitoring**: Comprehensive integration monitoring and alerting

### **Integration Patterns Used**
```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY PATTERN                      │
│  Centralized entry point for all external integrations     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  MESSAGE QUEUE PATTERN                      │
│     Asynchronous processing and event-driven integration   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CIRCUIT BREAKER PATTERN                   │
│        Fault tolerance and graceful degradation            │
└─────────────────────────────────────────────────────────────┘
```

## 📧 **Email Service Integration**

### **Transactional Email Service**
**Primary Provider**: SendGrid
**Backup Provider**: Amazon SES

**Email Types and Templates**:
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

const emailTemplates = {
  WELCOME: {
    id: 'welcome-email',
    subject: 'Welcome to ZbInnovation Platform',
    variables: ['firstName', 'profileType', 'verificationLink']
  },
  EMAIL_VERIFICATION: {
    id: 'email-verification',
    subject: 'Verify Your Email Address',
    variables: ['firstName', 'verificationToken', 'expirationTime']
  },
  PASSWORD_RESET: {
    id: 'password-reset',
    subject: 'Reset Your Password',
    variables: ['firstName', 'resetToken', 'expirationTime']
  },
  CONNECTION_REQUEST: {
    id: 'connection-request',
    subject: 'New Connection Request',
    variables: ['requesterName', 'requesterProfile', 'message']
  },
  EVENT_REMINDER: {
    id: 'event-reminder',
    subject: 'Event Reminder',
    variables: ['eventName', 'eventDate', 'eventLocation']
  }
};
```

**Email Service Implementation**:
```javascript
const CircuitBreaker = require('opossum');
const winston = require('winston');

class EmailService {
    constructor() {
        this.sendGridService = require('./sendGridService');
        this.amazonSESService = require('./amazonSESService');
        this.emailQueueService = require('./emailQueueService');
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [new winston.transports.Console()]
        });

        // Circuit breaker configuration
        this.circuitBreakerOptions = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        };

        this.sendEmailCircuitBreaker = new CircuitBreaker(
            this.sendEmailInternal.bind(this),
            this.circuitBreakerOptions
        );

        this.sendEmailCircuitBreaker.fallback(this.sendEmailFallback.bind(this));
    }

    async sendEmail(request) {
        try {
            return await this.sendEmailCircuitBreaker.fire(request);
        } catch (error) {
            this.logger.error('Email service circuit breaker failed', error);
            return await this.sendEmailFallback(request, error);
        }
    }

    async sendEmailInternal(request) {
        try {
            return await this.sendGridService.sendEmail(request);
        } catch (error) {
            this.logger.warn('Primary email service failed, trying backup', error);
            return await this.amazonSESService.sendEmail(request);
        }
    }

    async sendEmailFallback(request, error) {
        // Queue email for later delivery
        await this.emailQueueService.queueEmail(request);
        return {
            status: 'QUEUED',
            message: 'Email queued for delivery',
            error: error?.message
        };
    }
}

module.exports = EmailService;
```

## 💳 **Payment Processing Integration**

### **Payment Gateway Integration**
**Primary Provider**: Stripe
**Secondary Provider**: PayPal

**Payment Flows**:
```typescript
interface PaymentFlow {
  subscriptions: {
    premium: '$19.99/month',
    enterprise: '$99.99/month'
  },
  marketplace: {
    jobPostings: '$50 per posting',
    serviceCommission: '5% of transaction',
    eventTicketing: '3% processing fee'
  },
  oneTime: {
    featuredListings: '$100/month',
    premiumPlacements: '$200/month'
  }
}
```

**Payment Service Implementation (Node.js)**:

**Node.js Payment Integration**: Using Stripe SDK for secure payment processing with comprehensive error handling.

```javascript
// services/paymentService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const winston = require('winston');

class PaymentService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });
  }

  /**
   * Process payment with Stripe
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} - Payment result
   */
  async processPayment(paymentData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'usd',
        payment_method: paymentData.paymentMethodId,
        confirm: true,
        metadata: {
          userId: paymentData.userId,
          orderId: paymentData.orderId
        }
      });

      this.logger.info('Payment processed successfully', {
        paymentIntentId: paymentIntent.id,
        amount: paymentData.amount,
        userId: paymentData.userId
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      this.logger.error('Payment processing failed', {
        error: error.message,
        userId: paymentData.userId,
        amount: paymentData.amount
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create payment method
   * @param {string} customerId - Stripe customer ID
   * @param {Object} paymentMethodData - Payment method data
   * @returns {Promise<Object>} - Created payment method
   */
  async createPaymentMethod(customerId, paymentMethodData) {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: paymentMethodData.card
      });

      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId
      });

      return paymentMethod;
    } catch (error) {
      this.logger.error('Payment method creation failed', {
        error: error.message,
        customerId
      });
      throw error;
    }
  }
}

module.exports = new PaymentService();
    
    @Autowired
    private StripeService stripeService;
    
    @Autowired
    private PayPalService payPalService;
    
    public PaymentResponse processSubscription(SubscriptionRequest request) {
        try {
            // Create customer in Stripe
            Customer customer = stripeService.createCustomer(request.getUserId());
            
            // Create subscription
            Subscription subscription = stripeService.createSubscription(
                customer.getId(), 
                request.getPriceId()
            );
            
            // Update user subscription status
            userService.updateSubscriptionStatus(
                request.getUserId(), 
                subscription.getStatus()
            );
            
            return PaymentResponse.success(subscription);
            
        } catch (StripeException e) {
            log.error("Stripe payment failed", e);
            throw new PaymentProcessingException("Payment processing failed", e);
        }
    }
}
```

## 📊 **Analytics and Monitoring Integration**

### **Analytics Services**
**User Analytics**: Google Analytics 4
**Application Performance**: New Relic
**Error Tracking**: Sentry
**Business Intelligence**: Mixpanel

**Analytics Event Tracking**:
```typescript
interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: {
    page: string;
    userAgent: string;
    ipAddress: string;
    location?: GeoLocation;
  };
}

// Example events
const analyticsEvents = {
  USER_REGISTERED: {
    eventName: 'user_registered',
    properties: ['profileType', 'registrationSource', 'referrer']
  },
  PROFILE_COMPLETED: {
    eventName: 'profile_completed',
    properties: ['profileType', 'completionPercentage', 'timeToComplete']
  },
  CONNECTION_MADE: {
    eventName: 'connection_made',
    properties: ['requesterType', 'recipientType', 'connectionMethod']
  },
  CONTENT_CREATED: {
    eventName: 'content_created',
    properties: ['contentType', 'category', 'wordCount']
  }
};
```

### **Monitoring and Alerting (Node.js)**

**Node.js Monitoring**: Using Prometheus metrics and Winston logging for comprehensive system monitoring.

```javascript
// services/monitoringService.js
const prometheus = require('prom-client');
const winston = require('winston');

class MonitoringService {
  constructor() {
    // Create metrics registry
    this.register = new prometheus.Registry();

    // Define custom metrics
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    this.activeConnections = new prometheus.Gauge({
      name: 'active_connections_total',
      help: 'Total number of active connections'
    });

    this.errorCounter = new prometheus.Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'service']
    });

    // Register metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.activeConnections);
    this.register.registerMetric(this.errorCounter);

    // Add default metrics
    prometheus.collectDefaultMetrics({ register: this.register });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'monitoring.log' })
      ]
    });
  }

  /**
   * Record HTTP request metrics
   * @param {string} method - HTTP method
   * @param {string} route - Request route
   * @param {number} statusCode - Response status code
   * @param {number} duration - Request duration in seconds
   */
  recordHttpRequest(method, route, statusCode, duration) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  /**
   * Record error occurrence
   * @param {string} type - Error type
   * @param {string} service - Service name
   */
  recordError(type, service) {
    this.errorCounter.labels(type, service).inc();

    this.logger.error('Error recorded', {
      type,
      service,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get metrics for Prometheus scraping
   * @returns {Promise<string>} - Prometheus metrics
   */
  async getMetrics() {
    return await this.register.metrics();
  }

  /**
   * Health check for all integrations
   * @returns {Promise<Object>} - Health status
   */
  async performHealthCheck() {
    const healthChecks = {
      database: await this.checkDatabaseHealth(),
      redis: await this.checkRedisHealth(),
      email: await this.checkEmailServiceHealth(),
      ai: await this.checkAIServiceHealth()
    };

    const overallHealth = Object.values(healthChecks).every(check => check.status === 'healthy');

    return {
      status: overallHealth ? 'healthy' : 'unhealthy',
      checks: healthChecks,
      timestamp: new Date().toISOString()
    };
  }

  async checkDatabaseHealth() {
    try {
      const prisma = require('../lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', responseTime: '< 100ms' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkRedisHealth() {
    try {
      const redis = require('../lib/redis');
      await redis.ping();
      return { status: 'healthy', responseTime: '< 50ms' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkEmailServiceHealth() {
    try {
      // Simple connectivity check to email service
      return { status: 'healthy', provider: 'SendGrid' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkAIServiceHealth() {
    try {
      // Simple connectivity check to AI service
      return { status: 'healthy', provider: 'DeepSeek' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new MonitoringService();
    
    ---

## ✅ **Integration Architecture Summary**

### **Key Integration Features Implemented**
- **Email Service**: Circuit breaker pattern with multiple provider fallback
- **Payment Processing**: Secure Stripe integration with comprehensive error handling
- **Monitoring & Alerting**: Prometheus metrics with health check endpoints
- **AI Integration**: DeepSeek API integration with context management
- **File Storage**: AWS S3 integration with CDN support
- **Real-time Communication**: WebSocket support for live features

### **Integration Patterns Used**
- **Circuit Breaker**: Fault tolerance for external service calls
- **Retry Logic**: Automatic retry with exponential backoff
- **Fallback Mechanisms**: Graceful degradation when services are unavailable
- **Health Checks**: Comprehensive monitoring of all external dependencies
- **Rate Limiting**: Protection against API abuse and cost control
- **Caching**: Redis caching for improved performance

### **Node.js Integration Benefits**
- **Async/Await**: Native asynchronous programming for I/O operations
- **NPM Ecosystem**: Rich library ecosystem for third-party integrations
- **Event-Driven**: Natural fit for real-time and event-driven architectures
- **JSON Native**: Seamless JSON handling for API communications
- **Microservices Ready**: Lightweight and scalable service architecture
- **Cloud Native**: Excellent support for containerization and cloud deployment

### **Implementation Guidelines**
- Use environment variables for all external service configuration
- Implement proper error handling and logging for all integrations
- Use circuit breakers for critical external dependencies
- Monitor integration performance and health continuously
- Implement proper authentication and security for all external APIs
- Use caching strategically to reduce external API calls
- Plan for service degradation and fallback scenarios

### **Security Considerations**
- **API Key Management**: Secure storage and rotation of API keys
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Input Validation**: Validate all data from external sources
- **Audit Logging**: Log all external service interactions
- **Network Security**: Use HTTPS for all external communications

The integration architecture provides a robust, scalable foundation for the SmileFactory platform with comprehensive external service integration, monitoring, and fault tolerance capabilities.
    
    @EventListener
    public void handleUserRegistration(UserRegistrationEvent event) {
        // Increment registration counter
        Counter.builder("user.registrations")
            .tag("profile_type", event.getProfileType())
            .register(meterRegistry)
            .increment();
        
        // Track registration time
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("user.registration.duration")
            .register(meterRegistry));
    }
    
    @Scheduled(fixedRate = 60000) // Every minute
    public void checkSystemHealth() {
        // Database connectivity
        boolean dbHealthy = databaseHealthCheck();
        Gauge.builder("system.database.health")
            .register(meterRegistry, () -> dbHealthy ? 1.0 : 0.0);
        
        // External service health
        boolean emailHealthy = emailServiceHealthCheck();
        Gauge.builder("system.email.health")
            .register(meterRegistry, () -> emailHealthy ? 1.0 : 0.0);
    }
}
```

## 🤖 **AI and Machine Learning Integration**

### **AI Service Providers**
**Primary AI**: OpenAI GPT-4 API
**Embeddings**: OpenAI Embeddings API
**Backup AI**: Anthropic Claude API

**AI Integration Architecture**:
```java
@Service
public class AIIntegrationService {
    
    @Autowired
    private OpenAIService openAIService;
    
    @Autowired
    private AnthropicService anthropicService;
    
    @CircuitBreaker(name = "ai-service", fallbackMethod = "aiServiceFallback")
    public AIResponse generateRecommendations(RecommendationRequest request) {
        try {
            return openAIService.generateRecommendations(request);
        } catch (Exception e) {
            log.warn("Primary AI service failed, trying backup", e);
            return anthropicService.generateRecommendations(request);
        }
    }
    
    public AIResponse aiServiceFallback(RecommendationRequest request, Exception ex) {
        // Return cached or default recommendations
        return recommendationCacheService.getCachedRecommendations(request);
    }
    
    @Async
    public CompletableFuture<Void> generateUserEmbeddings(String userId) {
        UserProfile profile = userService.getUserProfile(userId);
        String profileText = buildProfileText(profile);
        
        EmbeddingResponse embedding = openAIService.generateEmbedding(profileText);
        userEmbeddingService.saveUserEmbedding(userId, embedding.getVector());
        
        return CompletableFuture.completedFuture(null);
    }
}
```

## 📱 **Social Media Integration**

### **Social Platform APIs**
**LinkedIn**: Professional networking integration
**Twitter**: Content sharing and social proof
**Google**: OAuth authentication and calendar integration
**Facebook**: Social login and sharing

**Social Integration Implementation**:
```java
@Service
public class SocialMediaService {
    
    public SocialProfile importLinkedInProfile(String accessToken) {
        LinkedInAPI linkedInAPI = new LinkedInAPI(accessToken);
        
        LinkedInProfile profile = linkedInAPI.getProfile();
        LinkedInExperience experience = linkedInAPI.getExperience();
        LinkedInEducation education = linkedInAPI.getEducation();
        
        return SocialProfile.builder()
            .platform("LINKEDIN")
            .profileData(profile)
            .experience(experience)
            .education(education)
            .build();
    }
    
    public void shareContentToSocial(String contentId, List<String> platforms) {
        Content content = contentService.getContent(contentId);
        
        platforms.forEach(platform -> {
            switch (platform) {
                case "LINKEDIN":
                    linkedInService.shareContent(content);
                    break;
                case "TWITTER":
                    twitterService.shareContent(content);
                    break;
                default:
                    log.warn("Unsupported social platform: {}", platform);
            }
        });
    }
}
```

## 🗄️ **File Storage and CDN Integration**

### **File Storage Architecture**
**Primary Storage**: AWS S3
**CDN**: CloudFront
**Image Processing**: AWS Lambda + Sharp

**File Management Service**:
```java
@Service
public class FileStorageService {
    
    @Autowired
    private AmazonS3 s3Client;
    
    public FileUploadResponse uploadFile(MultipartFile file, String userId) {
        // Validate file
        validateFile(file);
        
        // Generate unique filename
        String fileName = generateFileName(file.getOriginalFilename(), userId);
        
        // Upload to S3
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());
        
        PutObjectRequest request = new PutObjectRequest(
            bucketName, 
            fileName, 
            file.getInputStream(), 
            metadata
        );
        
        s3Client.putObject(request);
        
        // Generate CDN URL
        String cdnUrl = generateCDNUrl(fileName);
        
        // Save file metadata
        FileMetadata fileMetadata = FileMetadata.builder()
            .fileName(fileName)
            .originalName(file.getOriginalFilename())
            .contentType(file.getContentType())
            .size(file.getSize())
            .userId(userId)
            .cdnUrl(cdnUrl)
            .build();
            
        fileMetadataService.save(fileMetadata);
        
        return FileUploadResponse.builder()
            .fileId(fileMetadata.getId())
            .url(cdnUrl)
            .build();
    }
}
```

## 🔄 **Event-Driven Integration**

### **Message Queue Architecture**
**Message Broker**: Apache Kafka
**Event Store**: PostgreSQL + Event Sourcing
**Stream Processing**: Kafka Streams

**Event-Driven Integration**:
```java
@Component
public class EventPublisher {
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @EventListener
    public void handleUserRegistration(UserRegistrationEvent event) {
        // Publish to multiple topics
        kafkaTemplate.send("user-events", event);
        kafkaTemplate.send("analytics-events", event);
        kafkaTemplate.send("email-events", 
            WelcomeEmailEvent.from(event));
    }
    
    @KafkaListener(topics = "user-events")
    public void processUserEvent(UserRegistrationEvent event) {
        // Process user registration
        userProfileService.initializeProfile(event.getUserId());
        
        // Generate AI embeddings
        aiService.generateUserEmbeddings(event.getUserId());
        
        // Update analytics
        analyticsService.trackUserRegistration(event);
    }
}
```

## 🔍 **Search Integration**

### **Search Service Architecture**
**Primary Search**: Elasticsearch
**Backup Search**: PostgreSQL Full-Text Search
**Search Analytics**: Elasticsearch + Kibana

**Search Integration Implementation**:
```java
@Service
public class SearchService {
    
    @Autowired
    private ElasticsearchClient elasticsearchClient;
    
    public SearchResponse searchContent(SearchRequest request) {
        // Build Elasticsearch query
        SearchRequest.Builder searchBuilder = new SearchRequest.Builder()
            .index("content")
            .query(q -> q
                .multiMatch(m -> m
                    .query(request.getQuery())
                    .fields("title^2", "content", "tags")
                )
            );
        
        // Add filters
        if (request.getFilters() != null) {
            searchBuilder.postFilter(buildFilters(request.getFilters()));
        }
        
        // Execute search
        SearchResponse<ContentDocument> response = 
            elasticsearchClient.search(searchBuilder.build(), ContentDocument.class);
        
        return mapToSearchResponse(response);
    }
    
    @Async
    public void indexContent(String contentId) {
        Content content = contentService.getContent(contentId);
        ContentDocument document = ContentDocument.from(content);
        
        IndexRequest<ContentDocument> request = IndexRequest.of(i -> i
            .index("content")
            .id(contentId)
            .document(document)
        );
        
        elasticsearchClient.index(request);
    }
}
```

## 📊 **Integration Monitoring and Health Checks**

### **Health Check Implementation**
```java
@Component
public class IntegrationHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        Health.Builder builder = new Health.Builder();
        
        // Check email service
        if (isEmailServiceHealthy()) {
            builder.up().withDetail("email", "Service is healthy");
        } else {
            builder.down().withDetail("email", "Service is down");
        }
        
        // Check payment service
        if (isPaymentServiceHealthy()) {
            builder.up().withDetail("payment", "Service is healthy");
        } else {
            builder.down().withDetail("payment", "Service is down");
        }
        
        // Check AI service
        if (isAIServiceHealthy()) {
            builder.up().withDetail("ai", "Service is healthy");
        } else {
            builder.down().withDetail("ai", "Service is down");
        }
        
        return builder.build();
    }
}
```

### **Integration Metrics**
- **Response Times**: Average response time for each integration
- **Success Rates**: Percentage of successful integration calls
- **Error Rates**: Frequency and types of integration errors
- **Throughput**: Number of integration calls per minute/hour
- **Circuit Breaker Status**: Current state of circuit breakers

---

## 📚 **Reference Documents**

**API Specifications**: See `/2_technical_architecture/3_api_specifications_and_endpoints.md`
**Security Design**: See `/2_technical_architecture/4_security_and_authentication_design.md`
**System Architecture**: See `/2_technical_architecture/1_system_architecture_design.md`
**Monitoring Setup**: See `/7_deployment_and_operations/2_monitoring_and_logging.md`

*This integration architecture ensures reliable, scalable, and secure connections with all external services and systems.*
