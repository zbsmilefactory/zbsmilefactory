# 5. API Testing and Validation

## 🧪 **API Testing and Validation Overview**

This document provides comprehensive guidance for testing and validating the ZbInnovation platform APIs, including unit testing strategies, integration testing, API testing frameworks, and performance testing approaches.

## 🏗️ **Testing Strategy Architecture**

### **Testing Pyramid Structure**
```
                    /\
                   /  \
                  /E2E \     <- End-to-End Tests (10%)
                 /______\
                /        \
               /Integration\ <- Integration Tests (20%)
              /__________\
             /            \
            /   Unit Tests  \  <- Unit Tests (70%)
           /________________\
```

### **Test Categories and Coverage**
- **Unit Tests (70%)**: Service layer, repository layer, utility classes
- **Integration Tests (20%)**: API endpoints, database integration, external services
- **End-to-End Tests (10%)**: Complete user workflows, system integration

## 🔧 **Unit Testing Implementation**

### **Service Layer Unit Tests (Node.js)**

**Node.js Testing Stack**: Using Jest for unit testing with comprehensive mocking and assertion capabilities.

```javascript
// tests/services/profileService.test.js
const ProfileService = require('../../services/profileService');
const passwordService = require('../../services/passwordService');
const emailService = require('../../services/emailService');

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  personalDetails: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn()
  },
  innovatorProfile: {
    create: jest.fn()
  }
}));

jest.mock('../../services/passwordService');
jest.mock('../../services/emailService');

const prisma = require('../../lib/prisma');

describe('ProfileService', () => {
  let profileService;

  beforeEach(() => {
    profileService = new (require('../../services/profileService').constructor)();
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    const validProfileData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      profileType: 'INNOVATOR'
    };

    it('should create profile successfully with valid data', async () => {
      // Arrange
      prisma.personalDetails.findUnique.mockResolvedValue(null); // Email not exists
      passwordService.hashPassword.mockResolvedValue('hashedPassword123');
      prisma.personalDetails.create.mockResolvedValue({
        id: 'user-123',
        ...validProfileData,
        passwordHash: 'hashedPassword123'
      });
      emailService.sendVerificationEmail.mockResolvedValue(true);

      // Act
      const result = await profileService.createProfile(validProfileData);

      // Assert
      expect(prisma.personalDetails.findUnique).toHaveBeenCalledWith({
        where: { email: validProfileData.email }
      });
      expect(passwordService.hashPassword).toHaveBeenCalledWith(validProfileData.password);
      expect(prisma.personalDetails.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: validProfileData.email,
          passwordHash: 'hashedPassword123',
          profileState: 'DRAFT',
          profileCompletion: 0
        })
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        validProfileData.email,
        'user-123'
      );
      expect(result.id).toBe('user-123');
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      prisma.personalDetails.findUnique.mockResolvedValue({ id: 'existing-user' });

      // Act & Assert
      await expect(profileService.createProfile(validProfileData))
        .rejects.toThrow('Email already registered');

      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(prisma.personalDetails.create).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      // Arrange
      const weakPasswordData = { ...validProfileData, password: '123' };
      prisma.personalDetails.findUnique.mockResolvedValue(null);
      passwordService.validatePasswordStrength.mockReturnValue({ isValid: false });

      // Act & Assert
      await expect(profileService.createProfile(weakPasswordData))
        .rejects.toThrow('Password does not meet security requirements');
    });
  });

  describe('calculateProfileCompletion', () => {
    it('should calculate completion percentage correctly', () => {
      // Arrange
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        phoneNumber: '+1234567890',
        email: 'test@example.com',
        emailVerified: true,
        isVerified: false,
        profileType: 'INNOVATOR',
        innovatorProfile: {
          industryFocus: 'Technology',
          innovationStage: 'MVP',
          startupName: 'Test Startup',
          startupDescription: 'Test description',
          businessModel: 'B2B'
        }
      };

      // Act
      const completion = profileService.calculateProfileCompletion(profile);

      // Assert
      expect(completion).toBeGreaterThan(0);
      expect(completion).toBeLessThanOrEqual(100);
      expect(typeof completion).toBe('number');
    });

    it('should return 0 for empty profile', () => {
      // Arrange
      const emptyProfile = {
        profileType: 'INNOVATOR'
      };

      // Act
      const completion = profileService.calculateProfileCompletion(emptyProfile);

      // Assert
      expect(completion).toBe(0);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and recalculate completion', async () => {
      // Arrange
      const profileId = 'user-123';
      const existingProfile = {
        id: profileId,
        firstName: 'John',
        profileType: 'INNOVATOR',
        profileCompletion: 30
      };
      const updateData = { lastName: 'Doe', bio: 'Updated bio' };

      prisma.personalDetails.findUnique.mockResolvedValue(existingProfile);
      prisma.personalDetails.update.mockResolvedValue({
        ...existingProfile,
        ...updateData,
        profileCompletion: 50
      });

      // Act
      const result = await profileService.updateProfile(profileId, updateData);

      // Assert
      expect(prisma.personalDetails.update).toHaveBeenCalledWith({
        where: { id: profileId },
        data: expect.objectContaining({
          ...updateData,
          profileCompletion: expect.any(Number),
          profileState: expect.any(String)
        })
      });
      expect(result.profileCompletion).toBeGreaterThan(existingProfile.profileCompletion);
    });

    it('should throw error if profile not found', async () => {
      // Arrange
      prisma.personalDetails.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(profileService.updateProfile('non-existent', {}))
        .rejects.toThrow('Profile not found');
    });
  });
});
```

