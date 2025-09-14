# 10. Email Templates and Communication

## 🎯 **Overview**

This document outlines the email template design and communication strategy for the SmileFactory Platform using MailChimp. It covers template design principles, content guidelines, and implementation standards for consistent user communication.

## 📧 **Email Template Categories**

### **1. Authentication & Security Emails**
**Purpose**: User account security and verification
**Delivery**: Immediate, high priority
**Templates**:
- Welcome email after registration
- Email verification
- Password reset instructions
- Two-factor authentication codes
- Account security alerts

### **2. Profile & Onboarding Emails**
**Purpose**: Guide users through platform setup
**Delivery**: Triggered by user actions or time-based
**Templates**:
- Profile completion reminders
- Onboarding sequence (5-part series)
- Feature introduction emails
- Platform tour invitations

### **3. Community Interaction Emails**
**Purpose**: Foster engagement and networking
**Delivery**: Real-time notifications and daily digests
**Templates**:
- New connection requests
- Group invitations and updates
- Event notifications and reminders
- Comment and mention alerts
- Community highlights

### **4. Marketplace Transaction Emails**
**Purpose**: Support business transactions
**Delivery**: Immediate for transactions, scheduled for follow-ups
**Templates**:
- Service inquiry confirmations
- Payment receipts and invoices
- Order status updates
- Review and feedback requests
- Marketplace success stories

### **5. Marketing & Engagement Emails**
**Purpose**: Platform growth and user retention
**Delivery**: Scheduled campaigns and automated sequences
**Templates**:
- Newsletter and platform updates
- Feature announcements
- Success story spotlights
- Event promotions
- Re-engagement campaigns

## 🎨 **Design Standards**

### **Visual Identity**

> **🎨 Design System**: Email templates must align with the [UI Design Guide](8_frontend_specifications/ui-design-guide.md) color palette and typography specifications for brand consistency.

```css
/* Email template CSS variables - Updated to match SmileFactory Platform Design System */
:root {
  --primary-color: #7CB342;        /* Brand Green from UI Design Guide */
  --primary-dark: #689F38;         /* Brand Green Dark */
  --secondary-color: #f5f5f5;
  --accent-color: #2196F3;         /* Blue Accent from UI Design Guide */
  --text-primary: #212121;         /* Gray 900 from UI Design Guide */
  --text-secondary: #616161;       /* Gray 700 from UI Design Guide */
  --success-color: #4CAF50;        /* Success color from UI Design Guide */
  --warning-color: #FF9800;        /* Warning color from UI Design Guide */
  --error-color: #F44336;          /* Error color from UI Design Guide */
}

/* Typography - Aligned with UI Design Guide */
.email-heading {
  font-family: 'Inter', system-ui, Arial, sans-serif;  /* Matches UI Design Guide */
  font-size: 24px;                                     /* Heading 1 from UI Design Guide */
  font-weight: 600;                                     /* font-semibold from UI Design Guide */
  color: var(--text-primary);
  line-height: 1.25;                                    /* leading-tight from UI Design Guide */
}

.email-body {
  font-family: 'Inter', system-ui, Arial, sans-serif;  /* Matches UI Design Guide */
  font-size: 16px;                                     /* Body Large from UI Design Guide */
  color: var(--text-primary);
  line-height: 1.625;                                  /* leading-relaxed from UI Design Guide */
}

.email-button {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  display: inline-block;
}
```

### **Layout Structure**
```html
<!-- Standard email template structure -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{EMAIL_TITLE}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white;">
          <!-- Logo and branding -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #1976d2;">
              <img src="{{LOGO_URL}}" alt="SmileFactory Platform" width="200">
              <h1 style="color: white; margin: 10px 0 0 0;">SmileFactory Platform</h1>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0;">{{EMAIL_HEADING}}</h2>
              <p style="color: #666; line-height: 1.6;">{{EMAIL_CONTENT}}</p>
              
              <!-- Call-to-action button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{CTA_URL}}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  {{CTA_TEXT}}
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f5f5f5; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                SmileFactory Platform - Building Zimbabwe's Innovation Ecosystem
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                <a href="{{UNSUBSCRIBE_URL}}" style="color: #999;">Unsubscribe</a> | 
                <a href="{{PREFERENCES_URL}}" style="color: #999;">Email Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 📝 **Content Guidelines**

### **Writing Style**
- **Tone**: Professional yet friendly, encouraging innovation
- **Voice**: Supportive, empowering, community-focused
- **Language**: Clear, concise, action-oriented
- **Personalization**: Use recipient's name and relevant context

### **Subject Line Best Practices**
```typescript
// Subject line templates by category
const SUBJECT_TEMPLATES = {
  welcome: "Welcome to SmileFactory, {{firstName}}! 🚀",
  verification: "Verify your SmileFactory account",
  passwordReset: "Reset your SmileFactory password",
  connection: "{{senderName}} wants to connect with you",
  event: "Don't miss: {{eventName}} on {{eventDate}}",
  marketplace: "New inquiry for your {{serviceName}} service",
  newsletter: "This week in Zimbabwe's innovation ecosystem"
};

