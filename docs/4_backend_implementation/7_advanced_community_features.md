# 7. Advanced Community Features

## 🌐 **Advanced Community Features Overview**

This document outlines the implementation of advanced community features for the ZbInnovation platform using Node.js/Express.js, including Groups management, Events system, Marketplace functionality, and enhanced social interactions that were missing from the core implementation.

## 👥 **Groups Management System**

### **Groups Service Implementation (Node.js)**

**Node.js Groups Service**: Comprehensive group management with membership handling and activity tracking.

```javascript
// services/groupsService.js
const BaseService = require('./baseService');
const winston = require('winston');

class GroupsService extends BaseService {
  constructor() {
    super('group');
    this.membershipService = require('./membershipService');
    this.notificationService = require('./notificationService');
  }

  /**
   * Create new group with validation
   * @param {Object} groupData - Group creation data
   * @param {string} creatorId - Creator user ID
   * @returns {Promise<Object>} - Created group
   */
  async createGroup(groupData, creatorId) {
    try {
      // Validate group data
      await this.validateGroupCreation(groupData, creatorId);

      // Create group
      const group = await this.create({
        ...groupData,
        creatorId,
        memberCount: 1,
        isActive: true
      });

      // Add creator as admin member
      await this.membershipService.addMember(group.id, creatorId, 'ADMIN');

      this.logger.info('Group created', {
        groupId: group.id,
        creatorId,
        groupName: group.name
      });

      return group;
    } catch (error) {
      this.logger.error('Group creation failed', {
        error: error.message,
        creatorId,
        groupData
      });
      throw error;
    }
  }

  /**
   * Join group with approval workflow
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Membership result
   */
  async joinGroup(groupId, userId) {
    const prisma = require('../lib/prisma');

    try {
      const group = await this.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is already a member
      const existingMembership = await prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (existingMembership) {
        throw new Error('User is already a member of this group');
      }

      let membershipStatus = 'ACTIVE';

      // Check if group requires approval
      if (group.requiresApproval) {
        membershipStatus = 'PENDING';

        // Notify group admins
        await this.notifyGroupAdmins(groupId, 'join_request', {
          userId,
          groupName: group.name
        });
      }

      // Create membership
      const membership = await prisma.groupMembership.create({
        data: {
          groupId,
          userId,
          role: 'MEMBER',
          status: membershipStatus,
          joinedAt: new Date()
        }
      });

      // Update member count if approved
      if (membershipStatus === 'ACTIVE') {
        await this.updateMemberCount(groupId, 1);
      }

      return membership;
    } catch (error) {
      this.logger.error('Group join failed', {
        error: error.message,
        groupId,
        userId
      });
      throw error;
    }
  }

  /**
   * Get groups with filtering and pagination
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Paginated groups
   */
  async searchGroups(filters = {}, pagination = {}) {
    const prisma = require('../lib/prisma');
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      visibility: 'PUBLIC'
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { memberCount: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileType: true
            }
          },
          _count: {
            select: {
              memberships: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user's groups
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's groups
   */
  async getUserGroups(userId) {
    const prisma = require('../lib/prisma');

    return await prisma.group.findMany({
      where: {
        memberships: {
          some: {
            userId,
            status: 'ACTIVE'
          }
        }
      },
      include: {
        memberships: {
          where: { userId },
          select: {
            role: true,
            joinedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update member count
   * @param {string} groupId - Group ID
   * @param {number} increment - Count increment (+1 or -1)
   */
  async updateMemberCount(groupId, increment) {
    const prisma = require('../lib/prisma');

    await prisma.group.update({
      where: { id: groupId },
      data: {
        memberCount: {
          increment
        }
      }
    });
  }

  /**
   * Notify group admins
   * @param {string} groupId - Group ID
   * @param {string} type - Notification type
   * @param {Object} data - Notification data
   */
  async notifyGroupAdmins(groupId, type, data) {
    const prisma = require('../lib/prisma');

    const admins = await prisma.groupMembership.findMany({
      where: {
        groupId,
        role: { in: ['ADMIN', 'MODERATOR'] },
        status: 'ACTIVE'
      },
      select: { userId: true }
    });

    for (const admin of admins) {
      await this.notificationService.createNotification({
        userId: admin.userId,
        type,
        data,
        groupId
      });
    }
  }

  /**
   * Validate group creation data
   * @param {Object} groupData - Group data
   * @param {string} creatorId - Creator ID
   */
  async validateGroupCreation(groupData, creatorId) {
    if (!groupData.name || groupData.name.trim().length < 3) {
      throw new Error('Group name must be at least 3 characters long');
    }

    if (!groupData.category) {
      throw new Error('Group category is required');
    }

    // Check if user has reached group creation limit
    const userGroupCount = await this.getUserCreatedGroupsCount(creatorId);
    const maxGroups = 10; // Configurable limit

    if (userGroupCount >= maxGroups) {
      throw new Error(`Maximum group creation limit (${maxGroups}) reached`);
    }
  }

  /**
   * Get count of groups created by user
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Group count
   */
  async getUserCreatedGroupsCount(userId) {
    const prisma = require('../lib/prisma');

    return await prisma.group.count({
      where: {
        creatorId: userId,
        isActive: true
      }
    });
  }
}

module.exports = new GroupsService();
## 📅 **Events Management System**

### **Events Service Implementation (Node.js)**

**Node.js Events Service**: Comprehensive event management with RSVP handling and calendar integration.

```javascript
// services/eventsService.js
const BaseService = require('./baseService');
const moment = require('moment');

