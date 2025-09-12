# 4. Business Logic Implementation

## 🏢 **Business Logic Implementation Overview**

This document outlines the comprehensive business logic implementation for the SmileFactory Platform using Node.js/Express.js, including service layer architecture, profile type-specific logic, AI integration services, and business rule enforcement.

## 🏗️ **Service Layer Architecture**

### **Base Service Pattern (Node.js)**

**Node.js Service Layer**: Using ES6 classes and Prisma client for clean, maintainable business logic implementation.

```javascript
// services/baseService.js
const prisma = require('../lib/prisma');
const winston = require('winston');

class BaseService {
  constructor(modelName) {
    this.modelName = modelName;
    this.model = prisma[modelName];
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'services.log' })
      ]
    });
  }

  /**
   * Create new entity with validation and enrichment
   * @param {Object} data - Entity data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Created entity
   */
  async create(data, options = {}) {
    try {
      // Pre-creation validation
      await this.validateForCreation(data);

      // Enrich entity data
      const enrichedData = await this.enrichEntityForCreation(data);

      // Create entity
      const entity = await this.model.create({
        data: enrichedData,
        include: options.include || {}
      });

      this.logger.info(`${this.modelName} created`, {
        entityId: entity.id,
        userId: options.userId
      });

      // Post-creation processing
      await this.postCreationProcessing(entity, options);

      return entity;
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName}`, {
        error: error.message,
        data
      });
      throw error;
    }
  }

  /**
   * Update entity with validation
   * @param {string} id - Entity ID
   * @param {Object} data - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Updated entity
   */
  async update(id, data, options = {}) {
    try {
      // Check if entity exists
      const existingEntity = await this.findById(id);
      if (!existingEntity) {
        throw new Error(`${this.modelName} not found`);
      }

      // Validate update
      await this.validateForUpdate(id, data, existingEntity);

      // Enrich update data
      const enrichedData = await this.enrichEntityForUpdate(data, existingEntity);

      // Update entity
      const updatedEntity = await this.model.update({
        where: { id },
        data: enrichedData,
        include: options.include || {}
      });

      this.logger.info(`${this.modelName} updated`, {
        entityId: id,
        userId: options.userId
      });

      return updatedEntity;
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName}`, {
        error: error.message,
        entityId: id
      });
      throw error;
    }
  }

  /**
   * Find entity by ID
   * @param {string} id - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - Found entity or null
   */
  async findById(id, options = {}) {
    return await this.model.findUnique({
      where: { id },
      include: options.include || {}
    });
  }

  /**
   * Find entities with pagination
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Paginated results
   */
  async findMany(filters = {}, pagination = {}) {
    const { page = 1, limit = 20, orderBy = { createdAt: 'desc' } } = pagination;
    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.model.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy
      }),
      this.model.count({ where: filters })
    ]);

    return {
      data: entities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete entity (soft delete if supported)
   * @param {string} id - Entity ID
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} - Success status
   */
  async delete(id, options = {}) {
    try {
      const entity = await this.findById(id);
      if (!entity) {
        throw new Error(`${this.modelName} not found`);
      }

      // Check if soft delete is supported
      if (this.supportsSoftDelete()) {
        await this.model.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            isDeleted: true
          }
        });
      } else {
        await this.model.delete({ where: { id } });
      }

      this.logger.info(`${this.modelName} deleted`, {
        entityId: id,
        userId: options.userId
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName}`, {
        error: error.message,
        entityId: id
      });
      throw error;
    }
  }

  // Override these methods in child classes
  async validateForCreation(data) {
    // Default validation logic
  }

  async validateForUpdate(id, data, existingEntity) {
    // Default validation logic
  }

  async enrichEntityForCreation(data) {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async enrichEntityForUpdate(data, existingEntity) {
    return {
      ...data,
      updatedAt: new Date()
    };
  }

  async postCreationProcessing(entity, options) {
    // Override in child classes for post-creation logic
  }

  supportsSoftDelete() {
    return false; // Override in child classes if soft delete is supported
  }
}

module.exports = BaseService;
### **Profile Management Service**

**Node.js Profile Service**: Specialized service for managing user profiles with business logic validation.

