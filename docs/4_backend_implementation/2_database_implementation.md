# 2. Database Implementation

## 🗄️ **Database Implementation Overview**

This document outlines the comprehensive database implementation strategy for the SmileFactory Platform, including schema design, data access layer implementation, migration management, and performance optimization using PostgreSQL with Prisma ORM.

## 🏗️ **Database Schema Implementation**

### **Prisma Schema Base Configuration**

**Node.js/Prisma Approach**: Prisma uses a declarative schema file that defines the database structure, relationships, and automatic timestamp handling. This provides type safety and automatic migration generation.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Base fields that will be included in all models
// Prisma automatically handles UUID generation and timestamps
```

### **Common Database Patterns**

**Automatic Timestamps**: Prisma provides built-in `@default(now())` and `@updatedAt` decorators for automatic timestamp management.

**UUID Generation**: Prisma automatically generates UUIDs when using `@default(cuid())` or `@default(uuid())`.

**Optimistic Locking**: Version fields can be implemented using integer fields that increment on updates.

### **User Profile Schema**

**Prisma Schema Definition**: The following schema defines the core user profile structure with automatic timestamps, indexing, and relationships.

```prisma
// User profile enums
enum ProfileState {
  DRAFT
  INCOMPLETE
  COMPLETE
}

enum ProfileType {
  INNOVATOR
  BUSINESS_INVESTOR
  MENTOR
  PROFESSIONAL
  INDUSTRY_EXPERT
  ACADEMIC_STUDENT
  ACADEMIC_INSTITUTION
  ORGANISATION
}

enum ProfileVisibility {
  PUBLIC
  PRIVATE
  CONNECTIONS_ONLY
}

// Main user profile model
model PersonalDetails {
  id                    String            @id @default(cuid())
  email                 String            @unique
  passwordHash          String            @map("password_hash")
  firstName             String?           @map("first_name")
  lastName              String?           @map("last_name")
  phoneCountryCode      String?           @map("phone_country_code")
  phoneNumber           String?           @map("phone_number")
  gender                String?
  role                  String            @default("USER")
  profileName           String?           @map("profile_name")
  profileState          ProfileState      @default(DRAFT) @map("profile_state")
  profileType           ProfileType       @map("profile_type")
  profileVisibility     ProfileVisibility @default(PUBLIC) @map("profile_visibility")
  profileCompletion     Int               @default(0) @map("profile_completion")
  isVerified            Boolean           @default(false) @map("is_verified")
  emailVerified         Boolean           @default(false) @map("email_verified")
  bio                   String?
  hearAboutUs           Json?             @map("hear_about_us")
  lastLoginAt           DateTime?         @map("last_login_at")
  createdAt             DateTime          @default(now()) @map("created_at")
  updatedAt             DateTime          @updatedAt @map("updated_at")

  // Relationships
  innovatorProfile      InnovatorProfile?
  businessInvestorProfile BusinessInvestorProfile?
  mentorProfile         MentorProfile?
  posts                 Post[]
  sentConnections       Connection[]      @relation("ConnectionRequester")
  receivedConnections   Connection[]      @relation("ConnectionRecipient")

  @@index([email])
  @@index([profileType])
  @@index([createdAt])
  @@map("personal_details")
}
```

### **Profile Type-Specific Schemas**

**Prisma Schema for Profile Extensions**: Each profile type has specific fields while maintaining a relationship to the main user profile.

```prisma
model InnovatorProfile {
  id                    String          @id @default(cuid())
  userId                String          @unique @map("user_id")
  industryFocus         String?         @map("industry_focus")
  innovationStage       String?         @map("innovation_stage")
  startupName           String?         @map("startup_name")
  startupDescription    String?         @map("startup_description")
  fundingAmountNeeded   Decimal?        @map("funding_amount_needed")
  teamSize              Int?            @map("team_size")
  businessModel         String?         @map("business_model")
  targetMarket          String?         @map("target_market")
  competitiveAdvantage  String?         @map("competitive_advantage")
  intellectualProperty  Json?           @map("intellectual_property")
  currentChallenges     Json?           @map("current_challenges")
  achievements          Json?
  createdAt             DateTime        @default(now()) @map("created_at")
  updatedAt             DateTime        @updatedAt @map("updated_at")

  // Relationship to main user profile
  user                  PersonalDetails @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("innovator_profiles")
}
```

## 🔧 **Data Access Layer (Prisma Client)**

### **Prisma Client Configuration**

**Node.js/Prisma Approach**: Prisma generates a type-safe client that provides all CRUD operations, relationships, and advanced querying capabilities without requiring repository interfaces.

```javascript
// lib/prisma.js - Prisma client configuration
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
```

### **Database Service Layer**

**Service Pattern with Prisma**: Instead of repositories, we use service classes that encapsulate business logic and use the Prisma client for data access.

```javascript
// services/userService.js
const prisma = require('../lib/prisma');