### **API Endpoint Unit Tests**

```javascript
// tests/controllers/profileController.test.js
const request = require('supertest');
const app = require('../../app');
const profileService = require('../../services/profileService');
const jwtService = require('../../services/jwtService');

jest.mock('../../services/profileService');
jest.mock('../../services/jwtService');

describe('Profile Controller', () => {
  describe('POST /api/v1/profiles', () => {
    const validProfileData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      profileType: 'INNOVATOR'
    };

    it('should create profile successfully', async () => {
      // Arrange
      const createdProfile = { id: 'user-123', ...validProfileData };
      profileService.createProfile.mockResolvedValue(createdProfile);

      // Act
      const response = await request(app)
        .post('/api/v1/profiles')
        .send(validProfileData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('user-123');
      expect(profileService.createProfile).toHaveBeenCalledWith(validProfileData);
    });

    it('should return validation error for invalid data', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email' };

      // Act
      const response = await request(app)
        .post('/api/v1/profiles')
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should handle service errors', async () => {
      // Arrange
      profileService.createProfile.mockRejectedValue(new Error('Email already registered'));

      // Act
      const response = await request(app)
        .post('/api/v1/profiles')
        .send(validProfileData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('GET /api/v1/profiles/:id', () => {
    it('should return profile for authenticated user', async () => {
      // Arrange
      const profileId = 'user-123';
      const profile = { id: profileId, firstName: 'John' };
      const token = 'valid-jwt-token';

      jwtService.verifyToken.mockReturnValue({ userId: profileId });
      profileService.findById.mockResolvedValue(profile);

      // Act
      const response = await request(app)
        .get(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(profileId);
    });

    it('should return 401 for unauthenticated request', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/profiles/user-123')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication required');
    });
  });
});
```
## 🔗 **Integration Testing**

### **API Integration Tests (Node.js)**

**Node.js Integration Testing**: Using Jest with Supertest for comprehensive API integration testing.

```javascript
// tests/integration/profileIntegration.test.js
const request = require('supertest');
const app = require('../../app');
const prisma = require('../../lib/prisma');
const { setupTestDatabase, cleanupTestDatabase } = require('../helpers/testDatabase');

describe('Profile Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.personalDetails.deleteMany({});
    await prisma.innovatorProfile.deleteMany({});
  });

  describe('Profile Creation Flow', () => {
    it('should create complete profile workflow', async () => {
      const profileData = {
        email: 'integration@test.com',
        password: 'SecurePass123!',
        firstName: 'Integration',
        lastName: 'Test',
        profileType: 'INNOVATOR'
      };

      // Step 1: Create profile
      const createResponse = await request(app)
        .post('/api/v1/profiles')
        .send(profileData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      const profileId = createResponse.body.data.id;

      // Step 2: Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: profileData.email,
          password: profileData.password
        })
        .expect(200);

      const token = loginResponse.body.data.accessToken;

      // Step 3: Update profile
      const updateData = {
        bio: 'Integration test bio',
        phoneNumber: '+1234567890'
      };

      const updateResponse = await request(app)
        .put(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data.bio).toBe(updateData.bio);
      expect(updateResponse.body.data.profileCompletion).toBeGreaterThan(0);

      // Step 4: Verify profile in database
      const dbProfile = await prisma.personalDetails.findUnique({
        where: { id: profileId },
        include: { innovatorProfile: true }
      });

      expect(dbProfile).toBeTruthy();
      expect(dbProfile.bio).toBe(updateData.bio);
      expect(dbProfile.innovatorProfile).toBeTruthy();
    });
  });

  describe('Authentication Flow', () => {
    it('should handle complete authentication workflow', async () => {
      // Create user first
      const userData = {
        email: 'auth@test.com',
        password: 'SecurePass123!',
        firstName: 'Auth',
        lastName: 'Test',
        profileType: 'MENTOR'
      };

      await request(app)
        .post('/api/v1/profiles')
        .send(userData)
        .expect(201);

      // Login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.data.accessToken).toBeTruthy();
      expect(loginResponse.body.data.refreshToken).toBeTruthy();

      // Use token to access protected route
      const token = loginResponse.body.data.accessToken;
      const profileResponse = await request(app)
        .get('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.email).toBe(userData.email);
    });
  });
});
```

