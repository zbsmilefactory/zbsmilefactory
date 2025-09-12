# 8. GitHub Integration and Automation

## 🎯 **Overview**

This document consolidates all GitHub-related configuration, templates, workflows, and automation for the SmileFactory Platform. It provides comprehensive guidance for GitHub integration with JIRA, automated workflows, and quality assurance processes.

## 📋 **GitHub Repository Structure**

### **Repository Organization**
```
smilefactory-platform/
├── .github/                    # GitHub configuration and automation
│   ├── ISSUE_TEMPLATE/        # Issue templates for standardized reporting
│   ├── PULL_REQUEST_TEMPLATE/ # PR templates for different change types
│   └── workflows/             # GitHub Actions workflows
├── docs/                      # Project documentation
├── frontend/                  # Next.js frontend application
├── backend/                   # Node.js backend services
└── README.md                  # Project overview and quick start
```

### **Branch Protection Rules**
- **Main Branch**: Protected, requires PR and reviews
- **Develop Branch**: Protected, requires PR and status checks
- **Feature Branches**: Temporary, deleted after merge
- **Release Branches**: Protected, requires additional approvals

## 🔧 **GitHub Templates**

### **Pull Request Templates**
Located in `.github/PULL_REQUEST_TEMPLATE/`

#### **Feature PR Template** (`feat.md`)
```markdown
## 🚀 Feature Implementation

### JIRA Ticket
- **Ticket**: [SMILE-XXX](https://smilefactory.atlassian.net/browse/SMILE-XXX)
- **Epic**: [SMILE-XX](https://smilefactory.atlassian.net/browse/SMILE-XX)

### Changes Made
- [ ] Feature implementation completed
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Documentation updated

### Testing
- [ ] All tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if frontend)
- [ ] API testing (if backend)

### Review Checklist
- [ ] Code follows project standards
- [ ] No breaking changes introduced
- [ ] Performance impact considered
- [ ] Security implications reviewed
```

#### **Bug Fix PR Template** (`fix.md`)
```markdown
## 🐛 Bug Fix

### Issue Description
- **JIRA Ticket**: [SMILE-XXX](https://smilefactory.atlassian.net/browse/SMILE-XXX)
- **Bug Description**: Brief description of the bug

### Root Cause Analysis
- **Cause**: What caused the bug
- **Impact**: Who/what was affected

### Solution
- **Fix Applied**: Description of the fix
- **Testing**: How the fix was verified

### Prevention
- [ ] Tests added to prevent regression
- [ ] Documentation updated if needed
- [ ] Process improvements identified
```

### **Issue Templates**
Located in `.github/ISSUE_TEMPLATE/`

#### **Bug Report Template** (`bug_report.md`)
```markdown
## 🐛 Bug Report

### Environment
- **Browser**: [e.g., Chrome 91, Firefox 89]
- **OS**: [e.g., Windows 10, macOS 11]
- **Device**: [e.g., Desktop, Mobile]

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
A clear description of what you expected to happen.

### Actual Behavior
A clear description of what actually happened.

### Screenshots
If applicable, add screenshots to help explain your problem.
```

#### **Feature Request Template** (`feature_request.md`)
```markdown
## 🚀 Feature Request

### User Story
As a [type of user], I want [goal] so that [benefit].

### Problem Statement
What problem does this feature solve?

### Proposed Solution
Describe your proposed solution.

### Alternatives Considered
Describe any alternative solutions you've considered.

### Additional Context
Add any other context or screenshots about the feature request.
```

## 🤖 **GitHub Actions Workflows**

### **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Build application
        run: npm run build
```

### **PR Validation** (`.github/workflows/pr-validation.yml`)
```yaml
name: PR Validation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title contains JIRA key
        run: |
          if [[ "${{ github.event.pull_request.title }}" =~ ^SMILE-[0-9]+: ]]; then
            echo "PR title is valid"
          else
            echo "PR title must start with SMILE-XXX: ..." && exit 1
          fi
      
      - name: Check branch name convention
        run: |
          BRANCH="${{ github.head_ref }}"
          if [[ "$BRANCH" =~ ^(feature|fix|docs|chore)/SMILE-[0-9]+-[a-z0-9-]+$ ]]; then
            echo "Branch name is valid"
          else
            echo "Branch must follow convention: feature/SMILE-123-description" && exit 1
          fi
```

### **JIRA Integration** (`.github/workflows/jira-integration.yml`)
```yaml
name: JIRA Integration

on:
  pull_request:
    types: [opened, closed]
  push:
    branches: [main, develop]

