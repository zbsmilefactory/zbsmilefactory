# SmileFactory Platform - Monorepo

## 🚀 **Project Overview**

**SmileFactory** is Zimbabwe's premier innovation ecosystem platform connecting innovators, investors, mentors, and organizations to accelerate economic growth through collaboration and knowledge sharing.

### **🎯 Mission**
Create a central platform for Zimbabwe's innovation community that fosters collaboration, facilitates opportunity discovery, and accelerates technological advancement.

## 📁 **Monorepo Structure**

This repository follows a monorepo architecture with clear separation of concerns:

```
smilefactory-platform/
├── frontend/               # Next.js application (main platform)
├── admin-cms/               # Administrative content management system
├── backend/                 # Node.js + Express.js API services
├── database/                # PostgreSQL migrations and schemas
├── shared/                 # Shared TypeScript types and utilities
├── docs/                   # Comprehensive platform documentation
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
- 
