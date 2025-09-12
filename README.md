# SmileFactory Platform - Monorepo

## 🚀 **Project Overview**

**SmileFactory** is Zimbabwe's premier innovation ecosystem platform connecting innovators, investors, mentors, and organizations to accelerate economic growth through collaboration and knowledge sharing.

### **🎯 Mission**
Create a central platform for Zimbabwe's innovation community that fosters collaboration, facilitates opportunity discovery, and accelerates technological advancement.

## 📁 **Monorepo Structure**

This repository follows a monorepo architecture with clear separation of concerns:

```
smilefactory-platform/
├── frontend/                 # Next.js application (main platform)
├── admin-cms/               # Administrative content management system
├── backend/                 # Node.js + Express.js API services
├── database/                # PostgreSQL migrations and schemas
├── shared/                  # Shared TypeScript types and utilities
├── docs/                    # Comprehensive platform documentation

├── examples/                # Code examples and integrations
└── migration-planning/      # Internal planning (excluded from Git)
```

### **🏗️ Architecture Philosophy**
- **Modular Design**: Clear separation of concerns with backend-agnostic frontend
- **Microservices**: Independent, scalable services with event-driven communication
- **Scalable Database**: PostgreSQL schema designed for future platform expansion
- **Easy Backend Switching**: Frontend can switch between REST/GraphQL without UI changes

## 📦 **Component Overview**

### **Frontend** (`/frontend/`)
- **Technology**: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- **Purpose**: Main platform user interface and user experience
- **Features**: Server-side rendering, progressive web app capabilities
- **State Management**: Zustand for global state, TanStack Query for server state

### **Admin CMS** (`/admin-cms/`)
- **Technology**: Next.js with administrative interface components
- **Purpose**: Content management and platform administration
- **Features**: User management, content moderation, analytics dashboard

### **Backend** (`/backend/`)
- **Technology**: Node.js 18+ with Express.js, TypeScript
- **Purpose**: API services, business logic, and microservices
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Architecture**: RESTful APIs with microservices pattern

### **Database** (`/database/`)
- **Technology**: PostgreSQL with Prisma migrations
- **Purpose**: Database schemas, migrations, and seed data
- **Features**: Type-safe database operations, automated migrations

### **Shared** (`/shared/`)
- **Technology**: TypeScript types and utilities
- **Purpose**: Common code shared across frontend, backend, and admin
- **Features**: API contracts, utility functions, shared configurations

## 👥 **Platform Users & Features**

### **8 User Types**
The platform serves 8 distinct user types, each with specialized features and experiences:
- **🚀 Innovator**, **💰 Business Investor**, **🎓 Mentor**, **💼 Professional**
- **🔬 Industry Expert**, **📚 Academic Student**, **🏫 Academic Institution**, **🏢 Organisation**

**Complete User Types**: See [User Types Reference](docs/reference/user_types.md)

### **6 Community Sections**
- **📰 Feed**: Community content stream with personalized curation
- **👤 Profiles**: User discovery and networking with advanced search
- **📝 Blog**: Long-form content creation and knowledge sharing
- **📅 Events**: Virtual and in-person event management
- **👥 Groups**: Interest-based communities and collaboration spaces
- **🛒 Marketplace**: Service offerings and opportunity listings

### **Key Features**
- **Personalized Dashboard**: Adapts to user type and profile completion state
- **AI-Powered Recommendations**: Smart matching and content curation
- **Real-time Messaging**: Direct communication and collaboration tools
- **Advanced Search**: Cross-platform content and user discovery
- **Mobile-First Design**: Progressive web app with offline capabilities

## 🏗️ **Technology Stack**

**Complete Technology Stack**: See [Technology Stack Reference](docs/reference/technology_stack.md)

### **Key Technologies**
- **Frontend**: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- **Backend**: Node.js 18+ with Express.js, PostgreSQL 15+, Prisma ORM
- **Email Services**: MailChimp for transactional emails and marketing campaigns
- **Infrastructure**: Docker, Kubernetes, Redis, API Gateway
- **Architecture**: Microservices with Feature-Sliced Design

## 📊 **Development Standards**

