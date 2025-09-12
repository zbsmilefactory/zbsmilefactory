# 12. Development Troubleshooting Guide

## 🎯 **Overview**

This comprehensive troubleshooting guide helps SmileFactory Platform developers quickly resolve common development issues, setup problems, and workflow challenges. It provides step-by-step solutions and escalation procedures for efficient problem resolution.

## 🚨 **Common Development Issues**

### **Environment Setup Problems**

#### **Node.js Version Issues**
**Problem**: Wrong Node.js version causing build failures
**Symptoms**:
- `npm install` fails with version errors
- Build process throws compatibility warnings
- Dependencies fail to install correctly

**Solution**:
```bash
# Check current Node.js version
node --version

# Install correct version using nvm (recommended)
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show compatible npm version

# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **Database Connection Issues**
**Problem**: Cannot connect to PostgreSQL database
**Symptoms**:
- "Connection refused" errors
- "Database does not exist" errors
- Authentication failures

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Verify database exists
psql -U postgres -l

# Create database if missing
createdb -U postgres smilefactory_dev

# Test connection with correct credentials
psql -U smilefactory_user -d smilefactory_dev -h localhost
```

#### **Docker Environment Issues**
**Problem**: Docker containers not starting or connecting
**Symptoms**:
- "Port already in use" errors
- Container startup failures
- Service communication issues

**Solution**:
```bash
# Check running containers
docker ps -a

# Stop conflicting containers
docker stop $(docker ps -q)

# Remove old containers
docker container prune

# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs for specific service
docker-compose logs [service-name]
```

### **Git and Version Control Issues**

#### **Merge Conflicts**
**Problem**: Git merge conflicts preventing progress
**Symptoms**:
- Merge conflict markers in files
- Unable to complete merge or rebase
- Conflicting changes from multiple developers

**Solution**:
```bash
# Check conflict status
git status

# For each conflicted file:
# 1. Open in editor and resolve conflicts
# 2. Remove conflict markers (<<<<<<, ======, >>>>>>)
# 3. Keep desired changes

# After resolving all conflicts
git add .
git commit -m "SMILE-XXX: Resolve merge conflicts"

# If rebase in progress
git rebase --continue

# If merge in progress
git merge --continue
```

#### **Branch Synchronization Issues**
**Problem**: Local branch out of sync with remote
**Symptoms**:
- Push rejected due to non-fast-forward
- Missing commits from other developers
- Divergent branch histories

**Solution**:
```bash
# Fetch latest changes
git fetch origin

# Check branch status
git status

# Sync with remote develop
git checkout develop
git pull origin develop

# Update feature branch
git checkout your-feature-branch
git merge develop

# Or rebase for cleaner history
git rebase develop

# Force push if necessary (use carefully)
git push origin your-feature-branch --force-with-lease
```

### **JIRA Integration Issues**

#### **Tickets Not Linking**
**Problem**: Git commits not updating JIRA tickets
**Symptoms**:
- JIRA tickets remain in "To Do" status
- No GitHub activity shown in JIRA
- Automation not triggering

**Solution**:
```bash
# Verify commit message format
git log --oneline -5

# Correct format should be:
# SMILE-XXX: Description of change

# Fix recent commit message
git commit --amend -m "SMILE-XXX: Correct description"

# Check JIRA ticket number exists
# Visit: https://smilefactory.atlassian.net/browse/SMILE-XXX

# Verify GitHub-JIRA integration
# Check repository settings → Integrations
```

#### **Workflow State Issues**
**Problem**: JIRA tickets stuck in wrong state
**Symptoms**:
- Tickets not transitioning automatically
- Manual state changes not working
- Workflow errors in JIRA

**Solution**:
1. **Check Ticket Permissions**: Ensure you have permission to transition
2. **Verify Workflow Rules**: Check if required fields are filled
3. **Manual Transition**: Use JIRA interface to move ticket manually
4. **Contact Admin**: If workflow issues persist, contact JIRA administrator

### **Code Quality and Testing Issues**

#### **Linting Errors**
**Problem**: ESLint or Prettier errors blocking commits
**Symptoms**:
- Pre-commit hooks failing
- CI/CD pipeline failures
- Inconsistent code formatting

**Solution**:
```bash
# Run linting manually
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Prettier formatting
npm run format

# Check specific file
npx eslint src/components/YourComponent.tsx

# Disable specific rule if necessary (use sparingly)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
```

#### **Test Failures**
**Problem**: Unit or integration tests failing
**Symptoms**:
- Jest test suite failures
- Coverage below threshold
- Specific test cases failing

**Solution**:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- YourComponent.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Debug specific test
npm test -- --verbose YourComponent.test.tsx