// Subject line guidelines
const SUBJECT_GUIDELINES = {
  maxLength: 50, // Optimal for mobile display
  includeEmoji: true, // For engagement (use sparingly)
  personalize: true, // Include first name when appropriate
  urgency: false, // Avoid spam trigger words
  preview: true // Consider preview text
};
```

### **Content Structure**
1. **Greeting**: Personalized salutation
2. **Context**: Brief explanation of why they're receiving the email
3. **Main Message**: Clear, concise primary content
4. **Call-to-Action**: Single, prominent action button
5. **Secondary Information**: Additional details if needed
6. **Closing**: Friendly sign-off with support information

## 🔧 **Template Implementation**

### **MailChimp Template Variables**
```html
<!-- User information -->
{{firstName}} - User's first name
{{lastName}} - User's last name
{{email}} - User's email address
{{userType}} - User type (Innovator, Investor, etc.)
{{profileUrl}} - Link to user's profile

<!-- Platform URLs -->
{{baseUrl}} - Platform base URL
{{dashboardUrl}} - User dashboard URL
{{settingsUrl}} - Account settings URL
{{unsubscribeUrl}} - Unsubscribe link
{{preferencesUrl}} - Email preferences URL

<!-- Dynamic content -->
{{eventName}} - Event name for event emails
{{senderName}} - Name of user sending connection request
{{serviceName}} - Marketplace service name
{{companyName}} - User's company name
{{location}} - User's location
```

### **Responsive Design**
```css
/* Mobile-first responsive design */
@media only screen and (max-width: 600px) {
  .email-container {
    width: 100% !important;
    padding: 10px !important;
  }
  
  .email-heading {
    font-size: 20px !important;
  }
  
  .email-button {
    display: block !important;
    width: 100% !important;
    text-align: center !important;
  }
  
  .email-content {
    padding: 20px 15px !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .email-container {
    background-color: #1a1a1a !important;
    color: #ffffff !important;
  }
  
  .email-text {
    color: #e0e0e0 !important;
  }
}
```

## 📊 **Email Performance Optimization**

### **A/B Testing Strategy**
```typescript
// A/B testing configuration
interface EmailABTest {
  testName: string;
  variants: {
    control: EmailTemplate;
    variant: EmailTemplate;
  };
  splitPercentage: number; // 50 for 50/50 split
  successMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
  duration: number; // Test duration in days
}

// Example A/B test
const welcomeEmailTest: EmailABTest = {
  testName: 'welcome_email_cta_test',
  variants: {
    control: {
      subject: 'Welcome to SmileFactory!',
      ctaText: 'Complete Your Profile'
    },
    variant: {
      subject: 'Welcome to SmileFactory, {{firstName}}!',
      ctaText: 'Start Building Your Network'
    }
  },
  splitPercentage: 50,
  successMetric: 'click_rate',
  duration: 14
};
```

### **Deliverability Best Practices**
- **Authentication**: SPF, DKIM, and DMARC records configured
- **List Hygiene**: Regular cleanup of bounced and inactive emails
- **Engagement Tracking**: Monitor open rates, click rates, and unsubscribes
- **Content Quality**: Avoid spam trigger words and excessive promotional content
- **Send Frequency**: Respect user preferences and engagement levels

## 🎯 **User Segmentation for Emails**

### **Segmentation Strategy**
```typescript
// User segments for targeted emails
const EMAIL_SEGMENTS = {
  NEW_USERS: {
    criteria: 'registered_within_30_days',
    emailTypes: ['onboarding', 'welcome_series', 'feature_introduction']
  },
  ACTIVE_INNOVATORS: {
    criteria: 'user_type_innovator_active_30_days',
    emailTypes: ['community_highlights', 'collaboration_opportunities']
  },
  INVESTORS: {
    criteria: 'user_type_investor',
    emailTypes: ['investment_opportunities', 'startup_spotlights']
  },
  INACTIVE_USERS: {
    criteria: 'no_login_90_days',
    emailTypes: ['re_engagement', 'platform_updates', 'success_stories']
  },
  MARKETPLACE_USERS: {
    criteria: 'marketplace_activity_30_days',
    emailTypes: ['transaction_updates', 'service_recommendations']
  }
};
```

### **Personalization Rules**
- **User Type Specific**: Tailor content based on Innovator, Investor, Mentor, etc.
- **Activity Level**: Different messaging for active vs. inactive users
- **Location Based**: Include relevant local events and opportunities
- **Interest Based**: Content aligned with user's stated interests and skills
- **Engagement History**: Adjust frequency based on email engagement

## 📈 **Analytics and Reporting**

### **Key Metrics to Track**
- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: Percentage of delivered emails opened
- **Click-Through Rate**: Percentage of opens that resulted in clicks
- **Conversion Rate**: Percentage of clicks that achieved the goal
- **Unsubscribe Rate**: Rate of users opting out
- **Spam Complaints**: Reports of emails marked as spam

### **Reporting Dashboard**
```typescript
// Email analytics interface
interface EmailAnalytics {
  campaignId: string;
  campaignName: string;
  sentDate: Date;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
  };
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  segmentPerformance: SegmentMetrics[];
}
```

---

**Last Updated**: 2024-01-10  
**Maintained By**: Marketing and Development Teams  
**Review Cycle**: Monthly  
**Template Status**: Ready for Implementation

*This document ensures consistent, effective email communication across the SmileFactory Platform using MailChimp integration.*