### **Code Review Process**
Every code change must pass architectural compliance review:

#### **Frontend Review Checklist**
- [ ] **Next.js Best Practices**: Proper use of App Router and Server Components
- [ ] **Performance**: Optimized rendering, bundle size, and Core Web Vitals
- [ ] **Type Safety**: Full TypeScript coverage with strict mode
- [ ] **SEO & Accessibility**: Proper meta tags, semantic HTML, and WCAG compliance
- [ ] **Testing**: >85% code coverage with Jest and Testing Library

#### **Backend Review Checklist**
- [ ] **API Design**: RESTful endpoints with proper HTTP methods and status codes
- [ ] **Database Operations**: Efficient Prisma queries with proper error handling
- [ ] **Security**: Input validation, JWT authentication, and authorization middleware
- [ ] **Performance**: Optimized database queries and Redis caching strategy
- [ ] **Testing**: >80% code coverage with Jest and Supertest

#### **Database Review Checklist**
- [ ] **Prisma Schema**: Type-safe models with proper relationships
- [ ] **Performance**: Optimized queries with appropriate indexes
- [ ] **Migrations**: Version-controlled schema changes with Prisma Migrate
- [ ] **Data Integrity**: Proper constraints, validations, and foreign keys

### **Git Workflow & GitHub Integration**
- **Branch Naming**: `feature/SF-123-description`, `bugfix/SF-456-description`, `hotfix/SF-789-description`
- **Commit Format**: `type(scope): description` with JIRA ticket reference
- **Pull Requests**: Comprehensive review process with architectural compliance checks
- **GitHub Automation**: PR/issue templates and workflows in `/.github/` (functional files, not docs)
- **Quality Assurance**: Automated validation ensures compliance with team standards

### **Testing Standards**
- **Unit Tests**: >85% coverage for all modules
- **Integration Tests**: Critical user journeys tested
- **E2E Tests**: Complete workflows validated
- **Performance Tests**: Load testing for scalability
- **Security Tests**: Vulnerability scanning

## 🚀 **Getting Started**

### **Development Workflow**

This project follows a **develop branch workflow** with Jira integration:

```bash
# 1. Start with develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch (following SMILE-XXX convention)
git checkout -b feature/SMILE-XXX-P[4|5]-[component]-[description]

# 3. Make changes and commit with Jira reference
git commit -m "SMILE-XXX: [What you did]"

# 4. Push and create Pull Request
git push origin your-branch-name
```

**Branch Naming Convention**:
- `feature/SMILE-XXX-P4-backend-[description]` - Backend changes
- `feature/SMILE-XXX-P5-frontend-[description]` - Frontend changes

### **Development Setup**
- **Frontend**: Next.js + TypeScript with npm/yarn package management
- **Backend**: Node.js + Express.js with npm/yarn package management
- **Database**: PostgreSQL with Prisma ORM and Docker containerization
- **Development Tools**: Docker Compose for local environment

### **Monorepo Structure**
- **Frontend**: Next.js application with App Router and feature-sliced design (`/frontend/`)
- **Backend**: Node.js microservices (user, content, community, gateway) (`/backend/`)
- **Database**: PostgreSQL schemas with Prisma migrations (`/database/`)
- **Documentation**: Comprehensive guides in `/docs/` folder
- **Shared**: Common TypeScript types and utilities (`/shared/`)

### **API Documentation**
**Complete API Information**: See [API Summary Reference](docs/reference/api_summary.md)
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Total Endpoints**: 284 endpoints across 8 microservices
- **Authentication**: JWT tokens with refresh mechanism

## 📈 **Implementation Roadmap**

### **Phase 1: Foundation** ✅ **COMPLETE**
- ✅ Project planning and requirements
- ✅ Technical architecture design
- ✅ Database schema and API specifications
- ✅ Development environment setup

### **Phase 2: Backend Development** 🔄 **IN PROGRESS**
- 🔄 User service (authentication, profiles)
- 📋 Content service (posts, blogs, media)
- 📋 Community service (groups, events)
- 📋 AI service (recommendations, matching)