```javascript
// services/profileService.js
const BaseService = require('./baseService');
const passwordService = require('./passwordService');
const emailService = require('./emailService');
const { ProfileState, ProfileType } = require('../types/enums');

class ProfileService extends BaseService {
  constructor() {
    super('personalDetails');
    this.profileCompletionWeights = {
      basicInfo: 30,
      contactInfo: 20,
      profileSpecific: 30,
      verification: 20
    };
  }

  /**
   * Create new user profile with validation
   * @param {Object} profileData - Profile creation data
   * @returns {Promise<Object>} - Created profile
   */
  async createProfile(profileData) {
    // Validate email uniqueness
    const existingUser = await this.findByEmail(profileData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await passwordService.hashPassword(profileData.password);

    // Create profile with initial state
    const profileCreateData = {
      ...profileData,
      passwordHash: hashedPassword,
      profileState: ProfileState.DRAFT,
      profileCompletion: 0,
      isVerified: false,
      emailVerified: false
    };

    const profile = await this.create(profileCreateData);

    // Send verification email
    await emailService.sendVerificationEmail(profile.email, profile.id);

    return profile;
  }

  /**
   * Update profile with completion calculation
   * @param {string} profileId - Profile ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated profile
   */
  async updateProfile(profileId, updateData) {
    const profile = await this.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Calculate new completion percentage
    const updatedProfile = { ...profile, ...updateData };
    const completionPercentage = this.calculateProfileCompletion(updatedProfile);

    // Update profile state based on completion
    const profileState = this.determineProfileState(completionPercentage);

    const finalUpdateData = {
      ...updateData,
      profileCompletion: completionPercentage,
      profileState
    };

    return await this.update(profileId, finalUpdateData);
  }

  /**
   * Find profile by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} - Profile or null
   */
  async findByEmail(email) {
    return await this.model.findUnique({
      where: { email },
      include: {
        innovatorProfile: true,
        businessInvestorProfile: true,
        mentorProfile: true
      }
    });
  }

  /**
   * Calculate profile completion percentage
   * @param {Object} profile - Profile data
   * @returns {number} - Completion percentage (0-100)
   */
  calculateProfileCompletion(profile) {
    let totalScore = 0;

    // Basic info score (30%)
    const basicInfoFields = ['firstName', 'lastName', 'bio'];
    const basicInfoComplete = basicInfoFields.filter(field => profile[field]).length;
    totalScore += (basicInfoComplete / basicInfoFields.length) * this.profileCompletionWeights.basicInfo;

    // Contact info score (20%)
    const contactInfoFields = ['phoneNumber', 'email'];
    const contactInfoComplete = contactInfoFields.filter(field => profile[field]).length;
    totalScore += (contactInfoComplete / contactInfoFields.length) * this.profileCompletionWeights.contactInfo;

    // Profile-specific score (30%)
    const profileSpecificScore = this.calculateProfileSpecificCompletion(profile);
    totalScore += profileSpecificScore * this.profileCompletionWeights.profileSpecific / 100;

    // Verification score (20%)
    let verificationScore = 0;
    if (profile.emailVerified) verificationScore += 50;
    if (profile.isVerified) verificationScore += 50;
    totalScore += verificationScore * this.profileCompletionWeights.verification / 100;

    return Math.round(totalScore);
  }

  /**
   * Calculate profile-specific completion based on profile type
   * @param {Object} profile - Profile data
   * @returns {number} - Profile-specific completion percentage
   */
  calculateProfileSpecificCompletion(profile) {
    switch (profile.profileType) {
      case ProfileType.INNOVATOR:
        return this.calculateInnovatorCompletion(profile.innovatorProfile);
      case ProfileType.BUSINESS_INVESTOR:
        return this.calculateInvestorCompletion(profile.businessInvestorProfile);
      case ProfileType.MENTOR:
        return this.calculateMentorCompletion(profile.mentorProfile);
      default:
        return 0;
    }
  }

  /**
   * Determine profile state based on completion
   * @param {number} completionPercentage - Completion percentage
   * @returns {string} - Profile state
   */
  determineProfileState(completionPercentage) {
    if (completionPercentage >= 90) return ProfileState.COMPLETE;
    if (completionPercentage >= 50) return ProfileState.INCOMPLETE;
    return ProfileState.DRAFT;
  }

  /**
   * Validate profile data for creation
   * @param {Object} data - Profile data
   */
  async validateForCreation(data) {
    // Email validation
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email is required');
    }

    // Password validation
    if (!data.password) {
      throw new Error('Password is required');
    }

    const passwordValidation = passwordService.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error('Password does not meet security requirements');
    }

    // Profile type validation
    if (!Object.values(ProfileType).includes(data.profileType)) {
      throw new Error('Invalid profile type');
    }
  }

  /**
   * Enrich profile data for creation
   * @param {Object} data - Profile data
   * @returns {Object} - Enriched data
   */
  async enrichEntityForCreation(data) {
    const enrichedData = await super.enrichEntityForCreation(data);

    return {
      ...enrichedData,
      profileCompletion: 0,
      profileState: ProfileState.DRAFT,
      isVerified: false,
      emailVerified: false
    };
  }

  /**
   * Post-creation processing
   * @param {Object} profile - Created profile
   * @param {Object} options - Options
   */
  async postCreationProcessing(profile, options) {
    // Create profile-specific extension based on profile type
    await this.createProfileExtension(profile);

    // Log profile creation event
    this.logger.info('Profile created', {
      profileId: profile.id,
      profileType: profile.profileType,
      email: profile.email
    });
  }

  /**
   * Create profile type-specific extension
   * @param {Object} profile - Main profile
   */
  async createProfileExtension(profile) {
    const prisma = require('../lib/prisma');

    switch (profile.profileType) {
      case ProfileType.INNOVATOR:
        await prisma.innovatorProfile.create({
          data: { userId: profile.id }
        });
        break;
      case ProfileType.BUSINESS_INVESTOR:
        await prisma.businessInvestorProfile.create({
          data: { userId: profile.id }
        });
        break;
      case ProfileType.MENTOR:
        await prisma.mentorProfile.create({
          data: { userId: profile.id }
        });
        break;
    }
  }

  /**
   * Email validation helper
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate innovator profile completion
   * @param {Object} innovatorProfile - Innovator profile data
   * @returns {number} - Completion percentage
   */
  calculateInnovatorCompletion(innovatorProfile) {
    if (!innovatorProfile) return 0;

    const requiredFields = [
      'industryFocus', 'innovationStage', 'startupName',
      'startupDescription', 'businessModel'
    ];

    const completedFields = requiredFields.filter(field =>
      innovatorProfile[field] && innovatorProfile[field].trim() !== ''
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Calculate investor profile completion
   * @param {Object} investorProfile - Investor profile data
   * @returns {number} - Completion percentage
   */
  calculateInvestorCompletion(investorProfile) {
    if (!investorProfile) return 0;

    const requiredFields = [
      'investmentFocus', 'investmentStage', 'investmentRange',
      'portfolioSize', 'investmentCriteria'
    ];

    const completedFields = requiredFields.filter(field =>
      investorProfile[field] && investorProfile[field].trim() !== ''
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }

  /**
   * Calculate mentor profile completion
   * @param {Object} mentorProfile - Mentor profile data
   * @returns {number} - Completion percentage
   */
  calculateMentorCompletion(mentorProfile) {
    if (!mentorProfile) return 0;

    const requiredFields = [
      'expertiseAreas', 'yearsOfExperience', 'mentorshipStyle',
      'availability', 'successStories'
    ];

    const completedFields = requiredFields.filter(field =>
      mentorProfile[field] && (
        typeof mentorProfile[field] === 'string' ?
        mentorProfile[field].trim() !== '' :
        mentorProfile[field] !== null
      )
    ).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  }
}

module.exports = new ProfileService();
```