### **Database Integration Tests**

```javascript
// tests/integration/databaseIntegration.test.js
const prisma = require('../../lib/prisma');
const { setupTestDatabase, cleanupTestDatabase } = require('../helpers/testDatabase');

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await prisma.personalDetails.deleteMany({});
  });

  describe('Profile Relationships', () => {
    it('should create profile with related data', async () => {
      // Create main profile
      const profile = await prisma.personalDetails.create({
        data: {
          email: 'relationship@test.com',
          passwordHash: 'hashedPassword',
          firstName: 'Relationship',
          lastName: 'Test',
          profileType: 'INNOVATOR',
          profileState: 'DRAFT'
        }
      });

      // Create related innovator profile
      const innovatorProfile = await prisma.innovatorProfile.create({
        data: {
          userId: profile.id,
          industryFocus: 'Technology',
          innovationStage: 'MVP'
        }
      });

      // Verify relationship
      const profileWithRelations = await prisma.personalDetails.findUnique({
        where: { id: profile.id },
        include: { innovatorProfile: true }
      });

      expect(profileWithRelations.innovatorProfile).toBeTruthy();
      expect(profileWithRelations.innovatorProfile.industryFocus).toBe('Technology');
    });

    it('should handle cascade delete', async () => {
      // Create profile with related data
      const profile = await prisma.personalDetails.create({
        data: {
          email: 'cascade@test.com',
          passwordHash: 'hashedPassword',
          firstName: 'Cascade',
          lastName: 'Test',
          profileType: 'BUSINESS_INVESTOR',
          profileState: 'DRAFT'
        }
      });

      await prisma.businessInvestorProfile.create({
        data: {
          userId: profile.id,
          investmentFocus: 'Early Stage'
        }
      });

      // Delete main profile
      await prisma.personalDetails.delete({
        where: { id: profile.id }
      });

      // Verify related data is also deleted
      const relatedProfile = await prisma.businessInvestorProfile.findUnique({
        where: { userId: profile.id }
      });

      expect(relatedProfile).toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should enforce unique constraints', async () => {
      const email = 'unique@test.com';

      // Create first profile
      await prisma.personalDetails.create({
        data: {
          email,
          passwordHash: 'hashedPassword',
          firstName: 'First',
          lastName: 'User',
          profileType: 'MENTOR',
          profileState: 'DRAFT'
        }
      });

      // Attempt to create duplicate
      await expect(
        prisma.personalDetails.create({
          data: {
            email, // Same email
            passwordHash: 'hashedPassword',
            firstName: 'Second',
            lastName: 'User',
            profileType: 'MENTOR',
            profileState: 'DRAFT'
          }
        })
      ).rejects.toThrow();
    });
  });
});
```

## 📊 **Test Automation and CI/CD Integration**

### **Package.json Test Configuration**

