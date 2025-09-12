# Admin CMS - Administrative Interface

## 🎯 **Overview**
This folder contains the SmileFactory Platform administrative content management system for platform administrators and moderators.

## 🛠️ **Technology Stack**
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with admin-focused components
- **State Management**: Zustand for admin state
- **Authentication**: Role-based access control (RBAC)
- **UI Components**: Custom admin components with data tables

## 📁 **Folder Structure**
```
admin-cms/
├── src/
│   ├── app/                 # Next.js App Router admin pages
│   ├── components/          # Admin-specific UI components
│   │   ├── dashboard/       # Dashboard widgets and charts
│   │   ├── tables/          # Data tables and grids
│   │   ├── forms/           # Admin forms and inputs
│   │   └── moderation/      # Content moderation tools
│   ├── lib/                 # Admin utilities and configurations
│   ├── hooks/               # Admin-specific React hooks
│   ├── stores/              # Admin state management
│   └── types/               # Admin TypeScript types
├── public/                  # Admin static assets
├── package.json
└── next.config.js
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- Admin access credentials
- Backend API running

### Installation
```bash
cd admin-cms
npm install
```

### Environment Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
NEXTAUTH_SECRET=your-admin-secret-key
NEXTAUTH_URL=http://localhost:3002
```

### Development
```bash
npm run dev
```

### Build & Deploy
```bash
npm run build
npm start
```

## 🔐 **Access Control**

### Admin Roles
- **Super Admin**: Full platform access
- **Content Moderator**: Content review and moderation
- **User Manager**: User account management
- **Analytics Viewer**: Read-only dashboard access

### Authentication
- Separate admin authentication system
- Multi-factor authentication required
- Session timeout and security logging
- Role-based route protection

## 📊 **Admin Features**

### Dashboard
- Platform analytics and metrics
- User growth and engagement stats
- Content moderation queue
- System health monitoring

### User Management
- User account overview and search
- Profile verification and approval
- Account suspension and banning
- User activity monitoring

### Content Moderation
- Post review and approval workflow
- Reported content management
- Automated content flagging
- Community guidelines enforcement

### Platform Configuration
- System settings and configurations
- Email template management
- Feature flags and toggles
- API rate limiting controls

### Analytics & Reporting
- User engagement metrics
- Content performance analytics
- Platform usage statistics
- Export capabilities for reports

## 🛡️ **Security Features**

### Access Control
- Role-based permissions system
- IP whitelisting for admin access
- Audit logging for all admin actions
- Secure session management

### Data Protection
- Encrypted sensitive data display
- PII access logging and controls
- Data export restrictions
- Compliance reporting tools

## 📋 **Development Guidelines**

### Component Structure
- Use admin-specific design patterns
- Implement proper loading states
- Add confirmation dialogs for destructive actions
- Use data tables for large datasets

### State Management
- Separate admin state from user state
- Implement optimistic updates carefully
- Cache admin data appropriately
- Handle admin session expiration

### Security Practices
- Validate admin permissions on every action
- Log all administrative activities
- Implement proper CSRF protection
- Use secure headers and configurations

## 🔗 **Integration Points**
- **Backend API**: Admin-specific endpoints
- **User Platform**: Read-only access to user data
- **Analytics**: Integration with analytics services
- **Email System**: Template and campaign management

## 📚 **Admin Workflows**

### Content Moderation
1. Review flagged content in moderation queue
2. Approve, reject, or request changes
3. Apply community guidelines
4. Communicate with content creators

### User Management
1. Monitor user registrations and profiles
2. Verify business and organization accounts
3. Handle user reports and disputes
4. Manage account suspensions

### Platform Monitoring
1. Monitor system performance metrics
2. Review error logs and issues
3. Track feature usage and adoption
4. Generate compliance reports

## 📖 **Documentation**
- Admin workflows: `/docs/3_development_setup/`
- Security guidelines: `/docs/2_technical_architecture/4_security_and_authentication_design.md`
- User management: `/docs/4_backend_implementation/`
