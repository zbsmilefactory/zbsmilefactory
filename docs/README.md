# SmileFactory Platform Documentation

## 🎯 **Platform Overview**

**SmileFactory** is Zimbabwe's premier innovation ecosystem platform that connects innovators, investors, mentors, and organizations to accelerate economic growth and technological advancement through collaboration and knowledge sharing.

### **Mission**
Create a central platform for Zimbabwe's innovation community that fosters collaboration, facilitates opportunity discovery, and accelerates technological advancement.

### **Key Features**
- **Virtual Community Hub** with 6 main sections (Feed, Profiles, Blog, Events, Groups, Marketplace)
- **8 Specialized Profile Types** with customized experiences for each user type
- **AI-Powered Recommendations** for smart matching and personalized content
- **Comprehensive Social Features** including networking, messaging, and collaboration tools
- **Dynamic Content Creation** with specialized forms for different post types
- **Advanced Search and Discovery** across all platform content and users

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- **Backend**: Node.js + Express.js with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with email + OTP verification
- **File Storage**: AWS S3 or compatible storage
- **Email**: Mailchimp integration for transactional emails
- **Real-time**: Socket.io for notifications and live features

### **Monorepo Structure**
```
smilefactory-platform/
├── frontend/          # Next.js main platform application
├── admin-cms/         # Administrative content management system
├── backend/           # Node.js + Express.js API services
├── database/          # PostgreSQL migrations and schemas
├── shared/            # Shared TypeScript types and utilities
├── docs/              # This comprehensive documentation
├── examples/          # Code examples and integrations
├── workflow/          # Development workflow guides
└── issues-and-bugs/   # Current issues and bug tracking
```

## 📚 **Documentation Navigation**

### **🚀 Quick Start for Developers**
- **[Team Workflow Guide](TEAM_WORKFLOW_QUICK_REFERENCE.md)** - Essential daily workflow and SMILE-XXX conventions
- **[Development Environment Setup](3_development_setup/1_development_environment_setup.md)** - Get your local environment running
- **[Contributing Guidelines](3_development_setup/13_contributing_guidelines.md)** - Code standards and contribution process

### **📋 1. Planning & Requirements**
- **[Project Overview & Scope](1_planning_and_requirements/1_project_overview_and_scope.md)** - Mission, features, and target users
- **[Platform Features Specification](1_planning_and_requirements/3_platform_features_specification.md)** - Detailed feature requirements
- **[Business Requirements](1_planning_and_requirements/4_business_requirements.md)** - Business logic and rules
- **[User Journeys](1_planning_and_requirements/2_user_journeys/)** - Complete user experience flows
- **[Project Timeline & Milestones](1_planning_and_requirements/5_project_timeline_and_milestones.md)** - Development roadmap
- **[Profile Type Specifications](1_planning_and_requirements/6_profile_type_specifications.md)** - 8 user types and their features

### **🏗️ 2. Technical Architecture**
- **[System Architecture Design](2_technical_architecture/1_system_architecture_design.md)** - High-level system design
- **[Database Schema & Design](2_technical_architecture/2_database_schema_and_design.md)** - PostgreSQL schema and relationships
- **[API Specifications & Endpoints](2_technical_architecture/3_api_specifications_and_endpoints.md)** - RESTful API documentation
- **[Security & Authentication Design](2_technical_architecture/4_security_and_authentication_design.md)** - Security architecture
- **[Integration Architecture](2_technical_architecture/5_integration_architecture.md)** - External service integrations
- **[API Specifications](2_technical_architecture/6_api_specifications/)** - Detailed endpoint documentation
- **[Complete API Documentation](2_technical_architecture/8_complete_api_documentation.md)** - Comprehensive API guide
- **[Architecture Summary](2_technical_architecture/10_architecture_summary.md)** - Quick architecture overview
- **[Mailchimp Integration](2_technical_architecture/11_mailchimp_integration.md)** - Email service integration

### **⚙️ 3. Development Setup**
- **[Development Environment Setup](3_development_setup/1_development_environment_setup.md)** - Local development setup
- **[Coding Standards & Guidelines](3_development_setup/2_coding_standards_and_guidelines.md)** - Code quality standards
- **[Version Control & Workflow](3_development_setup/3_version_control_and_workflow.md)** - Git workflow and branching
- **[CI/CD Pipeline Configuration](3_development_setup/4_ci_cd_pipeline_configuration.md)** - Automated deployment
- **[Team Collaboration Tools](3_development_setup/5_team_collaboration_tools.md)** - Communication and project management
- **[Team Workflow & Processes](3_development_setup/6_team_workflow_and_processes.md)** - Development processes
- **[Release Management Strategy](3_development_setup/7_release_management_strategy.md)** - Release planning and deployment
- **[GitHub Integration](3_development_setup/8_github_integration.md)** - GitHub workflows and automation
- **[Git Branching Strategy](3_development_setup/9_git_branching_strategy.md)** - Branch naming and management
- **[Project Management Tools](3_development_setup/10_project_management_tools.md)** - JIRA and project tracking
- **[Documentation Maintenance](3_development_setup/11_documentation_maintenance.md)** - Keeping docs up to date
- **[Troubleshooting Guide](3_development_setup/12_troubleshooting_guide.md)** - Common issues and solutions