---

## ✅ **Business Logic Implementation Summary**

### **Key Business Logic Features**
- **Service Layer Architecture**: Clean separation of business logic using ES6 classes
- **Profile Management**: Comprehensive profile creation, validation, and completion tracking
- **Business Rule Enforcement**: Automated validation and state management
- **Type-Specific Logic**: Specialized handling for different profile types
- **Event-Driven Processing**: Post-creation and update processing hooks

### **Business Logic Patterns**
- **Base Service Pattern**: Reusable service foundation with common CRUD operations
- **Validation Pipeline**: Multi-stage validation for data integrity
- **Completion Calculation**: Dynamic profile completion scoring
- **State Management**: Automated profile state transitions
- **Extension Pattern**: Profile type-specific data handling

### **Implementation Guidelines**
- Use service layer for all business logic implementation
- Implement comprehensive validation at service level
- Use Prisma transactions for data consistency
- Log all significant business events
- Maintain separation between business logic and data access
- Implement proper error handling and user feedback

The business logic implementation provides a robust foundation for the SmileFactory platform with comprehensive validation, state management, and extensible service patterns.
    
    protected final R repository;
    protected final ApplicationEventPublisher eventPublisher;
    
    public BaseService(R repository, ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }
    
    @Transactional(readOnly = true)
    public Optional<T> findById(String id) {
        return repository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Page<T> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }
    
    public T save(T entity) {
        T savedEntity = repository.save(entity);
        publishEntityEvent(savedEntity, EntityEventType.CREATED);
        return savedEntity;
    }
    
    public T update(T entity) {
        T updatedEntity = repository.save(entity);
        publishEntityEvent(updatedEntity, EntityEventType.UPDATED);
        return updatedEntity;
    }
    
    public void deleteById(String id) {
        T entity = findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Entity not found with id: " + id));
        repository.deleteById(id);
        publishEntityEvent(entity, EntityEventType.DELETED);
    }
    
    protected void publishEntityEvent(T entity, EntityEventType eventType) {
        EntityEvent<T> event = new EntityEvent<>(entity, eventType);
        eventPublisher.publishEvent(event);
    }
    
    protected abstract void validateBusinessRules(T entity);
    protected abstract void enrichEntity(T entity);
}
```

### **Profile Management Service**
```java
@Service
@Transactional
@Slf4j
public class ProfileService extends BaseService<PersonalDetails, PersonalDetailsRepository> {
    
