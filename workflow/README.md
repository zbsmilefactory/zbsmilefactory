# Workflow - Code Integration & Development Guide

## 🎯 **Overview**
This folder contains guides and workflows for integrating existing code into the monorepo structure and establishing development processes.

## 📋 **Quick Start Guide**

### For New Team Members
1. **Clone the repository**
2. **Read this workflow guide**
3. **Set up your development environment**
4. **Follow the code integration process**
5. **Start contributing using SMILE-XXX workflow**

## 🔄 **Code Integration Workflow**

### Step 1: Assess Existing Code
Before integrating existing scattered code:

```bash
# 1. Inventory existing code locations
# Document where current code exists:
# - Local developer machines
# - Other repositories
# - Shared drives or cloud storage
# - Different branches or forks

# 2. Categorize code by component
# - Frontend React/Next.js components
# - Backend API endpoints and services
# - Database scripts and migrations
# - Shared utilities and types
# - Configuration files
```

### Step 2: Prepare Integration Environment
```bash
# 1. Create integration branch
git checkout develop
git pull origin develop
git checkout -b feature/SMILE-XXX-P4-integrate-existing-code

# 2. Backup existing work
# Create backup of current scattered code before integration

# 3. Set up clean workspace
# Ensure local environment matches monorepo structure
```

### Step 3: Code Migration Process

#### Frontend Code Integration
```bash
# Navigate to frontend folder
cd frontend

# 1. Copy existing React components
# - Move components to src/components/
# - Update import paths
# - Ensure TypeScript compatibility

# 2. Migrate pages and routing
# - Convert to Next.js App Router structure
# - Update routing logic
# - Migrate state management

# 3. Update styling
# - Convert to Tailwind CSS classes
# - Remove conflicting CSS files
# - Ensure responsive design

# 4. Test integration
npm install
npm run dev
# Verify all components work correctly
```

#### Backend Code Integration
```bash
# Navigate to backend folder
cd backend

# 1. Copy existing API code
# - Move routes to src/routes/
# - Move business logic to src/services/
# - Update database connections

# 2. Migrate database schema
# - Review existing database structure
# - Create Prisma schema from existing tables
# - Generate migration files

# 3. Update dependencies
# - Consolidate package.json
# - Remove duplicate dependencies
# - Update to latest compatible versions

# 4. Test API endpoints
npm install
npm run dev
# Test all existing API functionality
```

#### Database Integration
```bash
# Navigate to database folder
cd database

# 1. Export existing database schema
pg_dump --schema-only existing_db > schema/existing_schema.sql

# 2. Create Prisma schema
# - Convert SQL schema to Prisma format
# - Define relationships and constraints
# - Add indexes and optimizations

# 3. Create migration
prisma migrate dev --name integrate_existing_schema

# 4. Migrate data (if needed)
# - Export existing data
# - Transform to new schema format
# - Import using seed scripts
```

### Step 4: Resolve Conflicts & Dependencies
```bash
# 1. Resolve import conflicts
# - Update all import paths to use shared types
# - Remove duplicate type definitions
# - Ensure consistent naming conventions

# 2. Update environment variables
# - Consolidate .env files
# - Update configuration management
# - Ensure all services can communicate

# 3. Test integration
# - Run all applications together
# - Test API communication
# - Verify database connections
# - Check authentication flow
```

### Step 5: Quality Assurance
```bash
# 1. Code review checklist
# - All code follows TypeScript standards
# - No hardcoded values or credentials
# - Proper error handling implemented
# - Tests are updated or created

# 2. Testing
# - Run unit tests: npm test
# - Run integration tests
# - Test user workflows end-to-end
# - Verify performance benchmarks

# 3. Documentation
# - Update README files
# - Document any breaking changes
# - Update API documentation
# - Create migration notes
```

## 🚀 **Starting Development (When Issues Arise)**

### Issue Triage Process
1. **Identify the issue**
   - Check `/issues-and-bugs/` folder for known issues
   - Reproduce the problem locally
   - Determine severity and impact

2. **Create JIRA ticket**
   - Use SMILE-XXX naming convention
   - Include detailed description and steps to reproduce
   - Assign appropriate priority and labels

3. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/SMILE-XXX-P4-fix-issue-description
   ```

### Development Workflow
```bash
# 1. Work on the issue
# - Make focused, atomic commits
# - Write descriptive commit messages
# - Include SMILE-XXX ticket reference

# 2. Test your changes
# - Run relevant tests
# - Test manually in browser/API
# - Ensure no regressions

# 3. Commit and push
git add .
git commit -m "SMILE-XXX: Fix issue description

- Detailed description of changes
- Any breaking changes noted
- Testing performed"

git push origin feature/SMILE-XXX-P4-fix-issue-description
```

### Pull Request Process
1. **Create Pull Request**
   - Use PR template from `.github/PULL_REQUEST_TEMPLATE/`
   - Include SMILE-XXX ticket reference
   - Add detailed description of changes

2. **Code Review**
   - Request review from team members
   - Address feedback and suggestions
   - Ensure CI/CD checks pass

3. **Merge to Develop**
   - Squash commits if needed
   - Update JIRA ticket status
   - Delete feature branch after merge

## 🔧 **Development Environment Setup**

### Prerequisites
```bash
# Required software
- Node.js 18+
- PostgreSQL 15+
- Git
- VS Code (recommended)

# Recommended VS Code extensions
- TypeScript and JavaScript Language Features
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (for API testing)
```

### Local Setup
```bash
# 1. Clone repository
git clone https://github.com/zbsmilefactory/zbsmilefactory.git
cd zbsmilefactory

# 2. Install dependencies for all packages
npm install # (if using npm workspaces)
# OR install individually:
cd frontend && npm install
cd ../backend && npm install
cd ../admin-cms && npm install
cd ../shared && npm install

# 3. Set up environment variables
# Copy .env.example files and configure
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 4. Set up database
cd database
prisma migrate dev
prisma db seed

# 5. Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Admin CMS
cd admin-cms && npm run dev
```

## 📚 **Best Practices**

### Code Standards
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Include tests for new features
- Document complex business logic

### Git Workflow
- Always work on feature branches
- Keep commits atomic and focused
- Use conventional commit messages
- Rebase before merging to keep history clean
- Tag releases with semantic versioning

### Collaboration
- Communicate in JIRA tickets
- Use descriptive PR titles and descriptions
- Review code thoroughly
- Share knowledge through documentation
- Help onboard new team members

## 🆘 **Getting Help**

### When You're Stuck
1. **Check documentation** in `/docs/` folder
2. **Review known issues** in `/issues-and-bugs/` folder
3. **Search existing JIRA tickets** for similar problems
4. **Ask team members** for guidance
5. **Create detailed issue** if problem persists

### Resources
- Platform documentation: `/docs/`
- API documentation: `/docs/2_technical_architecture/`
- Team workflow: `/docs/TEAM_WORKFLOW_QUICK_REFERENCE.md`
- Known issues: `/issues-and-bugs/README.md`

## 📞 **Support Contacts**
- **Technical Lead**: [Contact information]
- **DevOps**: [Contact information]
- **Project Manager**: [Contact information]