### **🔧 4. Backend Implementation**
- **[Core API Development](4_backend_implementation/1_core_api_development.md)** - Backend development guide
- **[Database Implementation](4_backend_implementation/2_database_implementation.md)** - Database setup and management
- **[Authentication & Security](4_backend_implementation/3_authentication_and_security.md)** - Auth implementation
- **[Business Logic Implementation](4_backend_implementation/4_business_logic_implementation.md)** - Core business logic
- **[API Testing & Validation](4_backend_implementation/5_api_testing_and_validation.md)** - Testing strategies
- **[AI Integration Implementation](4_backend_implementation/6_ai_integration_implementation.md)** - AI features
- **[Advanced Community Features](4_backend_implementation/7_advanced_community_features.md)** - Social features

### **🎨 5. Frontend Implementation**
- **[UI Component Development](5_frontend_implementation/1_ui_component_development.md)** - React component guide
- **[User Interface Implementation](5_frontend_implementation/2_user_interface_implementation.md)** - UI development
- **[Form Handling & Validation](5_frontend_implementation/3_form_handling_and_validation.md)** - Form management
- **[State Management Implementation](5_frontend_implementation/4_state_management_implementation.md)** - State architecture
- **[Frontend Testing & Validation](5_frontend_implementation/5_frontend_testing_and_validation.md)** - Testing strategies
- **[AI Integration Components](5_frontend_implementation/6_ai_integration_components.md)** - AI UI components
- **[User Experience Design](5_frontend_implementation/7_user_experience_design/)** - UX specifications
- **[Frontend Specifications](5_frontend_implementation/8_frontend_specifications/)** - Component specifications
- **[SEO Implementation Guide](5_frontend_implementation/9_seo_implementation_guide.md)** - SEO optimization
- **[Email Templates](5_frontend_implementation/10_email_templates.md)** - Email design and templates

### **🧪 6. Integration & Testing**
- **[System Integration](6_integration_and_testing/1_system_integration.md)** - Integration testing
- **[End-to-End Testing](6_integration_and_testing/2_end_to_end_testing.md)** - E2E test strategies
- **[Performance Testing & Optimization](6_integration_and_testing/3_performance_testing_and_optimization.md)** - Performance testing
- **[User Acceptance Testing](6_integration_and_testing/4_user_acceptance_testing.md)** - UAT processes
- **[Bug Tracking & Resolution](6_integration_and_testing/5_bug_tracking_and_resolution.md)** - Issue management

### **🚀 7. Deployment & Operations**
- **[Production Deployment Setup](7_deployment_and_operations/1_production_deployment_setup.md)** - Production deployment
- **[Monitoring & Logging](7_deployment_and_operations/2_monitoring_and_logging.md)** - System monitoring
- **[Backup & Disaster Recovery](7_deployment_and_operations/3_backup_and_disaster_recovery.md)** - Data protection
- **[Scaling & Performance Optimization](7_deployment_and_operations/4_scaling_and_performance_optimization.md)** - Scaling strategies
- **[Maintenance & Support](7_deployment_and_operations/5_maintenance_and_support.md)** - Ongoing maintenance

### **📖 Reference Documentation**
- **[API Summary](reference/api_summary.md)** - Quick API reference
- **[Technology Stack](reference/technology_stack.md)** - Complete tech stack details
- **[User Types](reference/user_types.md)** - All 8 profile types explained
- **[Documentation Style Guide](reference/documentation_style_guide.md)** - Documentation standards

## 🚨 **Current Status & Known Issues**

### **Live Platform**
- **Test Environment**: https://test.smilefactory.co.zw/home
- **Status**: Partially functional with critical bugs

### **High Priority Issues**
- **Authentication**: OTP validation accepts invalid codes (CRITICAL)
- **Email**: Sending from wrong domain (CRITICAL)
- **Social Features**: Follow/unfollow not working (HIGH)
- **Content**: Image upload pipeline incomplete (HIGH)

For detailed issue tracking, see: **[Issues & Bugs Documentation](../issues-and-bugs/README.md)**

## 🔄 **Development Workflow**

### **SMILE-XXX Convention**
All development follows the SMILE-XXX ticket naming convention:
- **SMILE-001**: Project setup and infrastructure
- **SMILE-002**: Documentation and monorepo structure
- **SMILE-XXX-P4**: Backend development tasks
- **SMILE-XXX-P5**: Frontend development tasks

### **Branch Strategy**
- **main**: Production-ready code
- **develop**: Main development branch
- **feature/SMILE-XXX-P4-backend-description**: Backend features
- **feature/SMILE-XXX-P5-frontend-description**: Frontend features

### **Quick Commands**
```bash
# Start development
git checkout develop
git pull origin develop
git checkout -b feature/SMILE-XXX-P4-your-feature

# Daily workflow
git add .
git commit -m "SMILE-XXX: Your changes description"
git push origin your-branch-name

# Create PR and merge to develop
```

## 📞 **Getting Help**

### **Documentation Issues**
- Check the **[Troubleshooting Guide](3_development_setup/12_troubleshooting_guide.md)**
- Review **[Known Issues](../issues-and-bugs/README.md)**
- Follow **[Contributing Guidelines](3_development_setup/13_contributing_guidelines.md)**

### **Development Support**
- **Team Workflow**: [TEAM_WORKFLOW_QUICK_REFERENCE.md](TEAM_WORKFLOW_QUICK_REFERENCE.md)
- **Code Integration**: [../workflow/README.md](../workflow/README.md)
- **Environment Setup**: [3_development_setup/1_development_environment_setup.md](3_development_setup/1_development_environment_setup.md)

---

**SmileFactory Platform - Building Zimbabwe's Innovation Ecosystem** 🇿🇼