    @Autowired
    private ProfileCompletionService profileCompletionService;
    
    @Autowired
    private ProfileValidationService profileValidationService;
    
    @Autowired
    private AIRecommendationService aiRecommendationService;
    
    @Autowired
    private NotificationService notificationService;
    
    public ProfileService(PersonalDetailsRepository repository, ApplicationEventPublisher eventPublisher) {
        super(repository, eventPublisher);
    }
    
    public PersonalDetails createProfile(CreateProfileRequest request) {
        log.info("Creating profile for email: {}", request.getEmail());
        
        // Validate business rules
        validateEmailUniqueness(request.getEmail());
        validateProfileTypeRequirements(request);
        
        // Create base profile
        PersonalDetails profile = PersonalDetails.builder()
            .email(request.getEmail())
            .passwordHash(passwordService.hashPassword(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .profileType(request.getProfileType())
            .profileState(ProfileState.DRAFT)
            .profileVisibility(ProfileVisibility.PUBLIC)
            .profileCompletion(0)
            .isVerified(false)
            .emailVerified(false)
            .build();
        
        // Enrich with initial data
        enrichEntity(profile);
        
        // Save profile
        PersonalDetails savedProfile = save(profile);
        
        // Create profile type-specific data
        createProfileTypeSpecificData(savedProfile);
        
        // Calculate initial completion
        updateProfileCompletion(savedProfile.getId());
        
        // Send welcome email
        notificationService.sendWelcomeEmail(savedProfile);
        
        // Generate AI recommendations
        aiRecommendationService.generateInitialRecommendations(savedProfile.getId());
        
        log.info("Profile created successfully for user: {}", savedProfile.getId());
        return savedProfile;
    }
    
    public PersonalDetails updateProfile(String userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);
        
        PersonalDetails profile = findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
        
        // Validate update permissions
        validateUpdatePermissions(profile, request);
        
        // Apply updates
        applyProfileUpdates(profile, request);
        
        // Validate business rules
        validateBusinessRules(profile);
        
        // Update profile
        PersonalDetails updatedProfile = update(profile);
        
        // Recalculate completion
        updateProfileCompletion(userId);
        
        // Update AI embeddings
        aiRecommendationService.updateUserEmbeddings(userId);
        
        log.info("Profile updated successfully for user: {}", userId);
        return updatedProfile;
    }
    
    @Override
    protected void validateBusinessRules(PersonalDetails profile) {
        profileValidationService.validateProfile(profile);
        
        // Profile type-specific validation
        switch (profile.getProfileType()) {
            case INNOVATOR:
                validateInnovatorProfile(profile);
                break;
            case BUSINESS_INVESTOR:
                validateInvestorProfile(profile);
                break;
            case MENTOR:
                validateMentorProfile(profile);
                break;
            // Add other profile types
        }
    }
    
    @Override
    protected void enrichEntity(PersonalDetails profile) {
        // Set default values
        if (profile.getRole() == null) {
            profile.setRole("USER");
        }
        
        // Generate profile name
        if (profile.getProfileName() == null && profile.getFirstName() != null && profile.getLastName() != null) {
            profile.setProfileName(profile.getFirstName() + " " + profile.getLastName());
        }
        
        // Set initial completion
        profile.setProfileCompletion(profileCompletionService.calculateCompletion(profile));
    }
    
    private void createProfileTypeSpecificData(PersonalDetails profile) {
        switch (profile.getProfileType()) {
            case INNOVATOR:
                createInnovatorProfile(profile);
                break;
            case BUSINESS_INVESTOR:
                createInvestorProfile(profile);
                break;
            case MENTOR:
                createMentorProfile(profile);
                break;
            // Add other profile types
        }
    }
    
    private void createInnovatorProfile(PersonalDetails user) {
        InnovatorProfile innovatorProfile = InnovatorProfile.builder()
            .user(user)
            .innovationStage("Idea")
            .teamSize(1)
            .build();
        
        innovatorProfileRepository.save(innovatorProfile);
        log.info("Created innovator profile for user: {}", user.getId());
    }
    
    public void updateProfileCompletion(String userId) {
        PersonalDetails profile = findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("Profile not found"));
        
        int completion = profileCompletionService.calculateCompletion(profile);
        int previousCompletion = profile.getProfileCompletion();
        
        profile.setProfileCompletion(completion);
        
        // Update profile state based on completion
        if (completion >= 60 && profile.getProfileState() == ProfileState.DRAFT) {
            profile.setProfileState(ProfileState.INCOMPLETE);
        } else if (completion >= 80 && profile.getProfileState() == ProfileState.INCOMPLETE) {
            profile.setProfileState(ProfileState.COMPLETE);
            
            // Trigger completion event
            eventPublisher.publishEvent(new ProfileCompletedEvent(profile));
        }
        
        repository.save(profile);
        
        // Send completion milestone notifications
        if (completion > previousCompletion && completion % 20 == 0) {
            notificationService.sendCompletionMilestoneNotification(profile, completion);
        }
    }
}
```

## 🎯 **Profile Type-Specific Business Logic**

### **Innovator Business Logic**
```java
@Service
@Transactional
@Slf4j
public class InnovatorBusinessService {
    