class EventsService extends BaseService {
  constructor() {
    super('event');
    this.notificationService = require('./notificationService');
    this.calendarService = require('./calendarService');
  }

  /**
   * Create new event
   * @param {Object} eventData - Event creation data
   * @param {string} organizerId - Organizer user ID
   * @returns {Promise<Object>} - Created event
   */
  async createEvent(eventData, organizerId) {
    try {
      // Validate event data
      await this.validateEventCreation(eventData);

      const event = await this.create({
        ...eventData,
        organizerId,
        attendeeCount: 0,
        status: 'ACTIVE'
      });

      // Create organizer RSVP
      await this.rsvpToEvent(event.id, organizerId, 'ATTENDING');

      this.logger.info('Event created', {
        eventId: event.id,
        organizerId,
        eventTitle: event.title
      });

      return event;
    } catch (error) {
      this.logger.error('Event creation failed', {
        error: error.message,
        organizerId,
        eventData
      });
      throw error;
    }
  }

  /**
   * RSVP to event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @param {string} status - RSVP status (ATTENDING, NOT_ATTENDING, MAYBE)
   * @returns {Promise<Object>} - RSVP record
   */
  async rsvpToEvent(eventId, userId, status) {
    const prisma = require('../lib/prisma');

    try {
      const event = await this.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check event capacity
      if (status === 'ATTENDING' && event.maxAttendees) {
        const currentAttendees = await this.getAttendeeCount(eventId);
        if (currentAttendees >= event.maxAttendees) {
          throw new Error('Event is at full capacity');
        }
      }

      // Upsert RSVP
      const rsvp = await prisma.eventRSVP.upsert({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        },
        update: {
          status,
          updatedAt: new Date()
        },
        create: {
          eventId,
          userId,
          status,
          createdAt: new Date()
        }
      });

      // Update attendee count
      await this.updateAttendeeCount(eventId);

      // Add to user's calendar if attending
      if (status === 'ATTENDING') {
        await this.calendarService.addEventToCalendar(userId, event);
      }

      return rsvp;
    } catch (error) {
      this.logger.error('RSVP failed', {
        error: error.message,
        eventId,
        userId,
        status
      });
      throw error;
    }
  }

  /**
   * Search events with filters
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Paginated events
   */
  async searchEvents(filters = {}, pagination = {}) {
    const prisma = require('../lib/prisma');
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      status: 'ACTIVE',
      startDate: {
        gte: filters.startDate || new Date()
      }
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileType: true
            }
          }
        }
      }),
      prisma.event.count({ where })
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user's events (organized and attending)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's events
   */
  async getUserEvents(userId) {
    const prisma = require('../lib/prisma');

    const [organizedEvents, attendingEvents] = await Promise.all([
      // Events organized by user
      prisma.event.findMany({
        where: {
          organizerId: userId,
          status: 'ACTIVE'
        },
        orderBy: { startDate: 'asc' }
      }),
      // Events user is attending
      prisma.event.findMany({
        where: {
          rsvps: {
            some: {
              userId,
              status: 'ATTENDING'
            }
          },
          status: 'ACTIVE'
        },
        orderBy: { startDate: 'asc' }
      })
    ]);

    return {
      organized: organizedEvents,
      attending: attendingEvents
    };
  }

  /**
   * Update attendee count for event
   * @param {string} eventId - Event ID
   */
  async updateAttendeeCount(eventId) {
    const prisma = require('../lib/prisma');

    const attendeeCount = await prisma.eventRSVP.count({
      where: {
        eventId,
        status: 'ATTENDING'
      }
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { attendeeCount }
    });
  }

  /**
   * Get current attendee count
   * @param {string} eventId - Event ID
   * @returns {Promise<number>} - Attendee count
   */
  async getAttendeeCount(eventId) {
    const prisma = require('../lib/prisma');

    return await prisma.eventRSVP.count({
      where: {
        eventId,
        status: 'ATTENDING'
      }
    });
  }

  /**
   * Validate event creation data
   * @param {Object} eventData - Event data
   */
  async validateEventCreation(eventData) {
    if (!eventData.title || eventData.title.trim().length < 3) {
      throw new Error('Event title must be at least 3 characters long');
    }

    if (!eventData.startDate) {
      throw new Error('Event start date is required');
    }

    const startDate = new Date(eventData.startDate);
    if (startDate <= new Date()) {
      throw new Error('Event start date must be in the future');
    }

    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate);
      if (endDate <= startDate) {
        throw new Error('Event end date must be after start date');
      }
    }

    if (eventData.maxAttendees && eventData.maxAttendees < 1) {
      throw new Error('Maximum attendees must be at least 1');
    }
  }
}