jobs:
  update-jira:
    runs-on: ubuntu-latest
    steps:
      - name: Extract JIRA ticket
        id: jira
        run: |
          TICKET=$(echo "${{ github.event.pull_request.title || github.event.head_commit.message }}" | grep -o 'SMILE-[0-9]\+' | head -1)
          echo "ticket=$TICKET" >> $GITHUB_OUTPUT
      
      - name: Update JIRA ticket
        if: steps.jira.outputs.ticket
        uses: atlassian/gajira-transition@v2
        with:
          issue: ${{ steps.jira.outputs.ticket }}
          transition: "In Review"
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

## 🔐 **Repository Secrets Configuration**

### **Required Secrets**
```yaml
JIRA_BASE_URL: https://smilefactory.atlassian.net
JIRA_USER_EMAIL: automation@smilefactory.com
JIRA_API_TOKEN: [JIRA API Token]
DEPLOY_KEY: [SSH Deploy Key]
DOCKER_USERNAME: [Docker Hub Username]
DOCKER_PASSWORD: [Docker Hub Password]
```

### **Environment Variables**
```yaml
NODE_ENV: production
DATABASE_URL: [Production Database URL]
REDIS_URL: [Redis Connection URL]
JWT_SECRET: [JWT Secret Key]
```

## 📊 **Quality Assurance Integration**

### **Automated Quality Checks**
- **Code Linting**: ESLint for JavaScript/TypeScript
- **Code Formatting**: Prettier for consistent formatting
- **Type Checking**: TypeScript strict mode validation
- **Test Coverage**: Jest coverage reports
- **Security Scanning**: Snyk vulnerability scanning

### **PR Quality Gates**
```yaml
Required Checks:
  - All tests pass
  - Code coverage >85%
  - No linting errors
  - No security vulnerabilities
  - PR template completed
  - JIRA ticket linked
```

### **Branch Protection Rules**
```yaml
Main Branch Protection:
  - Require PR before merging
  - Require status checks to pass
  - Require up-to-date branches
  - Require review from code owners
  - Restrict pushes to admins only

Develop Branch Protection:
  - Require PR before merging
  - Require status checks to pass
  - Allow force pushes by admins
```

## 🔄 **Workflow Automation**

### **PR Lifecycle Automation**
1. **PR Created**: 
   - Validate PR title and branch name
   - Update JIRA ticket to "In Review"
   - Assign reviewers based on code owners
   - Run automated tests and quality checks

2. **PR Updated**:
   - Re-run all quality checks
   - Update JIRA ticket with latest status
   - Notify reviewers of changes

3. **PR Merged**:
   - Update JIRA ticket to "Done"
   - Delete feature branch
   - Trigger deployment pipeline
   - Send team notifications

### **Issue Management Automation**
- **Auto-labeling**: Based on issue template type
- **Assignment**: Route to appropriate team members
- **Milestone tracking**: Link to current sprint/release
- **Stale issue management**: Close inactive issues

## 🛠️ **Setup and Configuration**

### **Initial Repository Setup**
1. **Create Repository**: Set up GitHub repository with proper structure
2. **Configure Branch Protection**: Apply protection rules to main branches
3. **Add Templates**: Install PR and issue templates
4. **Setup Workflows**: Configure GitHub Actions workflows
5. **Configure Secrets**: Add required secrets and environment variables

### **JIRA Integration Setup**
1. **Install GitHub for JIRA**: Add app to JIRA workspace
2. **Connect Repository**: Link GitHub repo to JIRA project
3. **Configure Automation**: Set up automated ticket updates
4. **Test Integration**: Verify PR creation updates JIRA tickets

### **Team Onboarding**
1. **Repository Access**: Grant appropriate permissions to team members
2. **Template Training**: Train team on using PR and issue templates
3. **Workflow Understanding**: Ensure team understands automated processes
4. **Quality Standards**: Communicate quality gates and requirements

## 📚 **Best Practices**

### **For Developers**
- **Use Templates**: Always use appropriate PR and issue templates
- **Follow Naming**: Adhere to branch and commit naming conventions
- **Link Tickets**: Always connect work to JIRA tickets
- **Quality First**: Ensure all quality checks pass before requesting review

### **For Reviewers**
- **Timely Reviews**: Respond to review requests promptly
- **Thorough Checking**: Use PR checklist for comprehensive review
- **Constructive Feedback**: Provide helpful, actionable feedback
- **Approve Responsibly**: Only approve when confident in changes

### **For Maintainers**
- **Monitor Automation**: Regularly check that automated processes work correctly
- **Update Templates**: Keep templates current with evolving standards
- **Optimize Workflows**: Continuously improve automation based on team feedback
- **Security Maintenance**: Regularly update secrets and security configurations

---

**Last Updated**: 2024-01-10  
**Maintained By**: DevOps and Development Teams  
**Review Cycle**: Monthly

*This document consolidates all GitHub integration and automation for the SmileFactory Platform.*