    @Autowired
    private InnovatorProfileRepository innovatorRepository;
    
    @Autowired
    private FundingOpportunityService fundingOpportunityService;
    
    @Autowired
    private TeamMatchingService teamMatchingService;
    
    public InnovatorProfile updateInnovatorProfile(String userId, UpdateInnovatorRequest request) {
        InnovatorProfile profile = innovatorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Innovator profile not found"));
        
        // Apply updates
        if (request.getIndustryFocus() != null) {
            profile.setIndustryFocus(request.getIndustryFocus());
        }
        
        if (request.getInnovationStage() != null) {
            validateInnovationStageTransition(profile.getInnovationStage(), request.getInnovationStage());
            profile.setInnovationStage(request.getInnovationStage());
        }
        
        if (request.getFundingAmountNeeded() != null) {
            validateFundingAmount(request.getFundingAmountNeeded());
            profile.setFundingAmountNeeded(request.getFundingAmountNeeded());
        }
        
        InnovatorProfile updatedProfile = innovatorRepository.save(profile);
        
        // Trigger business logic based on updates
        if (request.getFundingAmountNeeded() != null) {
            fundingOpportunityService.findMatchingOpportunities(userId);
        }
        
        if (request.getTeamSize() != null && request.getTeamSize() < 5) {
            teamMatchingService.suggestTeamMembers(userId);
        }
        
        return updatedProfile;
    }
    
    public List<FundingOpportunity> getFundingRecommendations(String userId) {
        InnovatorProfile profile = innovatorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Innovator profile not found"));
        
        return fundingOpportunityService.findRecommendations(
            profile.getIndustryFocus(),
            profile.getInnovationStage(),
            profile.getFundingAmountNeeded()
        );
    }
    
    public InnovationMetrics getInnovationMetrics(String userId) {
        InnovatorProfile profile = innovatorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Innovator profile not found"));
        
        return InnovationMetrics.builder()
            .profileViews(analyticsService.getProfileViews(userId))
            .investorInterest(investorInterestService.getInterestLevel(userId))
            .networkGrowth(connectionService.getNetworkGrowthRate(userId))
            .contentEngagement(contentService.getEngagementMetrics(userId))
            .fundingReadiness(assessFundingReadiness(profile))
            .build();
    }
    
    private void validateInnovationStageTransition(String currentStage, String newStage) {
        List<String> validTransitions = getValidStageTransitions(currentStage);
        if (!validTransitions.contains(newStage)) {
            throw new InvalidStageTransitionException(
                "Invalid stage transition from " + currentStage + " to " + newStage);
        }
    }
    
    private List<String> getValidStageTransitions(String currentStage) {
        Map<String, List<String>> transitions = Map.of(
            "Idea", Arrays.asList("Prototype", "MVP"),
            "Prototype", Arrays.asList("MVP", "Beta"),
            "MVP", Arrays.asList("Beta", "Scaling"),
            "Beta", Arrays.asList("Scaling", "Growth"),
            "Scaling", Arrays.asList("Growth", "Mature")
        );
        
        return transitions.getOrDefault(currentStage, Collections.emptyList());
    }
    
    private FundingReadiness assessFundingReadiness(InnovatorProfile profile) {
        int score = 0;
        
        // Business model clarity
        if (profile.getBusinessModel() != null && !profile.getBusinessModel().isEmpty()) {
            score += 20;
        }
        
        // Market validation
        if (profile.getTargetMarket() != null && !profile.getTargetMarket().isEmpty()) {
            score += 20;
        }
        
        // Competitive advantage
        if (profile.getCompetitiveAdvantage() != null && !profile.getCompetitiveAdvantage().isEmpty()) {
            score += 20;
        }
        
        // Team size
        if (profile.getTeamSize() != null && profile.getTeamSize() >= 2) {
            score += 20;
        }
        
        // Innovation stage
        if (Arrays.asList("MVP", "Beta", "Scaling").contains(profile.getInnovationStage())) {
            score += 20;
        }
        
        return FundingReadiness.fromScore(score);
    }
}
```

### **Business Investor Logic**
```java
@Service
@Transactional
@Slf4j
public class BusinessInvestorService {
    