module.exports = new EventsService();
```

## 🛒 **Marketplace System**

### **Marketplace Service Implementation (Node.js)**

**Node.js Marketplace Service**: Comprehensive marketplace for services, products, and opportunities.

```javascript
// services/marketplaceService.js
const BaseService = require('./baseService');

class MarketplaceService extends BaseService {
  constructor() {
    super('marketplaceListing');
    this.paymentService = require('./paymentService');
    this.notificationService = require('./notificationService');
  }

  /**
   * Create marketplace listing
   * @param {Object} listingData - Listing data
   * @param {string} sellerId - Seller user ID
   * @returns {Promise<Object>} - Created listing
   */
  async createListing(listingData, sellerId) {
    try {
      await this.validateListingCreation(listingData);

      const listing = await this.create({
        ...listingData,
        sellerId,
        status: 'ACTIVE',
        views: 0,
        inquiries: 0
      });

      this.logger.info('Marketplace listing created', {
        listingId: listing.id,
        sellerId,
        title: listing.title
      });

      return listing;
    } catch (error) {
      this.logger.error('Listing creation failed', {
        error: error.message,
        sellerId,
        listingData
      });
      throw error;
    }
  }

  /**
   * Search marketplace listings
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Paginated listings
   */
  async searchListings(filters = {}, pagination = {}) {
    const prisma = require('../lib/prisma');
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where = {
      status: 'ACTIVE'
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.listingType) {
      where.listingType = filters.listingType;
    }

    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange.min || 0,
        lte: filters.priceRange.max || 999999
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } }
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileType: true,
              isVerified: true
            }
          }
        }
      }),
      prisma.marketplaceListing.count({ where })
    ]);

    return {
      data: listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Create inquiry for listing
   * @param {string} listingId - Listing ID
   * @param {string} buyerId - Buyer user ID
   * @param {string} message - Inquiry message
   * @returns {Promise<Object>} - Created inquiry
   */
  async createInquiry(listingId, buyerId, message) {
    const prisma = require('../lib/prisma');

    try {
      const listing = await this.findById(listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      if (listing.sellerId === buyerId) {
        throw new Error('Cannot inquire about your own listing');
      }

      const inquiry = await prisma.marketplaceInquiry.create({
        data: {
          listingId,
          buyerId,
          message,
          status: 'PENDING'
        }
      });

      // Update inquiry count
      await prisma.marketplaceListing.update({
        where: { id: listingId },
        data: {
          inquiries: {
            increment: 1
          }
        }
      });

      // Notify seller
      await this.notificationService.createNotification({
        userId: listing.sellerId,
        type: 'marketplace_inquiry',
        data: {
          listingTitle: listing.title,
          buyerId,
          inquiryId: inquiry.id
        }
      });

      return inquiry;
    } catch (error) {
      this.logger.error('Inquiry creation failed', {
        error: error.message,
        listingId,
        buyerId
      });
      throw error;
    }
  }

  /**
   * Validate listing creation
   * @param {Object} listingData - Listing data
   */
  async validateListingCreation(listingData) {
    if (!listingData.title || listingData.title.trim().length < 5) {
      throw new Error('Listing title must be at least 5 characters long');
    }

    if (!listingData.description || listingData.description.trim().length < 20) {
      throw new Error('Listing description must be at least 20 characters long');
    }

    if (!listingData.category) {
      throw new Error('Listing category is required');
    }

    if (!listingData.listingType) {
      throw new Error('Listing type is required');
    }

    if (listingData.price && listingData.price < 0) {
      throw new Error('Price cannot be negative');
    }
  }
}

module.exports = new MarketplaceService();
```

---

## ✅ **Advanced Community Features Summary**

### **Key Community Features Implemented**
- **Groups Management**: Comprehensive group creation, membership, and administration
- **Events System**: Event creation, RSVP management, and calendar integration
- **Marketplace**: Service and product listings with inquiry management
- **Social Interactions**: Enhanced community engagement features

### **Community Service Architecture**
- **Service Layer Pattern**: Consistent service architecture across all community features
- **Notification Integration**: Real-time notifications for community activities
- **Validation Pipeline**: Comprehensive data validation for all community content
- **Permission Management**: Role-based access control for community features
- **Activity Tracking**: Comprehensive logging and analytics for community engagement

### **Implementation Guidelines**
- Use consistent service patterns across all community features
- Implement proper validation and permission checks
- Provide real-time notifications for community activities
- Track user engagement and community metrics
- Ensure scalable architecture for growing communities
- Implement proper content moderation capabilities
- Maintain data consistency across related community features

The advanced community features provide a comprehensive social platform for SmileFactory users with robust group management, event coordination, and marketplace functionality.
    
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private GroupMembershipRepository membershipRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private ActivityService activityService;
    
    public Group createGroup(CreateGroupRequest request, String creatorId) {
        // Validate group creation permissions
        validateGroupCreationPermissions(creatorId);
        
        Group group = Group.builder()
            .name(request.getName())
            .description(request.getDescription())
            .category(request.getCategory())
            .visibility(request.getVisibility())
            .membershipType(request.getMembershipType())
            .maxMembers(request.getMaxMembers())
            .createdBy(creatorId)
            .status(GroupStatus.ACTIVE)
            .memberCount(1)
            .build();
        
        group = groupRepository.save(group);
        
        // Add creator as admin member
        GroupMembership membership = GroupMembership.builder()
            .groupId(group.getId())
            .userId(creatorId)
            .role(GroupRole.ADMIN)
            .status(MembershipStatus.ACTIVE)
            .joinedAt(LocalDateTime.now())
            .build();
        
        membershipRepository.save(membership);
        
        // Log activity
        activityService.logActivity(creatorId, ActivityType.GROUP_CREATED, 
            Map.of("groupId", group.getId(), "groupName", group.getName()));
        
        log.info("Group created: {} by user {}", group.getId(), creatorId);
        return group;
    }
    
    public GroupMembership joinGroup(String groupId, String userId, String inviteCode) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new GroupNotFoundException("Group not found: " + groupId));
        
        // Validate join permissions
        validateJoinPermissions(group, userId, inviteCode);
        
        // Check if already a member
        Optional<GroupMembership> existingMembership = 
            membershipRepository.findByGroupIdAndUserId(groupId, userId);
        
        if (existingMembership.isPresent()) {
            if (existingMembership.get().getStatus() == MembershipStatus.ACTIVE) {
                throw new AlreadyMemberException("User is already a member of this group");
            } else {
                // Reactivate membership
                existingMembership.get().setStatus(MembershipStatus.ACTIVE);
                existingMembership.get().setJoinedAt(LocalDateTime.now());
                return membershipRepository.save(existingMembership.get());
            }
        }
        
        // Create new membership
        GroupMembership membership = GroupMembership.builder()
            .groupId(groupId)
            .userId(userId)
            .role(GroupRole.MEMBER)
            .status(group.getMembershipType() == MembershipType.APPROVAL_REQUIRED ? 
                MembershipStatus.PENDING : MembershipStatus.ACTIVE)
            .joinedAt(LocalDateTime.now())
            .build();
        
        membership = membershipRepository.save(membership);
        
        // Update group member count if approved
        if (membership.getStatus() == MembershipStatus.ACTIVE) {
            groupRepository.incrementMemberCount(groupId);
        }
        
        // Notify group admins if approval required
        if (membership.getStatus() == MembershipStatus.PENDING) {
            notifyGroupAdmins(group, userId, "join_request");
        } else {
            // Notify group members of new member
            notifyGroupMembers(group, userId, "member_joined");
        }
        
        // Log activity
        activityService.logActivity(userId, ActivityType.GROUP_JOINED, 
            Map.of("groupId", groupId, "groupName", group.getName()));
        
        return membership;
    }
    
    public Page<Group> searchGroups(GroupSearchRequest request, Pageable pageable) {
        return groupRepository.searchGroups(
            request.getQuery(),
            request.getCategory(),
            request.getVisibility(),
            request.getLocation(),
            pageable
        );
    }
    
    public List<Group> getRecommendedGroups(String userId, int limit) {
        // Get user's interests and connections for recommendations
        User user = userService.findById(userId);
        List<String> userInterests = profileService.getUserInterests(userId);
        List<String> connectionIds = connectionService.getConnectionIds(userId);
        
        return groupRepository.findRecommendedGroups(
            userId, userInterests, connectionIds, user.getProfileType(), limit);
    }
    
    private void validateGroupCreationPermissions(String userId) {
        // Check if user can create groups (e.g., profile completion, account status)
        User user = userService.findById(userId);
        if (user.getProfileCompletion() < 50) {
            throw new InsufficientPermissionsException(
                "Profile must be at least 50% complete to create groups");
        }
        
        // Check group creation limits
        long userGroupCount = groupRepository.countByCreatedBy(userId);
        if (userGroupCount >= 5) { // Max 5 groups per user
            throw new GroupLimitExceededException("Maximum group creation limit reached");
        }
    }
    
    private void validateJoinPermissions(Group group, String userId, String inviteCode) {
        if (group.getStatus() != GroupStatus.ACTIVE) {
            throw new GroupNotActiveException("Group is not active");
        }
        
        if (group.getMemberCount() >= group.getMaxMembers()) {
            throw new GroupFullException("Group has reached maximum member capacity");
        }
        
        if (group.getVisibility() == GroupVisibility.PRIVATE && 
            (inviteCode == null || !group.getInviteCode().equals(inviteCode))) {
            throw new InvalidInviteCodeException("Valid invite code required for private group");
        }
    }
}
```

### **Groups Database Schema**
```sql
-- Groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'hidden')),
    membership_type VARCHAR(50) DEFAULT 'open' CHECK (membership_type IN ('open', 'approval_required', 'invite_only')),
    max_members INTEGER DEFAULT 1000,
    member_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    invite_code VARCHAR(50) UNIQUE,
    cover_image_url TEXT,
    tags TEXT[],
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Group memberships
CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned', 'left')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES users(id),
    UNIQUE(group_id, user_id)
);

-- Group posts and discussions
CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500),
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'announcement', 'poll', 'event')),
    pinned BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for groups
CREATE INDEX idx_groups_category ON groups(category);
CREATE INDEX idx_groups_visibility ON groups(visibility);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_status ON groups(status);

CREATE INDEX idx_group_memberships_group_user ON group_memberships(group_id, user_id);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_status ON group_memberships(status);

CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX idx_group_posts_author_id ON group_posts(author_id);
CREATE INDEX idx_group_posts_created_at ON group_posts(created_at);
```

## 📅 **Events Management System**

### **Events Service Implementation**
```java
// Backend: EventsService.java
@Service
@Slf4j
@Transactional
public class EventsService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private EventAttendeeRepository attendeeRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private CalendarService calendarService;
    
    public Event createEvent(CreateEventRequest request, String organizerId) {
        validateEventCreationPermissions(organizerId);
        
        Event event = Event.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .eventType(request.getEventType())
            .startDateTime(request.getStartDateTime())
            .endDateTime(request.getEndDateTime())
            .timezone(request.getTimezone())
            .location(request.getLocation())
            .virtualMeetingUrl(request.getVirtualMeetingUrl())
            .maxAttendees(request.getMaxAttendees())
            .registrationRequired(request.isRegistrationRequired())
            .registrationDeadline(request.getRegistrationDeadline())
            .organizerId(organizerId)
            .status(EventStatus.PUBLISHED)
            .visibility(request.getVisibility())
            .tags(request.getTags())
            .build();
        
        event = eventRepository.save(event);
        
        // Auto-register organizer
        EventAttendee organizerAttendee = EventAttendee.builder()
            .eventId(event.getId())
            .userId(organizerId)
            .status(AttendeeStatus.CONFIRMED)
            .role(AttendeeRole.ORGANIZER)
            .registeredAt(LocalDateTime.now())
            .build();
        
        attendeeRepository.save(organizerAttendee);
        
        // Send notifications to relevant users
        notifyRelevantUsers(event);
        
        log.info("Event created: {} by user {}", event.getId(), organizerId);
        return event;
    }
    
    public EventAttendee rsvpToEvent(String eventId, String userId, RSVPRequest request) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException("Event not found: " + eventId));
        
        validateRSVPPermissions(event, userId);
        
        Optional<EventAttendee> existingRSVP = 
            attendeeRepository.findByEventIdAndUserId(eventId, userId);
        
        EventAttendee attendee;
        if (existingRSVP.isPresent()) {
            // Update existing RSVP
            attendee = existingRSVP.get();
            attendee.setStatus(request.getStatus());
            attendee.setUpdatedAt(LocalDateTime.now());
        } else {
            // Create new RSVP
            attendee = EventAttendee.builder()
                .eventId(eventId)
                .userId(userId)
                .status(request.getStatus())
                .role(AttendeeRole.ATTENDEE)
                .registeredAt(LocalDateTime.now())
                .dietaryRestrictions(request.getDietaryRestrictions())
                .specialRequests(request.getSpecialRequests())
                .build();
        }
        
        attendee = attendeeRepository.save(attendee);
        
        // Update event attendee count
        updateEventAttendeeCount(eventId);
        
        // Add to user's calendar if confirmed
        if (request.getStatus() == AttendeeStatus.CONFIRMED) {
            calendarService.addEventToUserCalendar(userId, event);
        }
        
        // Notify organizer
        notificationService.sendEventRSVPNotification(event.getOrganizerId(), userId, event, request.getStatus());
        
        return attendee;
    }
    
    public Page<Event> searchEvents(EventSearchRequest request, Pageable pageable) {
        return eventRepository.searchEvents(
            request.getQuery(),
            request.getEventType(),
            request.getLocation(),
            request.getDateRange(),
            request.getTags(),
            pageable
        );
    }
    
    public List<Event> getRecommendedEvents(String userId, int limit) {
        User user = userService.findById(userId);
        List<String> userInterests = profileService.getUserInterests(userId);
        String userLocation = user.getLocation();
        
        return eventRepository.findRecommendedEvents(
            userId, userInterests, userLocation, user.getProfileType(), limit);
    }
    
    private void validateEventCreationPermissions(String userId) {
        User user = userService.findById(userId);
        if (user.getProfileCompletion() < 70) {
            throw new InsufficientPermissionsException(
                "Profile must be at least 70% complete to create events");
        }
    }
    
    private void validateRSVPPermissions(Event event, String userId) {
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new EventNotAvailableException("Event is not available for registration");
        }
        
        if (event.getRegistrationDeadline() != null && 
            LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new RegistrationClosedException("Registration deadline has passed");
        }
        
        if (event.getMaxAttendees() != null) {
            long confirmedCount = attendeeRepository.countByEventIdAndStatus(
                event.getId(), AttendeeStatus.CONFIRMED);
            if (confirmedCount >= event.getMaxAttendees()) {
                throw new EventFullException("Event has reached maximum capacity");
            }
        }
    }
}
```

### **Events Database Schema**
```sql
-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('conference', 'workshop', 'networking', 'webinar', 'meetup', 'pitch', 'demo')),
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Africa/Harare',
    location VARCHAR(500),
    virtual_meeting_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    registration_required BOOLEAN DEFAULT true,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    organizer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'members_only')),
    cover_image_url TEXT,
    tags TEXT[],
    price DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees and RSVPs
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('confirmed', 'maybe', 'declined', 'pending', 'waitlist')),
    role VARCHAR(50) DEFAULT 'attendee' CHECK (role IN ('organizer', 'speaker', 'sponsor', 'attendee')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dietary_restrictions TEXT,
    special_requests TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE,
    UNIQUE(event_id, user_id)
);

-- Event sessions (for multi-session events)
CREATE TABLE event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    speaker_id UUID REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(500),
    session_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for events
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_start_date ON events(start_date_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_location ON events(location);

CREATE INDEX idx_event_attendees_event_user ON event_attendees(event_id, user_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX idx_event_attendees_status ON event_attendees(status);

CREATE INDEX idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX idx_event_sessions_speaker_id ON event_sessions(speaker_id);
CREATE INDEX idx_event_sessions_start_time ON event_sessions(start_time);
```

## 🛒 **Marketplace System**

### **Marketplace Service Implementation**
```java
// Backend: MarketplaceService.java
@Service
@Slf4j
@Transactional
public class MarketplaceService {
    
    @Autowired
    private MarketplaceListingRepository listingRepository;
    
    @Autowired
    private MarketplaceTransactionRepository transactionRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public MarketplaceListing createListing(CreateListingRequest request, String sellerId) {
        validateListingCreationPermissions(sellerId);
        
        MarketplaceListing listing = MarketplaceListing.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .listingType(request.getListingType())
            .price(request.getPrice())
            .currency(request.getCurrency())
            .negotiable(request.isNegotiable())
            .sellerId(sellerId)
            .status(ListingStatus.ACTIVE)
            .location(request.getLocation())
            .tags(request.getTags())
            .images(request.getImages())
            .contactMethod(request.getContactMethod())
            .build();
        
        listing = listingRepository.save(listing);
        
        log.info("Marketplace listing created: {} by user {}", listing.getId(), sellerId);
        return listing;
    }
    
    public MarketplaceTransaction initiateTransaction(String listingId, String buyerId, 
                                                    InitiateTransactionRequest request) {
        MarketplaceListing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new ListingNotFoundException("Listing not found: " + listingId));
        
        validateTransactionPermissions(listing, buyerId);
        
        MarketplaceTransaction transaction = MarketplaceTransaction.builder()
            .listingId(listingId)
            .sellerId(listing.getSellerId())
            .buyerId(buyerId)
            .amount(request.getOfferedAmount())
            .currency(listing.getCurrency())
            .status(TransactionStatus.INITIATED)
            .message(request.getMessage())
            .build();
        
        transaction = transactionRepository.save(transaction);
        
        // Notify seller
        notificationService.sendMarketplaceInquiryNotification(
            listing.getSellerId(), buyerId, listing, transaction);
        
        return transaction;
    }
    
    public Page<MarketplaceListing> searchListings(MarketplaceSearchRequest request, Pageable pageable) {
        return listingRepository.searchListings(
            request.getQuery(),
            request.getCategory(),
            request.getListingType(),
            request.getLocation(),
            request.getPriceRange(),
            pageable
        );
    }
}
```

---

## 📚 **Reference Documents**

**Core API Development**: See `/4_backend_implementation/1_core_api_development.md`
**Database Schema**: See `/2_technical_architecture/2_database_schema_and_design.md`
**API Specifications**: See `/2_technical_architecture/3_api_specifications_and_endpoints.md`
**Frontend Implementation**: See `/5_frontend_implementation/2_user_interface_implementation.md`

*This advanced community features implementation provides comprehensive Groups, Events, and Marketplace functionality for enhanced user engagement and community building on the ZbInnovation platform.*