# Update snapshots if needed
npm test -- --updateSnapshot
```

### **API and Backend Issues**

#### **API Connection Failures**
**Problem**: Frontend cannot connect to backend APIs
**Symptoms**:
- Network errors in browser console
- API calls returning 500/404 errors
- CORS issues

**Solution**:
```bash
# Check backend server status
curl http://localhost:3001/api/v1/health

# Verify environment variables
cat .env.local | grep API_BASE_URL

# Check CORS configuration
# Ensure backend allows frontend origin

# Test API endpoint directly
curl -X GET http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check network tab in browser dev tools
# Look for failed requests and error messages
```

#### **Database Query Issues**
**Problem**: Prisma queries failing or returning unexpected results
**Symptoms**:
- Database connection errors
- Query syntax errors
- Data not found when expected

**Solution**:
```bash
# Check Prisma schema
npx prisma validate

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database if needed
npx prisma migrate reset

# Open Prisma Studio for data inspection
npx prisma studio

# Check database directly
psql -U smilefactory_user -d smilefactory_dev
```

## 🔧 **Performance Issues**

### **Slow Build Times**
**Problem**: Development builds taking too long
**Solutions**:
- **Clear Cache**: `npm cache clean --force`
- **Update Dependencies**: `npm update`
- **Check Disk Space**: Ensure adequate free space
- **Restart IDE**: Close and reopen development environment
- **Use Turbopack**: Ensure Next.js is using Turbopack for dev builds

### **Memory Issues**
**Problem**: Development server running out of memory
**Solutions**:
- **Increase Node Memory**: `export NODE_OPTIONS="--max-old-space-size=4096"`
- **Close Unused Applications**: Free up system memory
- **Restart Development Server**: `npm run dev` (restart)
- **Check for Memory Leaks**: Use browser dev tools to profile

## 📞 **Escalation Procedures**

### **Level 1: Self-Resolution (0-30 minutes)**
1. **Check This Guide**: Look for similar issues and solutions
2. **Search Documentation**: Check relevant docs in `/docs/` folder
3. **Google/Stack Overflow**: Search for error messages
4. **Check Logs**: Review console, server, and application logs

### **Level 2: Team Support (30 minutes - 2 hours)**
1. **Ask Team Member**: Reach out to colleague for help
2. **Create GitHub Discussion**: Post question with details
3. **Check Team Chat**: Ask in development channel
4. **Pair Programming**: Request screen sharing session

### **Level 3: Technical Lead (2+ hours)**
1. **Contact Team Lead**: Escalate to technical leadership
2. **Provide Context**: Include error messages, steps taken, environment details
3. **Schedule Meeting**: If complex issue requires discussion
4. **Document Solution**: Add resolution to this guide for future reference

### **Level 4: External Support (Critical Issues)**
1. **Contact DevOps**: For infrastructure or deployment issues
2. **Vendor Support**: For third-party service issues
3. **Emergency Contacts**: For production-critical problems

## 📋 **Issue Reporting Template**

When seeking help, provide the following information:

```markdown
## Issue Description
Brief description of the problem

## Environment
- OS: [Windows/macOS/Linux]
- Node.js Version: [version]
- Browser: [if frontend issue]
- Branch: [current git branch]

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Messages
```
[Paste error messages here]
```

## Screenshots
[If applicable]

## Steps Already Tried
- [List troubleshooting steps already attempted]
```

## 🛠️ **Useful Commands Reference**

### **Development Commands**
```bash
# Start development servers
npm run dev          # Frontend development server
npm run dev:backend  # Backend development server
npm run dev:full     # Both frontend and backend

# Testing commands
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Build commands
npm run build       # Production build
npm run build:dev   # Development build
npm run start       # Start production server

# Database commands
npx prisma migrate dev    # Run migrations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database browser
```

### **Git Commands**
```bash
# Branch management
git checkout develop
git pull origin develop
git checkout -b feature/SMILE-XXX-description

# Commit and push
git add .
git commit -m "SMILE-XXX: Description"
git push origin branch-name

# Sync with remote
git fetch origin
git merge origin/develop
git rebase origin/develop
```

## 🎯 **Prevention Best Practices**

### **Daily Habits**
- **Pull Latest Changes**: Start each day with `git pull origin develop`
- **Run Tests**: Execute `npm test` before committing
- **Check Linting**: Run `npm run lint` before pushing
- **Verify Environment**: Ensure all services are running correctly

### **Weekly Practices**
- **Update Dependencies**: Check for and install updates
- **Clean Cache**: Clear npm and browser caches
- **Review Logs**: Check for recurring warnings or errors
- **Backup Work**: Ensure all work is committed and pushed

---

**Last Updated**: 2024-01-10  
**Maintained By**: Development Team  
**Review Cycle**: Monthly  
**Emergency Contact**: [Team Lead Contact Information]

*This guide helps maintain development velocity by providing quick solutions to common issues.*