class UserService {
  // Find user by email
  async findByEmail(email) {
    return await prisma.personalDetails.findUnique({
      where: { email },
      include: {
        innovatorProfile: true,
        businessInvestorProfile: true,
        mentorProfile: true
      }
    });
  }

  // Find users by profile type and state
  async findByProfileTypeAndState(profileType, profileState) {
    return await prisma.personalDetails.findMany({
      where: {
        profileType,
        profileState
      }
    });
  }

  // Search profiles with filters
  async searchProfiles(filters, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      profileVisibility: 'PUBLIC',
      profileState: 'COMPLETE'
    };

    if (filters.profileType) {
      where.profileType = filters.profileType;
    }

    if (filters.location) {
      where.bio = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    return await prisma.personalDetails.findMany({
      where,
      skip,
      take: limit,
      include: {
        innovatorProfile: true,
        businessInvestorProfile: true,
        mentorProfile: true
      }
    });
  }

  // Count users by profile type
  async countByProfileType(profileType) {
    return await prisma.personalDetails.count({
      where: { profileType }
    });
  }

  // Update last login time
  async updateLastLoginTime(userId) {
    return await prisma.personalDetails.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }
}

module.exports = new UserService();
```

## 🔄 **Database Migration Management**

### **Prisma Migrations**

**Node.js/Prisma Approach**: Prisma provides a powerful migration system that tracks schema changes and generates SQL migrations automatically.

```bash
# Generate migration after schema changes
npx prisma migrate dev --name add_user_profiles

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

### **Migration Best Practices**

**Schema Evolution**: Prisma migrations are version-controlled and can be reviewed before deployment.

- **Development**: Use `prisma migrate dev` for iterative development
- **Production**: Use `prisma migrate deploy` for production deployments
- **Rollbacks**: Prisma maintains migration history for rollback capabilities
- **Data Seeding**: Use `prisma db seed` for initial data population

## 📊 **Database Performance Optimization**

### **Prisma Configuration**

**Connection Pooling and Performance**: Prisma provides built-in connection pooling and query optimization.

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling configuration
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  // Enable query engine optimizations
  previewFeatures = ["fullTextSearch", "metrics"]
}
```

### **Query Optimization Strategies**

**Efficient Querying**: Prisma provides several optimization techniques for better performance.

```javascript
// services/optimizedQueryService.js
const prisma = require('../lib/prisma');

class OptimizedQueryService {
  // Use select to fetch only needed fields
  async getUserBasicInfo(userId) {
    return await prisma.personalDetails.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileType: true
      }
    });
  }

  // Use pagination for large datasets
  async getPaginatedUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.personalDetails.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.personalDetails.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Use transactions for data consistency
  async createUserWithProfile(userData, profileData) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.personalDetails.create({
        data: userData
      });

      const profile = await tx.innovatorProfile.create({
        data: {
          ...profileData,
          userId: user.id
        }
      });

      return { user, profile };
    });
  }
}