    @Autowired
    private BusinessInvestorProfileRepository investorRepository;
    
    @Autowired
    private InvestmentMatchingService matchingService;
    
    @Autowired
    private DueDiligenceService dueDiligenceService;
    
    public List<InvestmentOpportunity> getMatchingOpportunities(String userId) {
        BusinessInvestorProfile investor = investorRepository.findByUserId(userId)
            .orElseThrow(() -> new EntityNotFoundException("Investor profile not found"));
        
        InvestmentCriteria criteria = InvestmentCriteria.builder()
            .investmentFocus(investor.getInvestmentFocus())
            .stagePreference(investor.getInvestmentStagePreference())
            .ticketSizeMin(investor.getTicketSizeMin())
            .ticketSizeMax(investor.getTicketSizeMax())
            .geographicFocus(investor.getGeographicFocus())
            .build();
        
        return matchingService.findMatchingOpportunities(criteria);
    }
    
    public InvestmentDecision evaluateInvestmentOpportunity(String investorId, String innovatorId) {
        BusinessInvestorProfile investor = investorRepository.findByUserId(investorId)
            .orElseThrow(() -> new EntityNotFoundException("Investor profile not found"));
        
        InnovatorProfile innovator = innovatorRepository.findByUserId(innovatorId)
            .orElseThrow(() -> new EntityNotFoundException("Innovator profile not found"));
        
        // Perform automated due diligence
        DueDiligenceReport report = dueDiligenceService.generateReport(innovator);
        
        // Calculate investment score
        int investmentScore = calculateInvestmentScore(investor, innovator, report);
        
        return InvestmentDecision.builder()
            .investorId(investorId)
            .innovatorId(innovatorId)
            .score(investmentScore)
            .recommendation(getRecommendation(investmentScore))
            .dueDiligenceReport(report)
            .riskFactors(identifyRiskFactors(innovator))
            .opportunities(identifyOpportunities(innovator))
            .build();
    }
    
    private int calculateInvestmentScore(BusinessInvestorProfile investor, 
                                       InnovatorProfile innovator, 
                                       DueDiligenceReport report) {
        int score = 0;
        
        // Industry alignment
        if (investor.getInvestmentFocus().contains(innovator.getIndustryFocus())) {
            score += 25;
        }
        
        // Stage alignment
        if (investor.getInvestmentStagePreference().contains(innovator.getInnovationStage())) {
            score += 25;
        }
        
        // Funding amount fit
        BigDecimal fundingNeeded = innovator.getFundingAmountNeeded();
        if (fundingNeeded != null && 
            fundingNeeded.compareTo(investor.getTicketSizeMin()) >= 0 &&
            fundingNeeded.compareTo(investor.getTicketSizeMax()) <= 0) {
            score += 25;
        }
        
        // Due diligence score
        score += (report.getOverallScore() / 4); // Scale to 25 points
        
        return Math.min(score, 100);
    }
}
```

## 🤖 **AI Integration Services**

### **AI Recommendation Service**
```java
@Service
@Slf4j
public class AIRecommendationService {
    
    @Autowired
    private OpenAIService openAIService;
    