### **Phase 3: Frontend Development** 📋 **PLANNED**
- 📋 Component library and design system
- 📋 User dashboard and profile management
- 📋 Community features and content creation
- 📋 Real-time messaging and notifications

### **Phase 4: Integration & Testing** 📋 **PLANNED**
- 📋 End-to-end testing and quality assurance
- 📋 Performance optimization and scaling
- 📋 Security testing and compliance
- 📋 User acceptance testing

### **Phase 5: Deployment** 📋 **PLANNED**
- 📋 Production environment setup
- 📋 Monitoring and logging implementation
- 📋 Backup and disaster recovery
- 📋 Go-live and user onboarding

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Performance**: <2s page load times, 99.9% uptime
- **Scalability**: Support 10,000+ concurrent users
- **Code Quality**: >85% test coverage, zero critical security issues
- **Modularity**: Independent service deployment and scaling

### **Business Metrics**
- **User Engagement**: Active users across all 8 profile types
- **Community Growth**: Successful connections and collaborations
- **Content Creation**: Knowledge sharing and opportunity discovery
- **Platform Adoption**: Zimbabwe's premier innovation ecosystem

## 📞 **Support & Resources**

### **Development Team**
- **Frontend Developer**: Next.js/React/TypeScript implementation
- **Backend Developer**: Node.js/Express.js microservices
- **Database Administrator**: PostgreSQL with Prisma ORM optimization
- **DevOps Engineer**: Infrastructure and deployment

### **Documentation**
- **Architecture**: Detailed in `/docs/2_technical_architecture/`
- **API Specs**: 284 endpoints documented with OpenAPI
- **User Journeys**: Complete flows in `/docs/1_planning_and_requirements/`
- **Coding Standards**: Modular architecture guidelines in `/docs/3_development_setup/`

### **Tools & Platforms**
- **Project Management**: JIRA with automated GitHub integration
- **Code Repository**: GitHub with branch protection rules
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Prometheus + Grafana for observability

## 📚 **Documentation Structure**

All documentation is organized in numbered folders for logical progression:

### **📋 Master References** (`/docs/reference/`)
- **Technology Stack**: Complete technology stack with versions and standards
- **User Types**: Comprehensive definitions of all 8 platform user types
- **API Summary**: API statistics, endpoints, and integration information
- **Style Guide**: Documentation standards and writing guidelines

### **1. Planning & Requirements** (`/docs/1_planning_and_requirements/`)
- Project overview, user journeys, and feature specifications
- Business requirements and platform specifications
- Authentication & profile creation process flows

### **2. Technical Architecture** (`/docs/2_technical_architecture/`)
- System architecture and microservices design
- Database schema design and scalability patterns
- API specifications (284 endpoints) and security architecture
- MailChimp integration for email communications
- Modular architecture principles and executive summary

### **3. Development Setup** (`/docs/3_development_setup/`)
- Environment setup and coding standards
- Team workflow and comprehensive code review processes
- GitHub integration and automation
- Project management tools (JIRA integration)
- CI/CD pipeline and quality assurance
- Documentation maintenance and troubleshooting guides

### **4. Backend Implementation** (`/docs/4_backend_implementation/`)
- Microservices development and API implementation
- Database setup, authentication, and business logic

### **5. Frontend Implementation** (`/docs/5_frontend_implementation/`)
- Modular UI component development and state management
- Email templates and communication design
- User experience design and testing strategies

### **6. Integration & Testing** (`/docs/6_integration_and_testing/`)
- System integration and end-to-end testing
- Performance optimization and quality assurance

### **7. Deployment & Operations** (`/docs/7_deployment_and_operations/`)
- Production deployment and monitoring
- Scaling, maintenance, and support procedures

## ⚙️ **GitHub Integration**

The `/.github/` folder contains functional GitHub files (not documentation):
- **Pull Request Templates**: Automated PR creation with quality checklists
- **Issue Templates**: Standardized bug reports and feature requests
- **Workflows**: Automated validation and quality assurance
- **Documentation**: All GitHub-related documentation is in `/docs/3_development_setup/`

---

**SmileFactory Platform - Building Zimbabwe's Innovation Ecosystem** 🇿🇼
