# 1. Development Environment Setup

## 🛠️ **Development Environment Overview**

This document provides comprehensive setup instructions for the ZbInnovation platform development environment, including all necessary tools, dependencies, and configurations for both frontend and backend development.

## 💻 **System Requirements**

### **Hardware Requirements**
- **CPU**: Intel i5/AMD Ryzen 5 or better (8+ cores recommended)
- **RAM**: 16GB minimum (32GB recommended for optimal performance)
- **Storage**: 500GB SSD minimum (1TB recommended)
- **Network**: Stable internet connection for cloud services and dependencies

### **Operating System Support**
- **Windows**: Windows 10/11 with WSL2
- **macOS**: macOS 12+ (Monterey or later)
- **Linux**: Ubuntu 20.04+, CentOS 8+, or equivalent distributions

## 🔧 **Core Development Tools**

### **Version Control**
```bash
# Git installation and configuration
git --version  # Verify Git 2.30+ is installed
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### **Code Editors and IDEs**
**Primary IDE Options**:
- **Visual Studio Code**: Recommended for full-stack JavaScript/TypeScript development
- **WebStorm**: JetBrains IDE optimized for JavaScript/Node.js development
- **Sublime Text**: Lightweight alternative with Node.js plugins

**Required VS Code Extensions** (if using VS Code):
```
- Node.js Extension Pack
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- GitLens
- Thunder Client (API testing)
- Prisma (Database ORM support)
- Thunder Client (API testing)
```

## 🟢 **Backend Development Setup**

### **Node.js Runtime**
```bash
# Install Node.js 18+ (LTS)
# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Linux (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using nvm (recommended for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be 18.x.x
npm --version   # Should be 9.x.x or higher
```

### **Package Manager Setup**
```bash
# Install yarn (optional, alternative to npm)
npm install -g yarn

# Install pnpm (optional, faster alternative)
npm install -g pnpm

# Verify installations
yarn --version
pnpm --version
```

### **Global Development Tools**
```bash
# Install useful global packages
npm install -g nodemon      # Auto-restart server on changes
npm install -g pm2          # Production process manager
npm install -g prisma       # Database toolkit CLI
npm install -g typescript   # TypeScript compiler

# Verify installations
nodemon --version
pm2 --version
prisma --version
tsc --version
```

### **Database Setup**

#### **PostgreSQL Installation**
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create development database
sudo -u postgres createdb zbinnovation_dev
sudo -u postgres createuser --interactive zbinnovation_user
```

#### **Redis Installation**
```bash
# Windows (using Chocolatey)
choco install redis-64

# macOS (using Homebrew)
brew install redis
brew services start redis

# Linux (Ubuntu)
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis installation
redis-cli ping  # Should return PONG
```

### **Backend Environment Configuration**
```env
# .env.development
NODE_ENV=development
PORT=3001

# Database configuration
DATABASE_URL="postgresql://zbinnovation_user:your_password@localhost:5432/zbinnovation_dev"
DIRECT_URL="postgresql://zbinnovation_user:your_password@localhost:5432/zbinnovation_dev"

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# File upload configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads

# Email configuration (MailChimp)
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_AUDIENCE_ID=your_audience_id
MAILCHIMP_FROM_EMAIL=dev@smilefactory-platform.com
MAILCHIMP_FROM_NAME=SmileFactory Dev

# API configuration
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
```

## ⚛️ **Frontend Development Setup (Next.js)**

### **Next.js Project Setup**
```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest smilefactory-frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Or clone existing project
git clone <repository-url>
cd smilefactory-frontend

# Install dependencies
npm install
# or
yarn install
```

### **Additional Frontend Dependencies**
```bash
# Install additional packages for the SmileFactory platform
npm install @headlessui/react @heroicons/react
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install socket.io-client
npm install framer-motion
npm install date-fns

# Development dependencies
npm install -D @types/node
npm install -D prisma
```

