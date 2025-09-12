# Frontend - Next.js Application

## 🎯 **Overview**
This folder contains the main SmileFactory Platform frontend application built with Next.js 14+, React 18+, and TypeScript.

## 🛠️ **Technology Stack**
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: Custom components with Headless UI
- **Authentication**: NextAuth.js integration
- **Forms**: React Hook Form with Zod validation

## 📁 **Folder Structure**
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles and Tailwind config
├── public/                  # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Access to backend API endpoints

### Installation
```bash
cd frontend
npm install
```

### Environment Setup
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
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

## 📋 **Development Guidelines**

### Component Structure
- Use functional components with TypeScript
- Follow Feature-Sliced Design (FSD) architecture
- Implement responsive design with Tailwind CSS
- Use custom hooks for business logic

### State Management
- **Global State**: Use Zustand for app-wide state
- **Server State**: Use TanStack Query for API data
- **Form State**: Use React Hook Form for form management

### Code Quality
- Follow ESLint and Prettier configurations
- Write unit tests with Jest and React Testing Library
- Use TypeScript strict mode
- Implement proper error boundaries

## 🔗 **Integration Points**
- **Backend API**: RESTful API communication
- **Authentication**: JWT token-based auth
- **File Upload**: Direct S3 integration for media
- **Real-time**: WebSocket connection for notifications

## 📚 **Key Features**
- User authentication and profile management
- Post creation and interaction (like, comment, share)
- Social networking (follow, messaging)
- Marketplace and events
- AI-powered recommendations
- Mobile-responsive design

## 🐛 **Known Issues**
- Image upload pipeline needs completion
- Form state clearing on dynamic post types
- Real-time notifications implementation pending

## 📖 **Documentation**
- Component documentation: `/docs/5_frontend_implementation/`
- API integration guide: `/docs/2_technical_architecture/`
- UI/UX guidelines: `/docs/5_frontend_implementation/8_frontend_specifications/`
