# SmileFactory Platform - Technology Stack Reference

## 🏗️ **Technology Stack Overview**

This document serves as the **single source of truth** for all technology stack information across the SmileFactory Platform. All other documentation files should reference this document rather than duplicating technology stack details.

## 🎯 **Frontend Technology Stack**

### **Core Framework**
- **Next.js 14+** with App Router for full-stack React development
- **React 18+** with Server Components and strict mode for modern development
- **TypeScript 5.0+** for type-safe development with strict mode enabled

### **Styling and UI**
- **Tailwind CSS 3.3+** for utility-first styling and design system
- **Headless UI** for accessible, unstyled UI components
- **Radix UI** for complex interactive components

### **State Management**
- **Zustand 4.4+** for lightweight global state management
- **TanStack Query 4.0+** (React Query) for server state management and caching
- **React Hook Form 7.0+** for performant form handling

### **Development and Build Tools**
- **Turbopack** for fast development builds and hot reloading
- **ESLint 8.0+** with TypeScript and React configurations
- **Prettier 3.0+** for consistent code formatting
- **Jest 29.0+** with Testing Library for unit and integration testing

### **Architecture Pattern**
- **Feature-Sliced Design (FSD)** for modular, scalable architecture
- **Server Components** for improved performance and SEO
- **Progressive Web App (PWA)** capabilities with offline support

## 🔧 **Backend Technology Stack**

### **Core Framework**
- **Node.js 18+** LTS for server-side JavaScript runtime
- **Express.js 4.18+** for fast, unopinionated web framework
- **TypeScript 5.0+** for type-safe backend development

### **Database and ORM**
- **PostgreSQL 15+** as primary relational database
- **Prisma ORM 5.0+** for type-safe database operations and migrations
- **Redis 7.0+** for caching, session storage, and real-time features

### **Authentication and Security**
- **JWT (JSON Web Tokens)** for stateless authentication
- **Passport.js 0.6+** for authentication strategies
- **bcrypt 5.1+** for password hashing
- **Helmet.js** for security headers

### **Real-time and Communication**
- **Socket.io 4.7+** for real-time bidirectional communication
- **WebSocket** support for live updates and notifications

### **Testing and Quality**
- **Jest 29.0+** for unit and integration testing
- **Supertest 6.3+** for API endpoint testing
- **ESLint 8.0+** with Node.js configurations
- **Prettier 3.0+** for code formatting

## 🗄️ **Database Technology Stack**

### **Primary Database**
- **PostgreSQL 15+** with advanced features and performance optimizations
- **Connection Pooling** with PgBouncer for efficient database connections
- **Read Replicas** for horizontal read scaling

### **Database Tools**
- **Prisma ORM 5.0+** for schema management and type-safe queries
- **Prisma Migrate** for version-controlled database migrations
- **Prisma Studio** for database visualization and management

### **Performance and Scaling**
- **Database Indexing** strategic indexing for optimal query performance
- **Query Optimization** with Prisma query analysis
- **Partitioning Support** for large datasets

## ☁️ **Infrastructure and DevOps**

### **Containerization**
- **Docker 24.0+** for application containerization
- **Docker Compose** for local development environment
- **Multi-stage builds** for optimized production images

### **Orchestration and Deployment**
- **Kubernetes 1.28+** for container orchestration
- **Helm 3.12+** for Kubernetes package management
- **Horizontal Pod Autoscaling (HPA)** for automatic scaling

### **Cloud Platforms**
- **AWS/Azure/GCP** support for scalable cloud infrastructure
- **CDN Integration** for global content delivery
- **Load Balancing** for high availability

### **Monitoring and Observability**
- **Prometheus** for metrics collection
- **Grafana** for visualization and dashboards
- **Winston** for structured logging
- **Health Checks** for service monitoring

### **External Service Integrations**
- **MailChimp** for transactional emails and marketing campaigns
- **OAuth Providers** (Google, GitHub, LinkedIn) for authentication
- **AWS S3** or compatible cloud storage for file management
- **Payment Processors** for marketplace transactions
- **SMS Services** for notifications and verification

## 🔄 **Development Tools**

### **Version Control**
- **Git 2.40+** for version control
- **GitHub** for repository hosting and collaboration
- **GitHub Actions** for CI/CD automation

### **Package Management**
- **npm 9.0+** or **yarn 3.6+** for Node.js package management
- **pnpm 8.0+** as alternative for faster installs

### **Code Quality**
- **Husky 8.0+** for Git hooks
- **lint-staged** for pre-commit linting
- **Commitizen** for conventional commit messages

## 📊 **API and Integration**

### **API Architecture**
- **RESTful APIs** with proper HTTP methods and status codes
- **OpenAPI 3.0** (Swagger) for API documentation
- **API Gateway** (Express Gateway/Kong) for routing and load balancing

### **External Integrations**
- **DeepSeek API** for AI-powered features
- **Email Services** (SendGrid/AWS SES) for transactional emails
- **File Storage** (AWS S3/Azure Blob) for media and document storage

## 🧪 **Testing Strategy**

### **Testing Frameworks**
- **Jest 29.0+** for unit and integration testing
- **Testing Library** for React component testing
- **Supertest 6.3+** for API testing
- **Playwright** for end-to-end testing

### **Testing Standards**
- **Unit Tests**: >85% code coverage requirement
- **Integration Tests**: Critical user journeys tested
- **E2E Tests**: Complete workflows validated
- **Performance Tests**: Load testing for scalability

## 🔒 **Security Standards**

### **Security Tools**
- **Snyk** for vulnerability scanning
- **OWASP ZAP** for security testing
- **SonarQube** for code security analysis

### **Security Practices**
- **Input Validation** on all user inputs
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with proper output encoding
- **CSRF Protection** with tokens

---

## 📝 **Usage Guidelines**

### **For Documentation Authors**
- **Reference Only**: Link to this document instead of duplicating technology information
- **Context-Specific Details**: Add only implementation-specific details in your documents
- **Updates**: Propose changes to this master file for technology stack updates

### **For Developers**
- **Single Source**: Use this document as the authoritative technology reference
- **Version Alignment**: Ensure your development environment matches these specifications
- **Updates**: Submit pull requests for technology stack changes

### **Reference Format**
When referencing this document in other files, use:
```markdown
**Technology Stack**: See [Technology Stack Reference](../reference/technology_stack.md)
```

---

**Last Updated**: 2024-01-10  
**Maintained By**: Technical Architecture Team  
**Review Cycle**: Monthly