module.exports = new OptimizedQueryService();
```

## 🔍 **Database Monitoring and Health Checks**

### **Database Health Monitoring**

**Node.js Health Checks**: Monitor database connectivity and performance using Prisma client.

```javascript
// services/healthService.js
const prisma = require('../lib/prisma');

class HealthService {
  async checkDatabaseHealth() {
    try {
      // Simple connectivity check
      await prisma.$queryRaw`SELECT 1`;

      // Check response time
      const start = Date.now();
      await prisma.personalDetails.count();
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getDatabaseMetrics() {
    try {
      const [userCount, activeUsers, recentPosts] = await Promise.all([
        prisma.personalDetails.count(),
        prisma.personalDetails.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }),
        prisma.post.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      return {
        totalUsers: userCount,
        activeUsers,
        recentPosts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get database metrics: ${error.message}`);
    }
  }
}

module.exports = new HealthService();
```

---

## ✅ **Database Implementation Summary**

### **Key Benefits of Prisma ORM**
- **Type Safety**: Auto-generated TypeScript types for all database operations
- **Migration Management**: Version-controlled schema evolution with automatic SQL generation
- **Query Optimization**: Built-in connection pooling and query optimization
- **Developer Experience**: Intuitive API with excellent IDE support
- **Performance Monitoring**: Built-in metrics and query analysis tools

### **Implementation Guidelines**
- Use Prisma schema for all database structure definitions
- Implement service layer pattern for business logic encapsulation
- Leverage Prisma's type safety for robust application development
- Use migrations for all schema changes in development and production
- Monitor database performance using built-in Prisma metrics

The database implementation provides a solid foundation for the SmileFactory platform with type-safe operations, efficient querying, and comprehensive monitoring capabilities.
```java
@Repository
public interface PersonalDetailsRepository extends BaseRepository<PersonalDetails> {
    
    Optional<PersonalDetails> findByEmail(String email);
    
    Optional<PersonalDetails> findByEmailAndEmailVerifiedTrue(String email);
    
    @Query("SELECT p FROM PersonalDetails p WHERE p.profileType = :profileType AND p.profileState = 'COMPLETE'")
    Page<PersonalDetails> findCompleteProfilesByType(@Param("profileType") ProfileType profileType, Pageable pageable);
    
    @Query("SELECT p FROM PersonalDetails p WHERE " +
           "(:profileType IS NULL OR p.profileType = :profileType) AND " +
           "(:location IS NULL OR LOWER(p.bio) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "p.profileVisibility = 'PUBLIC' AND p.profileState = 'COMPLETE'")
    Page<PersonalDetails> searchProfiles(@Param("profileType") ProfileType profileType,
                                       @Param("location") String location,
                                       Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM PersonalDetails p WHERE p.profileType = :profileType")
    long countByProfileType(@Param("profileType") ProfileType profileType);
    
    @Query("SELECT p FROM PersonalDetails p WHERE p.lastLoginAt >= :since")
    List<PersonalDetails> findActiveUsersSince(@Param("since") LocalDateTime since);
    
    @Modifying
    @Query("UPDATE PersonalDetails p SET p.lastLoginAt = :loginTime WHERE p.id = :userId")
    void updateLastLoginTime(@Param("userId") String userId, @Param("loginTime") LocalDateTime loginTime);
}
```

### **Content Repository**
```java
@Repository
public interface PostRepository extends BaseRepository<Post> {
    
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.status = :status ORDER BY p.publishedAt DESC")
    Page<Post> findByAuthorAndStatus(@Param("authorId") String authorId, 
                                   @Param("status") PostStatus status, 
                                   Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.visibility = 'PUBLIC' AND p.status = 'PUBLISHED' " +
           "ORDER BY p.publishedAt DESC")
    Page<Post> findPublicPosts(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE " +
           "p.visibility = 'PUBLIC' AND p.status = 'PUBLISHED' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.publishedAt DESC")
    Page<Post> searchPublicPosts(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.author.profileType IN :profileTypes AND " +
           "p.visibility = 'PUBLIC' AND p.status = 'PUBLISHED' " +
           "ORDER BY p.likeCount DESC, p.publishedAt DESC")
    Page<Post> findTrendingPostsByProfileTypes(@Param("profileTypes") List<ProfileType> profileTypes, 
                                             Pageable pageable);
    
    @Modifying
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + :increment WHERE p.id = :postId")
    void updateLikeCount(@Param("postId") String postId, @Param("increment") int increment);
    
    @Query("SELECT p FROM Post p JOIN p.author a WHERE a.id IN :connectionIds AND " +
           "p.visibility IN ('PUBLIC', 'CONNECTIONS_ONLY') AND p.status = 'PUBLISHED' " +
           "ORDER BY p.publishedAt DESC")
    Page<Post> findPostsFromConnections(@Param("connectionIds") List<String> connectionIds, 
                                      Pageable pageable);
}
```

## 🔄 **Database Migration Management**

### **Flyway Configuration**
```java
@Configuration
public class FlywayConfig {
    
    @Bean
    @Primary
    public Flyway flyway(@Qualifier("dataSource") DataSource dataSource) {
        return Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .validateOnMigrate(true)
            .cleanDisabled(true)
            .load();
    }
    
    @EventListener
    public void handleContextRefresh(ContextRefreshedEvent event) {
        flyway(null).migrate();
    }
}
```

### **Migration Script Example**
```sql
-- V1_001__Create_personal_details_table.sql
CREATE TABLE personal_details (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    gender VARCHAR(20),
    role VARCHAR(50) DEFAULT 'USER',
    profile_name VARCHAR(200),
    profile_state VARCHAR(20) DEFAULT 'DRAFT',
    profile_type VARCHAR(50),
    profile_visibility VARCHAR(20) DEFAULT 'PUBLIC',
    profile_completion INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    hear_about_us JSONB,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version BIGINT DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_personal_details_email ON personal_details(email);
CREATE INDEX idx_personal_details_profile_type ON personal_details(profile_type);
CREATE INDEX idx_personal_details_created_at ON personal_details(created_at);
CREATE INDEX idx_personal_details_profile_state ON personal_details(profile_state);

-- Add constraints
ALTER TABLE personal_details ADD CONSTRAINT chk_profile_completion 
    CHECK (profile_completion >= 0 AND profile_completion <= 100);
```

## 📊 **Database Performance Optimization**

### **JPA Configuration**
```java
@Configuration
@EnableJpaRepositories(basePackages = "com.zbinnovation.repository")
@EnableJpaAuditing
public class JpaConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        return transactionManager;
    }
    
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new SpringSecurityAuditorAware();
    }
    
    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> {
            hibernateProperties.put("hibernate.jdbc.batch_size", 25);
            hibernateProperties.put("hibernate.order_inserts", true);
            hibernateProperties.put("hibernate.order_updates", true);
            hibernateProperties.put("hibernate.jdbc.batch_versioned_data", true);
            hibernateProperties.put("hibernate.generate_statistics", true);
            hibernateProperties.put("hibernate.cache.use_second_level_cache", true);
            hibernateProperties.put("hibernate.cache.use_query_cache", true);
            hibernateProperties.put("hibernate.cache.region.factory_class", 
                "org.hibernate.cache.jcache.JCacheRegionFactory");
        };
    }
}
```

### **Connection Pool Configuration**
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/zbinnovation
    username: ${DB_USERNAME:zbinnovation_user}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1200000
      connection-timeout: 20000
      leak-detection-threshold: 60000
      pool-name: ZbInnovationHikariCP
      
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
        jdbc:
          lob:
            non_contextual_creation: true
```

### **Query Optimization Strategies**
```java
@Service
@Transactional(readOnly = true)
public class OptimizedQueryService {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Batch processing for large datasets
    @Transactional
    public void batchUpdateProfileCompletion() {
        String jpql = "UPDATE PersonalDetails p SET p.profileCompletion = " +
                     "(SELECT COALESCE(SUM(CASE " +
                     "WHEN p.firstName IS NOT NULL THEN 5 " +
                     "WHEN p.lastName IS NOT NULL THEN 5 " +
                     "WHEN p.email IS NOT NULL THEN 5 " +
                     "WHEN p.bio IS NOT NULL THEN 10 " +
                     "ELSE 0 END), 0))";
        
        entityManager.createQuery(jpql).executeUpdate();
    }
    
    // Optimized pagination with cursor-based approach
    public Page<PersonalDetails> findUsersWithCursorPagination(String lastId, int limit) {
        String jpql = "SELECT p FROM PersonalDetails p WHERE " +
                     "(:lastId IS NULL OR p.id > :lastId) " +
                     "ORDER BY p.id ASC";
        
        TypedQuery<PersonalDetails> query = entityManager.createQuery(jpql, PersonalDetails.class);
        query.setParameter("lastId", lastId);
        query.setMaxResults(limit + 1); // +1 to check if there are more results
        
        List<PersonalDetails> results = query.getResultList();
        boolean hasNext = results.size() > limit;
        
        if (hasNext) {
            results.remove(results.size() - 1);
        }
        
        return new PageImpl<>(results, PageRequest.of(0, limit), results.size());
    }
    
    // Native query for complex analytics
    @Query(value = """
        SELECT 
            profile_type,
            COUNT(*) as total_users,
            AVG(profile_completion) as avg_completion,
            COUNT(CASE WHEN last_login_at >= NOW() - INTERVAL '30 days' THEN 1 END) as active_users
        FROM personal_details 
        WHERE profile_state = 'COMPLETE'
        GROUP BY profile_type
        ORDER BY total_users DESC
        """, nativeQuery = true)
    List<Object[]> getUserStatsByProfileType();
}
```

## 🔍 **Database Monitoring and Health Checks**

### **Database Health Indicator**
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "Connection successful")
                    .withDetail("validationQuery", "SELECT 1")
                    .build();
            } else {
                return Health.down()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "Connection validation failed")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("database", "PostgreSQL")
                .withDetail("status", "Connection failed")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

### **Database Metrics**
```java
@Component
public class DatabaseMetrics {
    
    private final MeterRegistry meterRegistry;
    private final DataSource dataSource;
    
    public DatabaseMetrics(MeterRegistry meterRegistry, DataSource dataSource) {
        this.meterRegistry = meterRegistry;
        this.dataSource = dataSource;
        
        // Register custom metrics
        Gauge.builder("database.connections.active")
            .description("Number of active database connections")
            .register(meterRegistry, this, DatabaseMetrics::getActiveConnections);
            
        Gauge.builder("database.connections.idle")
            .description("Number of idle database connections")
            .register(meterRegistry, this, DatabaseMetrics::getIdleConnections);
    }
    
    private double getActiveConnections() {
        if (dataSource instanceof HikariDataSource) {
            return ((HikariDataSource) dataSource).getHikariPoolMXBean().getActiveConnections();
        }
        return 0;
    }
    
    private double getIdleConnections() {
        if (dataSource instanceof HikariDataSource) {
            return ((HikariDataSource) dataSource).getHikariPoolMXBean().getIdleConnections();
        }
        return 0;
    }
}
```

---

## 📚 **Reference Documents**

**Database Schema**: See `/2_technical_architecture/2_database_schema_and_design.md`
**Core API Development**: See `/4_backend_implementation/1_core_api_development.md`
**Authentication Implementation**: See `/4_backend_implementation/3_authentication_and_security.md`
**API Testing**: See `/4_backend_implementation/5_api_testing_and_validation.md`

*This database implementation provides a robust, scalable data layer for the ZbInnovation platform with optimized performance and comprehensive monitoring.*