### **Frontend Environment Configuration**
```env
# .env.local (Next.js environment file)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
NEXT_PUBLIC_APP_NAME=SmileFactory Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development

# API Keys (development)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Database URL for Prisma (if using Prisma in frontend for type generation)
DATABASE_URL="postgresql://zbinnovation_user:your_password@localhost:5432/zbinnovation_dev"
```

## 🐳 **Docker Development Environment**

### **Docker Installation**
```bash
# Windows: Download Docker Desktop from docker.com
# macOS: Download Docker Desktop from docker.com
# Linux (Ubuntu):
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

### **Docker Development Setup**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: zbinnovation_dev
      POSTGRES_USER: zbinnovation_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## 🔧 **Development Tools Configuration**

### **WebStorm Setup**
1. **Install Required Plugins**:
   - Node.js
   - Prisma
   - Database Navigator
   - GitToolBox
   - SonarLint

2. **Project Configuration**:
   - Set Node.js interpreter to version 18+
   - Configure npm/yarn package manager
   - Set up code style and formatting
   - Configure database connections

### **VS Code Setup**
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "nodejs.repl.useCodeCompletion": true,
  "nodejs.repl.silentExecution": true,
  "prisma.showPrismaDataPlatformNotification": false,
  "files.associations": {
    "*.prisma": "prisma"
  }
}
```

### **Git Hooks Setup**
```bash
# Install pre-commit hooks
npm install -g @commitlint/cli @commitlint/config-conventional
npm install -g husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Add commit message hook
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

## 🧪 **Testing Environment Setup**

### **Backend Testing**
```json
// package.json testing dependencies
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "@types/jest": "^29.0.0",
    "@types/supertest": "^2.0.12",
    "testcontainers": "^9.0.0"
    <scope>test</scope>
</dependency>
```

### **Frontend Testing**
```json
// package.json testing dependencies
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

## 🚀 **Development Workflow**

### **Daily Development Routine**
```bash
# 1. Start development services
docker-compose -f docker-compose.dev.yml up -d

# 2. Start backend application
cd backend
npm run dev
# or with nodemon for auto-restart
npm run dev:watch

# 3. Start frontend development server
cd frontend
npm run dev

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
```

### **Code Quality Checks**
```bash
# Backend code quality
cd backend
npm run lint
npm run type-check
npm run test
npm run test:coverage

# Frontend code quality
cd frontend
npm run lint
npm run type-check
npm run test
npm run build
```

## 📊 **Development Monitoring**

### **Local Monitoring Setup**
- **Application Logs**: Console output and log files
- **Database Monitoring**: pgAdmin or DBeaver
- **Redis Monitoring**: Redis CLI or RedisInsight
- **API Testing**: Postman or Thunder Client

### **Performance Monitoring**
- **Frontend**: Browser DevTools, Lighthouse, Next.js built-in analytics
- **Backend**: Node.js performance hooks, custom middleware logging
- **Database**: Prisma query logging and performance analysis
- **Network**: Browser Network tab, API response times

---

## ✅ **Environment Verification Checklist**

### **Backend Verification**
- [ ] Node.js 18+ installed and configured
- [ ] npm/yarn/pnpm working correctly
- [ ] PostgreSQL running and accessible
- [ ] Redis running and accessible
- [ ] Express.js application starts successfully
- [ ] API endpoints respond correctly

### **Frontend Verification**
- [ ] Node.js 18+ installed
- [ ] npm/yarn/pnpm working correctly
- [ ] Dependencies installed successfully
- [ ] Development server starts
- [ ] Application loads in browser
- [ ] Hot reload working

### **Integration Verification**
- [ ] Frontend can connect to backend APIs
- [ ] Database connections working
- [ ] File upload functionality working
- [ ] WebSocket connections established
- [ ] Authentication flow working

**This development environment setup ensures consistent, efficient development across the team.** 🛠️
