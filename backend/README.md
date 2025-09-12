# Backend - Node.js API Services

## 🎯 **Overview**
This folder contains the SmileFactory Platform backend API services built with Node.js, Express.js, and PostgreSQL.

## 🛠️ **Technology Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3 or compatible
- **Email**: Mailchimp integration
- **Real-time**: Socket.io for notifications

## 📁 **Folder Structure**
```
backend/
├── src/
│   ├── controllers/         # Route handlers and business logic
│   ├── middleware/          # Authentication, validation, error handling
│   ├── models/              # Database models and schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic and external integrations
│   ├── utils/               # Helper functions and utilities
│   ├── config/              # Configuration files
│   └── types/               # TypeScript type definitions
├── tests/                   # Unit and integration tests
├── prisma/                  # Database schema and migrations
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- AWS S3 bucket (or compatible storage)

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smilefactory"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12

# Email Configuration
MAILCHIMP_API_KEY="your-mailchimp-api-key"
MAILCHIMP_SERVER_PREFIX="us1"
EMAIL_FROM="noreply@smilefactory.co.zw"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="smilefactory-uploads"

# App Configuration
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
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

## 📋 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/refresh` - Refresh JWT token

### Users & Profiles
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow` - Follow/unfollow user
- `GET /api/users/followers` - Get followers list

### Posts & Content
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Marketplace & Events
- `GET /api/marketplace` - Get marketplace items
- `POST /api/marketplace` - Create marketplace post
- `GET /api/events` - Get events
- `POST /api/events/:id/register` - Register for event

## 🔧 **Development Guidelines**

### Code Structure
- Use TypeScript strict mode
- Implement proper error handling with custom error classes
- Use middleware for authentication, validation, and logging
- Follow RESTful API conventions

### Database Operations
- Use Prisma ORM for type-safe database operations
- Implement proper transaction handling
- Use database migrations for schema changes
- Implement soft deletes where appropriate

### Security
- Validate all input data with Joi or Zod
- Implement rate limiting
- Use CORS properly
- Sanitize user input
- Implement proper JWT handling

### Testing
- Write unit tests for services and utilities
- Write integration tests for API endpoints
- Use Jest for testing framework
- Implement test database setup

## 🐛 **Known Issues**
- OTP validation accepts invalid codes (HIGH PRIORITY)
- Email sending from wrong domain (HIGH PRIORITY)
- Follow/unfollow endpoints need implementation
- Image upload pipeline incomplete
- Real-time notifications not implemented

## 📚 **Documentation**
- API documentation: `/docs/2_technical_architecture/`
- Database schema: `/docs/2_technical_architecture/2_database_schema_and_design.md`
- Authentication guide: `/docs/4_backend_implementation/3_authentication_and_security.md`
