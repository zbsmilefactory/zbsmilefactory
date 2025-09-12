# Database - PostgreSQL Migrations & Schema

## 🎯 **Overview**
This folder contains PostgreSQL database migrations, schemas, and database-related scripts for the SmileFactory Platform.

## 🛠️ **Technology Stack**
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Backup**: pg_dump/pg_restore
- **Monitoring**: PostgreSQL extensions

## 📁 **Folder Structure**
```
database/
├── migrations/              # Prisma migration files
│   ├── 20240101000000_init/ # Initial schema migration
│   ├── 20240102000000_add_users/
│   └── ...
├── schema/                  # Database schema documentation
│   ├── schema.prisma        # Main Prisma schema file
│   ├── user-tables.sql      # User-related table definitions
│   ├── content-tables.sql   # Content and post tables
│   └── indexes.sql          # Database indexes and constraints
├── seeds/                   # Database seed data
│   ├── development.ts       # Development seed data
│   ├── staging.ts           # Staging environment data
│   └── production.ts        # Production initial data
├── scripts/                 # Database utility scripts
│   ├── backup.sh            # Database backup script
│   ├── restore.sh           # Database restore script
│   └── performance.sql      # Performance monitoring queries
└── docs/                    # Database documentation
    ├── schema-design.md     # Database design decisions
    ├── migration-guide.md   # Migration best practices
    └── performance.md       # Performance optimization guide
```

## 🚀 **Getting Started**

### Prerequisites
- PostgreSQL 15+ installed and running
- Prisma CLI installed globally
- Database connection credentials

### Database Setup
```bash
# Install Prisma CLI globally
npm install -g prisma

# Navigate to database folder
cd database

# Generate Prisma client
prisma generate

# Create database (if not exists)
createdb smilefactory_dev

# Run migrations
prisma migrate dev
```

### Environment Configuration
Create `.env` file in project root:
```env
# Development Database
DATABASE_URL="postgresql://username:password@localhost:5432/smilefactory_dev"

# Test Database
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/smilefactory_test"

# Production Database (use connection pooling)
PROD_DATABASE_URL="postgresql://username:password@prod-host:5432/smilefactory_prod?connection_limit=20&pool_timeout=20"
```

## 📊 **Database Schema Overview**

### Core Tables
- **users**: User accounts and authentication
- **profiles**: User profile information and settings
- **posts**: Content posts (articles, opportunities, events)
- **comments**: Post comments and replies
- **likes**: Post and comment likes
- **follows**: User follow relationships
- **messages**: Private messaging system

### Content Tables
- **marketplace_items**: Marketplace listings
- **events**: Event information and registration
- **organizations**: Business and organization profiles
- **tags**: Content categorization and tagging
- **media**: File uploads and media management

### System Tables
- **notifications**: User notification system
- **audit_logs**: System activity logging
- **sessions**: User session management
- **email_logs**: Email delivery tracking

## 🔄 **Migration Workflow**

### Creating Migrations
```bash
# Create a new migration
prisma migrate dev --name add_new_feature

# Preview migration without applying
prisma migrate diff --preview-feature

# Reset database (development only)
prisma migrate reset
```

### Migration Best Practices
1. **Always backup** production data before migrations
2. **Test migrations** on staging environment first
3. **Use transactions** for complex schema changes
4. **Document breaking changes** in migration comments
5. **Plan rollback strategy** for each migration

### Production Migrations
```bash
# Deploy migrations to production
prisma migrate deploy

# Check migration status
prisma migrate status

# Resolve migration conflicts
prisma migrate resolve --applied "migration_name"
```

## 🔧 **Database Maintenance**

### Backup & Restore
```bash
# Create backup
./scripts/backup.sh production

# Restore from backup
./scripts/restore.sh backup_file.sql

# Automated daily backups (cron job)
0 2 * * * /path/to/database/scripts/backup.sh production
```

### Performance Monitoring
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Database Optimization
- **Indexes**: Create indexes on frequently queried columns
- **Partitioning**: Consider partitioning for large tables (posts, logs)
- **Connection Pooling**: Use PgBouncer for production
- **Vacuum**: Regular VACUUM and ANALYZE operations

## 🔐 **Security & Access Control**

### Database Users
```sql
-- Application user (limited permissions)
CREATE USER smilefactory_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE smilefactory TO smilefactory_app;
GRANT USAGE ON SCHEMA public TO smilefactory_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO smilefactory_app;

-- Read-only user (for analytics)
CREATE USER smilefactory_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE smilefactory TO smilefactory_readonly;
GRANT USAGE ON SCHEMA public TO smilefactory_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO smilefactory_readonly;
```

### Security Best Practices
- Use SSL connections in production
- Implement row-level security (RLS) where needed
- Regular security audits and access reviews
- Encrypt sensitive data at rest
- Monitor database access logs

## 📚 **Seeding Data**

### Development Seeds
```bash
# Run development seeds
npx prisma db seed

# Custom seed script
node seeds/development.ts
```

### Seed Data Types
- **Users**: Test user accounts with different roles
- **Content**: Sample posts, comments, and interactions
- **Organizations**: Test business profiles
- **Events**: Sample events and registrations

## 📖 **Documentation**
- Schema design: `/docs/2_technical_architecture/2_database_schema_and_design.md`
- Migration guide: `./docs/migration-guide.md`
- Performance optimization: `./docs/performance.md`