    @Autowired
    private UserEmbeddingService embeddingService;
    
    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Async
    public CompletableFuture<Void> generateInitialRecommendations(String userId) {
        try {
            PersonalDetails user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
            
            // Generate user embeddings
            embeddingService.generateUserEmbeddings(userId);
            
            // Generate profile-specific recommendations
            List<Recommendation> recommendations = generateProfileRecommendations(user);
            
            // Save recommendations
            recommendationRepository.saveAll(recommendations);
            
            log.info("Generated {} initial recommendations for user: {}", recommendations.size(), userId);
            
        } catch (Exception e) {
            log.error("Failed to generate initial recommendations for user: {}", userId, e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    public List<Recommendation> getPersonalizedRecommendations(String userId, RecommendationType type) {
        PersonalDetails user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        switch (type) {
            case CONNECTIONS:
                return generateConnectionRecommendations(user);
            case CONTENT:
                return generateContentRecommendations(user);
            case OPPORTUNITIES:
                return generateOpportunityRecommendations(user);
            case LEARNING:
                return generateLearningRecommendations(user);
            default:
                return Collections.emptyList();
        }
    }
    
    private List<Recommendation> generateConnectionRecommendations(PersonalDetails user) {
        // Get user embedding
        UserEmbedding userEmbedding = embeddingService.getUserEmbedding(user.getId());
        
        // Find similar users
        List<UserEmbedding> similarUsers = embeddingService.findSimilarUsers(
            userEmbedding.getProfileEmbedding(), 10);
        
        return similarUsers.stream()
            .filter(similar -> !similar.getUserId().equals(user.getId()))
            .filter(similar -> !connectionService.areConnected(user.getId(), similar.getUserId()))
            .map(similar -> createConnectionRecommendation(user.getId(), similar.getUserId()))
            .collect(Collectors.toList());
    }
    
    private List<Recommendation> generateContentRecommendations(PersonalDetails user) {
        // Get user interests and activity
        UserInterests interests = userInterestService.getUserInterests(user.getId());
        
        // Find relevant content
        List<Post> relevantPosts = contentService.findRelevantContent(
            interests.getTopics(),
            user.getProfileType(),
            20
        );
        
        return relevantPosts.stream()
            .map(post -> createContentRecommendation(user.getId(), post.getId()))
            .collect(Collectors.toList());
    }
    
    @Async
    public CompletableFuture<Void> updateUserEmbeddings(String userId) {
        try {
            embeddingService.updateUserEmbeddings(userId);
            
            // Refresh recommendations based on updated embeddings
            refreshRecommendations(userId);
            
        } catch (Exception e) {
            log.error("Failed to update user embeddings for user: {}", userId, e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    private void refreshRecommendations(String userId) {
        // Remove old recommendations
        recommendationRepository.deleteByUserIdAndCreatedAtBefore(
            userId, LocalDateTime.now().minusDays(7));
        
        // Generate new recommendations
        generateInitialRecommendations(userId);
    }
}
```

## 📊 **Business Rule Enforcement**

### **Business Rule Engine**
```java
@Service
@Slf4j
public class BusinessRuleEngine {
    
    private final Map<String, BusinessRule> rules = new HashMap<>();
    
    @PostConstruct
    public void initializeRules() {
        // Profile completion rules
        registerRule("profile.completion.minimum", new MinimumProfileCompletionRule());
        registerRule("profile.verification.required", new ProfileVerificationRule());
        
        // Content creation rules
        registerRule("content.creation.limits", new ContentCreationLimitsRule());
        registerRule("content.moderation.required", new ContentModerationRule());
        
        // Connection rules
        registerRule("connection.limits.daily", new DailyConnectionLimitsRule());
        registerRule("connection.spam.prevention", new ConnectionSpamPreventionRule());
        
        // Investment rules
        registerRule("investment.eligibility", new InvestmentEligibilityRule());
        registerRule("investment.amount.validation", new InvestmentAmountValidationRule());
    }
    
    public void registerRule(String ruleId, BusinessRule rule) {
        rules.put(ruleId, rule);
        log.info("Registered business rule: {}", ruleId);
    }
    
    public BusinessRuleResult validateRule(String ruleId, BusinessRuleContext context) {
        BusinessRule rule = rules.get(ruleId);
        if (rule == null) {
            throw new BusinessRuleNotFoundException("Rule not found: " + ruleId);
        }
        
        return rule.validate(context);
    }
    
    public List<BusinessRuleResult> validateAllRules(BusinessRuleContext context, String category) {
        return rules.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(category))
            .map(entry -> entry.getValue().validate(context))
            .collect(Collectors.toList());
    }
    
    public void enforceRule(String ruleId, BusinessRuleContext context) {
        BusinessRuleResult result = validateRule(ruleId, context);
        
        if (!result.isValid()) {
            throw new BusinessRuleViolationException(
                "Business rule violation: " + ruleId + " - " + result.getMessage());
        }
    }
}

// Example business rule implementation
@Component
public class MinimumProfileCompletionRule implements BusinessRule {
    
    @Override
    public BusinessRuleResult validate(BusinessRuleContext context) {
        PersonalDetails user = (PersonalDetails) context.get("user");
        String action = (String) context.get("action");
        
        int requiredCompletion = getRequiredCompletion(action);
        
        if (user.getProfileCompletion() < requiredCompletion) {
            return BusinessRuleResult.invalid(
                String.format("Profile completion must be at least %d%% to perform this action", 
                    requiredCompletion));
        }
        
        return BusinessRuleResult.valid();
    }
    
    private int getRequiredCompletion(String action) {
        Map<String, Integer> requirements = Map.of(
            "create_post", 30,
            "send_connection", 50,
            "create_event", 70,
            "access_marketplace", 60
        );
        
        return requirements.getOrDefault(action, 0);
    }
}
```

## 📧 **Email Service Integration (MailChimp)**

### **Email Service Implementation**
```typescript
// Email service using MailChimp
@Injectable()
export class EmailService {
  private mailchimpClient: MailchimpTransactional.ApiClient;
  private audienceId: string;

  constructor(
    @Inject('MAILCHIMP_CONFIG') private config: MailChimpConfig,
    private logger: Logger
  ) {
    this.mailchimpClient = new MailchimpTransactional.ApiClient();
    this.mailchimpClient.setApiKey(config.apiKey);
    this.audienceId = config.audienceId;
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const template = {
      templateId: 'welcome_email',
      subject: 'Welcome to SmileFactory Platform!',
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      mergeVars: {
        firstName: user.firstName,
        userType: user.userType,
        profileUrl: `${this.config.baseUrl}/profile/${user.id}`
      },
      tags: ['welcome', 'onboarding'],
      trackOpens: true,
      trackClicks: true
    };

    await this.sendTransactionalEmail(template, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const template = {
      templateId: 'password_reset',
      subject: 'Reset Your SmileFactory Password',
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      mergeVars: {
        firstName: user.firstName,
        resetUrl: `${this.config.baseUrl}/reset-password?token=${resetToken}`,
        expiryTime: '24 hours'
      },
      tags: ['password-reset', 'security'],
      trackOpens: true,
      trackClicks: true
    };

    await this.sendTransactionalEmail(template, {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });
  }

  async subscribeToNewsletter(user: User): Promise<void> {
    try {
      const memberData = {
        email_address: user.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: user.firstName,
          LNAME: user.lastName,
          USERTYPE: user.userType,
          LOCATION: user.location
        },
        tags: ['newsletter', user.userType.toLowerCase()]
      };

      await this.mailchimpClient.lists.addListMember(
        this.audienceId,
        memberData
      );

      this.logger.info('User subscribed to newsletter', {
        userId: user.id,
        email: user.email
      });
    } catch (error) {
      this.logger.error('Failed to subscribe user to newsletter', {
        userId: user.id,
        error: error.message
      });
      throw new EmailServiceError('Newsletter subscription failed');
    }
  }

  private async sendTransactionalEmail(
    template: EmailTemplate,
    recipient: EmailRecipient
  ): Promise<void> {
    try {
      const message = {
        template_name: template.templateId,
        template_content: [],
        message: {
          to: [{ email: recipient.email, name: recipient.name }],
          subject: template.subject,
          from_email: template.fromEmail,
          from_name: template.fromName,
          merge_vars: [{
            rcpt: recipient.email,
            vars: Object.entries(template.mergeVars).map(([name, content]) => ({
              name,
              content
            }))
          }],
          tags: template.tags,
          track_opens: template.trackOpens,
          track_clicks: template.trackClicks
        }
      };

      const result = await this.mailchimpClient.messages.sendTemplate(message);

      this.logger.info('Transactional email sent', {
        templateId: template.templateId,
        recipient: recipient.email,
        messageId: result[0]?.id
      });
    } catch (error) {
      this.logger.error('Failed to send transactional email', {
        templateId: template.templateId,
        recipient: recipient.email,
        error: error.message
      });
      throw new EmailServiceError('Email sending failed');
    }
  }
}
```

### **Email Queue Service**
```typescript
// Email queue for reliable delivery
@Injectable()
export class EmailQueueService {
  private emailQueue: Queue;

  constructor(
    private emailService: EmailService,
    private logger: Logger
  ) {
    this.emailQueue = new Queue('email-queue', {
      redis: { host: process.env.REDIS_HOST, port: 6379 },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: 'exponential'
      }
    });

    this.setupQueueProcessors();
  }

  async queueWelcomeEmail(user: User): Promise<void> {
    await this.emailQueue.add('welcome-email', { user }, {
      priority: 10, // High priority for welcome emails
      delay: 0 // Send immediately
    });
  }

  async queuePasswordResetEmail(user: User, resetToken: string): Promise<void> {
    await this.emailQueue.add('password-reset', { user, resetToken }, {
      priority: 20, // Highest priority for security emails
      delay: 0
    });
  }

  private setupQueueProcessors(): void {
    this.emailQueue.process('welcome-email', async (job) => {
      const { user } = job.data;
      await this.emailService.sendWelcomeEmail(user);
    });

    this.emailQueue.process('password-reset', async (job) => {
      const { user, resetToken } = job.data;
      await this.emailService.sendPasswordResetEmail(user, resetToken);
    });
  }
}
```

---

## 📚 **Reference Documents**

**Core API Development**: See `/4_backend_implementation/1_core_api_development.md`
**Database Implementation**: See `/4_backend_implementation/2_database_implementation.md`
**Authentication Security**: See `/4_backend_implementation/3_authentication_and_security.md`
**API Testing**: See `/4_backend_implementation/5_api_testing_and_validation.md`

*This business logic implementation provides comprehensive service layer architecture and business rule enforcement for the SmileFactory Platform.*