**Node.js Test Scripts**: Comprehensive test configuration for different testing scenarios.

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:ci": "jest --coverage --watchAll=false --ci",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js",
      "!src/config/**",
      "!src/migrations/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "testMatch": [
      "<rootDir>/tests/**/*.test.js"
    ]
  }
}
```

### **GitHub Actions CI/CD Pipeline**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run database migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        JWT_SECRET: test-secret-key

    - name: Run coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

---

## ✅ **API Testing and Validation Summary**

### **Testing Strategy Overview**
- **Unit Tests (70%)**: Service layer, utility functions, business logic validation
- **Integration Tests (20%)**: API endpoints, database operations, service interactions
- **End-to-End Tests (10%)**: Complete user workflows, system integration

### **Key Testing Features**
- **Comprehensive Mocking**: Jest mocking for isolated unit testing
- **Database Testing**: Real database integration with test containers
- **API Testing**: Supertest for HTTP endpoint validation
- **Coverage Reporting**: Automated coverage tracking with thresholds
- **CI/CD Integration**: Automated testing in GitHub Actions

### **Testing Best Practices**
- Maintain >80% code coverage across all modules
- Use test databases for integration testing
- Mock external dependencies in unit tests
- Implement proper test data cleanup
- Use descriptive test names and clear assertions
- Separate unit, integration, and e2e tests
- Run tests in CI/CD pipeline for every commit

### **Implementation Guidelines**
- Write tests before implementing features (TDD approach)
- Use Jest for all JavaScript testing needs
- Implement proper test setup and teardown
- Mock external services and APIs
- Test both success and error scenarios
- Validate input/output data thoroughly
- Monitor test performance and execution time

The testing implementation provides comprehensive validation for the SmileFactory platform with robust unit, integration, and end-to-end testing capabilities.
    
    @Mock
    private PersonalDetailsRepository userRepository;
    
    @Mock
    private ProfileCompletionService profileCompletionService;
    
    @Mock
    private PasswordService passwordService;
    
    @Mock
    private NotificationService notificationService;
    
    @Mock
    private ApplicationEventPublisher eventPublisher;
    
    @InjectMocks
    private ProfileService profileService;
    
    @Test
    @DisplayName("Should create profile successfully when valid request provided")
    void shouldCreateProfileSuccessfully() {
        // Given
        CreateProfileRequest request = CreateProfileRequest.builder()
            .email("test@example.com")
            .password("SecurePassword123!")
            .firstName("John")
            .lastName("Doe")
            .profileType(ProfileType.INNOVATOR)
            .build();
        
        PersonalDetails expectedProfile = PersonalDetails.builder()
            .id("user-123")
            .email("test@example.com")
            .firstName("John")
            .lastName("Doe")
            .profileType(ProfileType.INNOVATOR)
            .build();
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordService.hashPassword(request.getPassword())).thenReturn("hashedPassword");
        when(profileCompletionService.calculateCompletion(any())).thenReturn(25);
        when(userRepository.save(any(PersonalDetails.class))).thenReturn(expectedProfile);
        
        // When
        PersonalDetails result = profileService.createProfile(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getProfileType()).isEqualTo(ProfileType.INNOVATOR);
        
        verify(userRepository).save(any(PersonalDetails.class));
        verify(notificationService).sendWelcomeEmail(any(PersonalDetails.class));
        verify(eventPublisher).publishEvent(any());
    }
    
    @Test
    @DisplayName("Should throw exception when email already exists")
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        CreateProfileRequest request = CreateProfileRequest.builder()
            .email("existing@example.com")
            .password("SecurePassword123!")
            .firstName("John")
            .lastName("Doe")
            .profileType(ProfileType.INNOVATOR)
            .build();
        
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        
        // When & Then
        assertThatThrownBy(() -> profileService.createProfile(request))
            .isInstanceOf(EmailAlreadyExistsException.class)
            .hasMessage("Email already exists: existing@example.com");
        
        verify(userRepository, never()).save(any());
        verify(notificationService, never()).sendWelcomeEmail(any());
    }
    
    @Test
    @DisplayName("Should update profile completion when profile is updated")
    void shouldUpdateProfileCompletionWhenUpdated() {
        // Given
        String userId = "user-123";
        UpdateProfileRequest request = UpdateProfileRequest.builder()
            .bio("Updated bio")
            .build();
        
        PersonalDetails existingProfile = PersonalDetails.builder()
            .id(userId)
            .email("test@example.com")
            .profileCompletion(25)
            .build();
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingProfile));
        when(profileCompletionService.calculateCompletion(any())).thenReturn(35);
        when(userRepository.save(any())).thenReturn(existingProfile);
        
        // When
        profileService.updateProfile(userId, request);
        
        // Then
        verify(profileCompletionService).calculateCompletion(any());
        verify(userRepository).save(argThat(profile -> 
            profile.getBio().equals("Updated bio")));
    }
}
```

