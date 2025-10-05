# Supabase Setup Guide for Lithic POC

## Overview
This guide explains how to set up and use a local Supabase instance for the Lithic POC project. Supabase provides PostgreSQL database, authentication, real-time subscriptions, and API generation.

## Prerequisites
- Docker installed and running
- Node.js 18+ installed
- Supabase CLI installed

## Install Supabase CLI

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux
```bash
curl -o- https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

### npm (Alternative)
```bash
npm install -g supabase
```

## Project Setup

### 1. Initialize Supabase in Project
```bash
cd lithic-poc
supabase init
```

### 2. Start Local Supabase
```bash
supabase start
```

This will:
- Pull and start Docker containers for PostgreSQL, API server, Auth server, etc.
- Create local database with default schema
- Provide local URLs and keys

### 3. Expected Output
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: [long-anon-key]
service_role key: [long-service-role-key]
```

### 4. Update Environment Variables
Copy the keys from the output to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=[your-anon-key-from-output]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key-from-output]

# Database Configuration (PostgreSQL via Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=postgres
DB_PORT=54322
```

## Database Schema Setup

### 1. Apply Initial Schema
The schema is automatically applied via `supabase/seed.sql` when you start Supabase.

### 2. Manual Schema Application (if needed)
```bash
supabase db reset
```

### 3. Verify Schema
Access Supabase Studio at http://localhost:54323 to view:
- Tables and relationships
- Sample data
- API documentation
- Authentication settings

## Key Features Available

### 1. Database Management
- **Studio Interface**: Visual database management at http://localhost:54323
- **Direct PostgreSQL Access**: Connect via standard PostgreSQL tools
- **Migrations**: Version-controlled schema changes
- **Seed Data**: Pre-populated test data

### 2. Auto-Generated APIs
Supabase automatically generates RESTful APIs for all tables:
- `GET /rest/v1/users` - List users
- `POST /rest/v1/users` - Create user
- `PATCH /rest/v1/users?id=eq.1` - Update user
- `DELETE /rest/v1/users?id=eq.1` - Delete user

### 3. Real-time Subscriptions
- WebSocket connections for real-time data
- Row-level security
- Change notifications

### 4. Authentication (Optional)
- Built-in user authentication
- Social login providers
- JWT token management
- Row-level security policies

## Development Workflow

### 1. Start Development Environment
```bash
# Start Supabase
npm run supabase:start

# Start the Node.js API
npm run dev
```

### 2. Access Development Tools
- **API Server**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres
- **Email Testing**: http://localhost:54324

### 3. Database Operations

#### Reset Database
```bash
npm run supabase:reset
# or
supabase db reset
```

#### Generate Types (TypeScript)
```bash
supabase gen types typescript --local > types/supabase.ts
```

#### Create Migration
```bash
supabase migration new create_new_table
```

#### Apply Migration
```bash
supabase db push
```

### 4. Stop Environment
```bash
npm run supabase:stop
# or
supabase stop
```

## Integration with Node.js API

### 1. Database Access
The Node.js API uses Sequelize to connect to the PostgreSQL database:

```javascript
// Direct Sequelize connection
const { sequelize } = require('./src/config/database');

// Supabase client for additional features
const { supabase } = require('./src/config/database');
```

### 2. Hybrid Approach
- **Sequelize**: For complex business logic, transactions, and ORM features
- **Supabase Client**: For real-time features, file storage, and auth

### 3. Example Usage
```javascript
// Using Sequelize for complex queries
const users = await User.findAll({
  include: [{ model: Role, as: 'role' }],
  where: { is_active: true }
});

// Using Supabase for real-time updates
supabase
  .from('transactions')
  .on('INSERT', payload => {
    console.log('New transaction:', payload.new);
  })
  .subscribe();
```

## API Endpoints Available

### Supabase Auto-Generated APIs
All tables automatically get REST endpoints:

```bash
# Users
GET    http://localhost:54321/rest/v1/users
POST   http://localhost:54321/rest/v1/users
PATCH  http://localhost:54321/rest/v1/users?id=eq.1
DELETE http://localhost:54321/rest/v1/users?id=eq.1

# Cards
GET    http://localhost:54321/rest/v1/cards
POST   http://localhost:54321/rest/v1/cards

# Transactions
GET    http://localhost:54321/rest/v1/transactions
```

### Custom Node.js APIs
Business logic APIs with Lithic integration:

```bash
# Authentication
POST   http://localhost:3000/api/auth/login
POST   http://localhost:3000/api/auth/refresh

# User Management
POST   http://localhost:3000/api/users
GET    http://localhost:3000/api/users
PATCH  http://localhost:3000/api/users/:id

# Card Management with Lithic
POST   http://localhost:3000/api/cards
PATCH  http://localhost:3000/api/cards/:id/status
```

## Data Migration Strategy

### 1. From MySQL to PostgreSQL
If migrating from existing MySQL data:

```bash
# Export MySQL data
mysqldump -u root lithic_poc > mysql_backup.sql

# Convert MySQL to PostgreSQL format
# (Use tools like pgloader or manual conversion)

# Import to Supabase
psql postgresql://postgres:postgres@localhost:54322/postgres < converted_data.sql
```

### 2. Schema Migrations
```bash
# Create new migration
supabase migration new add_new_column

# Edit the migration file
# supabase/migrations/[timestamp]_add_new_column.sql

# Apply migration
supabase db push
```

### 3. Seed Data Management
Update `supabase/seed.sql` for:
- Default roles and users
- Sample spending profiles
- Test data for development

## Backup and Restore

### 1. Backup Local Database
```bash
# Create backup
pg_dump postgresql://postgres:postgres@localhost:54322/postgres > backup.sql

# Or using Supabase CLI
supabase db dump > backup.sql
```

### 2. Restore Database
```bash
# Restore from backup
supabase db reset
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql
```

## Production Deployment

### 1. Supabase Cloud
For production, consider using Supabase Cloud:
- Managed PostgreSQL
- Global CDN
- Automatic backups
- Built-in monitoring

### 2. Self-Hosted Production
For self-hosted production:
```bash
# Production docker-compose setup
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### 1. Port Conflicts
If ports are in use, update `supabase/config.toml`:
```toml
[api]
port = 54321

[db]
port = 54322

[studio]
port = 54323
```

### 2. Docker Issues
```bash
# Stop all containers
supabase stop

# Remove containers and volumes
docker-compose down -v

# Restart
supabase start
```

### 3. Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### 4. Reset Everything
```bash
# Complete reset
supabase stop
supabase start
```

## Monitoring and Logs

### 1. View Logs
```bash
# View all logs
supabase logs

# View specific service logs
docker logs supabase_db_lithic-poc
docker logs supabase_api_lithic-poc
```

### 2. Monitor Performance
Access Supabase Studio for:
- Query performance
- Active connections
- Database size and usage
- Real-time metrics

This setup provides a robust, scalable foundation for the Lithic POC with excellent development tools and easy deployment options.
