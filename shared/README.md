# Shared - TypeScript Types & Utilities

## 🎯 **Overview**
This folder contains shared TypeScript types, utilities, and common code used across frontend, backend, and admin-cms applications.

## 🛠️ **Technology Stack**
- **Language**: TypeScript
- **Build Tool**: tsc (TypeScript Compiler)
- **Package Manager**: npm
- **Validation**: Zod schemas
- **Utilities**: Lodash, date-fns

## 📁 **Folder Structure**
```
shared/
├── src/
│   ├── types/               # TypeScript type definitions
│   │   ├── user.ts          # User and profile types
│   │   ├── content.ts       # Post and content types
│   │   ├── api.ts           # API request/response types
│   │   ├── auth.ts          # Authentication types
│   │   └── common.ts        # Common utility types
│   ├── schemas/             # Zod validation schemas
│   │   ├── user.schema.ts   # User validation schemas
│   │   ├── post.schema.ts   # Post validation schemas
│   │   └── api.schema.ts    # API validation schemas
│   ├── utils/               # Shared utility functions
│   │   ├── validation.ts    # Validation helpers
│   │   ├── formatting.ts    # Data formatting utilities
│   │   ├── constants.ts     # Application constants
│   │   └── helpers.ts       # General helper functions
│   ├── enums/               # Enumeration definitions
│   │   ├── user-roles.ts    # User role enumerations
│   │   ├── post-types.ts    # Post type enumerations
│   │   └── status.ts        # Status enumerations
│   └── interfaces/          # Interface definitions
│       ├── api.ts           # API interface contracts
│       ├── database.ts      # Database interface types
│       └── events.ts        # Event interface definitions
├── dist/                    # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 **Getting Started**

### Installation
```bash
cd shared
npm install
```

### Build
```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npm run build:watch

# Type checking only
npm run type-check
```

### Usage in Other Packages
```bash
# In frontend, backend, or admin-cms
npm install ../shared

# Or using workspace (if using npm workspaces)
npm install @smilefactory/shared
```

## 📋 **Type Definitions**

### User Types
```typescript
// User and profile related types
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  profileType: ProfileType;
  // ... other profile fields
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export enum ProfileType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  ORGANIZATION = 'ORGANIZATION',
  INVESTOR = 'INVESTOR'
}
```

### Content Types
```typescript
// Post and content related types
export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  type: PostType;
  status: PostStatus;
  metadata?: PostMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostType {
  ARTICLE = 'ARTICLE',
  OPPORTUNITY = 'OPPORTUNITY',
  EVENT = 'EVENT',
  MARKETPLACE = 'MARKETPLACE',
  GENERAL = 'GENERAL'
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  FLAGGED = 'FLAGGED'
}
```

### API Types
```typescript
// API request and response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## 🔍 **Validation Schemas**

### Zod Schemas
```typescript
import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  profileType: z.enum(['INDIVIDUAL', 'BUSINESS', 'ORGANIZATION', 'INVESTOR'])
});

export const userProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional()
});

// Post validation schemas
export const postCreateSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  type: z.enum(['ARTICLE', 'OPPORTUNITY', 'EVENT', 'MARKETPLACE', 'GENERAL']),
  tags: z.array(z.string()).max(10).optional()
});
```

## 🛠️ **Utility Functions**

### Validation Utilities
```typescript
// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Formatting Utilities
```typescript
// Data formatting functions
export const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
  // Implementation using date-fns
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
```

## 📊 **Constants & Enums**

### Application Constants
```typescript
// Application-wide constants
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  PAGINATION_LIMIT: 20,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  POSTS: '/api/posts',
  UPLOAD: '/api/upload',
} as const;
```

## 🔗 **Integration Guidelines**

### Frontend Usage
```typescript
// In React components
import { User, PostType, userProfileSchema } from '@smilefactory/shared';
import { validateEmail } from '@smilefactory/shared/utils';

const MyComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // ... component logic
};
```

### Backend Usage
```typescript
// In Express.js routes
import { ApiResponse, postCreateSchema } from '@smilefactory/shared';
import { validatePassword } from '@smilefactory/shared/utils';

app.post('/api/posts', (req, res) => {
  const validation = postCreateSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input' }
    } as ApiResponse);
  }
  // ... route logic
});
```

## 📚 **Development Guidelines**

### Adding New Types
1. Create type definitions in appropriate files
2. Add corresponding Zod schemas for validation
3. Update utility functions if needed
4. Document breaking changes
5. Update version in package.json

### Versioning
- Follow semantic versioning (semver)
- Document breaking changes in CHANGELOG.md
- Test compatibility with all consuming packages

## 📖 **Documentation**
- Type definitions: `./src/types/`
- Validation schemas: `./src/schemas/`
- Utility functions: `./src/utils/`