### **Repository Layer Tests**
```java
@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb"
})
class PersonalDetailsRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private PersonalDetailsRepository repository;
    
    @Test
    @DisplayName("Should find user by email")
    void shouldFindUserByEmail() {
        // Given
        PersonalDetails user = PersonalDetails.builder()
            .email("test@example.com")
            .firstName("John")
            .lastName("Doe")
            .profileType(ProfileType.INNOVATOR)
            .build();
        
        entityManager.persistAndFlush(user);
        
        // When
        Optional<PersonalDetails> result = repository.findByEmail("test@example.com");
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("test@example.com");
        assertThat(result.get().getFirstName()).isEqualTo("John");
    }
    
    @Test
    @DisplayName("Should return empty when email not found")
    void shouldReturnEmptyWhenEmailNotFound() {
        // When
        Optional<PersonalDetails> result = repository.findByEmail("nonexistent@example.com");
        
        // Then
        assertThat(result).isEmpty();
    }
    
    @Test
    @DisplayName("Should find profiles by type with pagination")
    void shouldFindProfilesByTypeWithPagination() {
        // Given
        List<PersonalDetails> users = Arrays.asList(
            createUser("user1@example.com", ProfileType.INNOVATOR),
            createUser("user2@example.com", ProfileType.INNOVATOR),
            createUser("user3@example.com", ProfileType.MENTOR)
        );
        
        users.forEach(user -> entityManager.persistAndFlush(user));
        
        Pageable pageable = PageRequest.of(0, 10);
        
        // When
        Page<PersonalDetails> result = repository.findCompleteProfilesByType(
            ProfileType.INNOVATOR, pageable);
        
        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent())
            .allMatch(user -> user.getProfileType() == ProfileType.INNOVATOR);
    }
    
    private PersonalDetails createUser(String email, ProfileType profileType) {
        return PersonalDetails.builder()
            .email(email)
            .firstName("Test")
            .lastName("User")
            .profileType(profileType)
            .profileState(ProfileState.COMPLETE)
            .profileVisibility(ProfileVisibility.PUBLIC)
            .build();
    }
}
```

## 🔗 **Integration Testing**

### **API Integration Tests**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:integrationtest",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class ProfileControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private PersonalDetailsRepository userRepository;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    private String authToken;
    private PersonalDetails testUser;
    
    @BeforeEach
    void setUp() {
        testUser = createTestUser();
        authToken = generateAuthToken(testUser);
    }
    
    @Test
    @DisplayName("Should create profile successfully")
    void shouldCreateProfileSuccessfully() {
        // Given
        CreateProfileRequest request = CreateProfileRequest.builder()
            .email("newuser@example.com")
            .password("SecurePassword123!")
            .firstName("Jane")
            .lastName("Smith")
            .profileType(ProfileType.MENTOR)
            .agreeToTerms(true)
            .build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<CreateProfileRequest> entity = new HttpEntity<>(request, headers);
        
        // When
        ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
            "/api/v1/auth/register", entity, ApiResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().isSuccess()).isTrue();
        
        // Verify user was created in database
        Optional<PersonalDetails> createdUser = userRepository.findByEmail("newuser@example.com");
        assertThat(createdUser).isPresent();
        assertThat(createdUser.get().getFirstName()).isEqualTo("Jane");
        assertThat(createdUser.get().getProfileType()).isEqualTo(ProfileType.MENTOR);
    }
    
    @Test
    @DisplayName("Should get current user profile")
    void shouldGetCurrentUserProfile() {
        // Given
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        
        // When
        ResponseEntity<ApiResponse> response = restTemplate.exchange(
            "/api/v1/profiles/me", HttpMethod.GET, entity, ApiResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().isSuccess()).isTrue();
        
        Map<String, Object> data = (Map<String, Object>) response.getBody().getData();
        assertThat(data.get("email")).isEqualTo(testUser.getEmail());
        assertThat(data.get("firstName")).isEqualTo(testUser.getFirstName());
    }
    
    @Test
    @DisplayName("Should return 401 when accessing protected endpoint without token")
    void shouldReturn401WhenNoToken() {
        // When
        ResponseEntity<ApiResponse> response = restTemplate.getForEntity(
            "/api/v1/profiles/me", ApiResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
    
    @Test
    @DisplayName("Should update profile successfully")
    void shouldUpdateProfileSuccessfully() {
        // Given
        UpdateProfileRequest request = UpdateProfileRequest.builder()
            .bio("Updated bio for integration test")
            .build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<UpdateProfileRequest> entity = new HttpEntity<>(request, headers);
        
        // When
        ResponseEntity<ApiResponse> response = restTemplate.exchange(
            "/api/v1/profiles/me", HttpMethod.PUT, entity, ApiResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().isSuccess()).isTrue();
        
        // Verify update in database
        PersonalDetails updatedUser = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updatedUser.getBio()).isEqualTo("Updated bio for integration test");
    }
    
    private PersonalDetails createTestUser() {
        PersonalDetails user = PersonalDetails.builder()
            .email("test@example.com")
            .passwordHash("hashedPassword")
            .firstName("Test")
            .lastName("User")
            .profileType(ProfileType.INNOVATOR)
            .emailVerified(true)
            .build();
        
        return userRepository.save(user);
    }
    
    private String generateAuthToken(PersonalDetails user) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        return tokenProvider.generateAccessToken(userPrincipal);
    }
}
```

### **Database Integration Tests**
```java
@DataJpaTest
@TestPropertySource(properties = {
    "spring.test.database.replace=none",
    "spring.datasource.url=jdbc:testcontainers:postgresql:15:///test",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Testcontainers
class DatabaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("test")
            .withUsername("test")
            .withPassword("test");
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private PersonalDetailsRepository userRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Test
    @DisplayName("Should maintain referential integrity between users and posts")
    void shouldMaintainReferentialIntegrity() {
        // Given
        PersonalDetails user = PersonalDetails.builder()
            .email("author@example.com")
            .firstName("Author")
            .lastName("User")
            .profileType(ProfileType.INNOVATOR)
            .build();
        
        PersonalDetails savedUser = entityManager.persistAndFlush(user);
        
        Post post = Post.builder()
            .title("Test Post")
            .content("This is a test post content")
            .author(savedUser)
            .contentType(ContentType.GENERAL_POST)
            .visibility(PostVisibility.PUBLIC)
            .status(PostStatus.PUBLISHED)
            .build();
        
        // When
        Post savedPost = entityManager.persistAndFlush(post);
        
        // Then
        assertThat(savedPost.getAuthor()).isNotNull();
        assertThat(savedPost.getAuthor().getId()).isEqualTo(savedUser.getId());
        
        // Verify cascade operations
        List<Post> userPosts = postRepository.findByAuthorId(savedUser.getId());
        assertThat(userPosts).hasSize(1);
        assertThat(userPosts.get(0).getTitle()).isEqualTo("Test Post");
    }
    
    @Test
    @DisplayName("Should handle complex queries with joins")
    void shouldHandleComplexQueriesWithJoins() {
        // Given
        PersonalDetails user1 = createAndSaveUser("user1@example.com", ProfileType.INNOVATOR);
        PersonalDetails user2 = createAndSaveUser("user2@example.com", ProfileType.MENTOR);
        
        createAndSavePost(user1, "Innovation Post", "Content about innovation");
        createAndSavePost(user2, "Mentoring Post", "Content about mentoring");
        
        // When
        Page<Post> innovatorPosts = postRepository.findByAuthorProfileType(
            ProfileType.INNOVATOR, PageRequest.of(0, 10));
        
        // Then
        assertThat(innovatorPosts.getContent()).hasSize(1);
        assertThat(innovatorPosts.getContent().get(0).getTitle()).isEqualTo("Innovation Post");
        assertThat(innovatorPosts.getContent().get(0).getAuthor().getProfileType())
            .isEqualTo(ProfileType.INNOVATOR);
    }
    
    private PersonalDetails createAndSaveUser(String email, ProfileType profileType) {
        PersonalDetails user = PersonalDetails.builder()
            .email(email)
            .firstName("Test")
            .lastName("User")
            .profileType(profileType)
            .build();
        
        return entityManager.persistAndFlush(user);
    }
    
    private Post createAndSavePost(PersonalDetails author, String title, String content) {
        Post post = Post.builder()
            .title(title)
            .content(content)
            .author(author)
            .contentType(ContentType.GENERAL_POST)
            .visibility(PostVisibility.PUBLIC)
            .status(PostStatus.PUBLISHED)
            .build();
        
        return entityManager.persistAndFlush(post);
    }
}
```

## 🚀 **Performance Testing**

### **Load Testing with JMeter**
```xml
<!-- JMeter Test Plan for API Load Testing -->
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="ZbInnovation API Load Test">
      <elementProp name="TestPlan.arguments" elementType="Arguments" guiclass="ArgumentsPanel">
        <collectionProp name="Arguments.arguments">
          <elementProp name="baseUrl" elementType="Argument">
            <stringProp name="Argument.name">baseUrl</stringProp>
            <stringProp name="Argument.value">http://localhost:8080</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="API Load Test">
        <stringProp name="ThreadGroup.num_threads">100</stringProp>
        <stringProp name="ThreadGroup.ramp_time">60</stringProp>
        <stringProp name="ThreadGroup.duration">300</stringProp>
        <boolProp name="ThreadGroup.scheduler">true</boolProp>
      </ThreadGroup>
      
      <hashTree>
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="Get Profile">
          <stringProp name="HTTPSampler.domain">${baseUrl}</stringProp>
          <stringProp name="HTTPSampler.path">/api/v1/profiles/me</stringProp>
          <stringProp name="HTTPSampler.method">GET</stringProp>
          <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager">
            <collectionProp name="HeaderManager.headers">
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">Authorization</stringProp>
                <stringProp name="Header.value">Bearer ${authToken}</stringProp>
              </elementProp>
            </collectionProp>
          </HeaderManager>
        </HTTPSamplerProxy>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

### **Performance Test Implementation**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:performancetest",
    "logging.level.org.springframework.web=DEBUG"
})
class PerformanceTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    @DisplayName("Should handle concurrent profile requests within acceptable time")
    void shouldHandleConcurrentProfileRequests() throws InterruptedException {
        // Given
        int numberOfThreads = 50;
        int requestsPerThread = 10;
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        List<Long> responseTimes = Collections.synchronizedList(new ArrayList<>());
        
        // When
        for (int i = 0; i < numberOfThreads; i++) {
            new Thread(() -> {
                try {
                    for (int j = 0; j < requestsPerThread; j++) {
                        long startTime = System.currentTimeMillis();
                        
                        ResponseEntity<String> response = restTemplate.getForEntity(
                            "/api/v1/public/health", String.class);
                        
                        long endTime = System.currentTimeMillis();
                        responseTimes.add(endTime - startTime);
                        
                        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                    }
                } finally {
                    latch.countDown();
                }
            }).start();
        }
        
        latch.await(30, TimeUnit.SECONDS);
        
        // Then
        double averageResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);
        
        long maxResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);
        
        assertThat(averageResponseTime).isLessThan(500.0); // Average < 500ms
        assertThat(maxResponseTime).isLessThan(2000L); // Max < 2 seconds
        assertThat(responseTimes).hasSize(numberOfThreads * requestsPerThread);
        
        log.info("Performance Test Results:");
        log.info("Total requests: {}", responseTimes.size());
        log.info("Average response time: {:.2f}ms", averageResponseTime);
        log.info("Max response time: {}ms", maxResponseTime);
    }
}
```

## 📊 **Test Automation and CI/CD Integration**

### **Maven Test Configuration**
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.0.0-M9</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*Tests.java</include>
                </includes>
                <excludes>
                    <exclude>**/*IntegrationTest.java</exclude>
                    <exclude>**/*PerformanceTest.java</exclude>
                </excludes>
            </configuration>
        </plugin>
        
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <version>3.0.0-M9</version>
            <configuration>
                <includes>
                    <include>**/*IntegrationTest.java</include>
                </includes>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>integration-test</goal>
                        <goal>verify</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>0.8.8</version>
            <executions>
                <execution>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>test</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

### **Test Quality Gates**
```yaml
# Quality gates for test validation
test_quality_gates:
  unit_tests:
    coverage_threshold: 80%
    mutation_score: 70%
    max_execution_time: 30s
  
  integration_tests:
    coverage_threshold: 60%
    max_execution_time: 5m
    database_rollback: required
  
  performance_tests:
    max_response_time: 500ms
    throughput_threshold: 1000_rps
    error_rate_threshold: 1%
```

---

## 📚 **Reference Documents**

**Core API Development**: See `/4_backend_implementation/1_core_api_development.md`
**Database Implementation**: See `/4_backend_implementation/2_database_implementation.md`
**Authentication Security**: See `/4_backend_implementation/3_authentication_and_security.md`
**Business Logic**: See `/4_backend_implementation/4_business_logic_implementation.md`

*This comprehensive testing strategy ensures high-quality, reliable APIs for the ZbInnovation platform.*
