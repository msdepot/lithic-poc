# 🏗️ Architecture Documentation

This document describes the technical architecture of the Lithic POC platform.

## System Overview

The Lithic POC is a full-stack card issuing platform that integrates with Lithic's sandbox API. It demonstrates a production-ready architecture for fintech applications.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │ ──────► │   Express   │ ──────► │   Lithic    │
│  Frontend   │  HTTP   │   Backend   │  REST   │     API     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │   SQLite    │
                        │  Database   │
                        └─────────────┘
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** SQLite (PostgreSQL-ready)
- **Authentication:** JWT (JSON Web Tokens)
- **HTTP Client:** Axios (for Lithic API)
- **Environment:** dotenv for configuration

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Custom CSS (grayscale design)
- **Build Tool:** Create React App

### External Services
- **Card Issuing:** Lithic Sandbox API
- **API Key Management:** Environment variables

## Project Structure

```
lithic-poc/
├── backend/                    # Backend application
│   ├── config/                 # Configuration files
│   │   └── lithic.js          # Lithic API client setup
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # JWT authentication
│   ├── models/                # Data models (Sequelize)
│   │   ├── index.js           # Database initialization
│   │   ├── Account.js         # Business account model
│   │   ├── User.js            # User model with roles
│   │   ├── Card.js            # Card model
│   │   └── SpendingProfile.js # Spending profile model
│   ├── routes/                # API route handlers
│   │   ├── auth.js            # Login endpoints
│   │   ├── accounts.js        # Account management
│   │   ├── users.js           # User management
│   │   ├── cards.js           # Card management
│   │   └── spendingProfiles.js # Spending profile management
│   └── server.js              # Express server entry point
├── frontend/                  # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   ├── index.js           # React entry point
│   │   └── index.css
│   └── package.json
├── docs/                      # Documentation
├── .env                       # Environment variables
├── package.json               # Backend dependencies
└── docker-compose.yml         # Optional PostgreSQL setup
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│  accounts   │
├─────────────┤
│ id          │◄──────┐
│ business_name│      │
│ owner_email  │      │
│ lithic_*     │      │
│ balance      │      │
└─────────────┘      │
                     │
      ┌──────────────┴───────────────┬───────────────┐
      │                              │               │
      ▼                              ▼               ▼
┌─────────────┐            ┌─────────────┐  ┌──────────────────┐
│    users    │            │    cards    │  │ spending_profiles│
├─────────────┤            ├─────────────┤  ├──────────────────┤
│ id          │            │ id          │  │ id               │
│ account_id  │            │ account_id  │  │ account_id       │
│ email       │◄───┐       │ user_id     │  │ name             │
│ first_name  │    │       │ profile_id  │  │ spend_limit      │
│ role        │    │       │ lithic_*    │  │ blocked_categories│
│ lithic_*    │    │       │ card_type   │  │ lithic_*         │
└─────────────┘    │       │ last_four   │  └──────────────────┘
                   │       │ spend_limit │            ▲
                   │       └─────────────┘            │
                   └────────────┘                     │
                                └────────────────────┘
```

### Tables

#### accounts
Stores business account information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| business_name | STRING | Business name |
| owner_email | STRING | Owner's email |
| owner_first_name | STRING | Owner's first name |
| owner_last_name | STRING | Owner's last name |
| owner_phone | STRING | Owner's phone |
| lithic_account_token | STRING | Lithic account holder token |
| lithic_financial_account_token | STRING | Lithic financial account token |
| balance | DECIMAL | Account balance |

#### users
Stores user information with roles.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| account_id | INTEGER | Foreign key to accounts |
| email | STRING | User's email (unique per account) |
| first_name | STRING | User's first name |
| last_name | STRING | User's last name |
| role | ENUM | owner/admin/user/analyst |
| phone | STRING | User's phone |
| lithic_account_holder_token | STRING | Lithic account holder token |
| status | STRING | active/inactive |

#### cards
Stores card information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| account_id | INTEGER | Foreign key to accounts |
| user_id | INTEGER | Foreign key to users |
| spending_profile_id | INTEGER | Foreign key to spending_profiles (optional) |
| lithic_card_token | STRING | Lithic card token |
| card_type | STRING | debit/reloadable |
| last_four | STRING | Last 4 digits of card |
| spend_limit | DECIMAL | Spending limit amount |
| spend_limit_duration | STRING | monthly/daily/yearly |
| status | STRING | active/inactive |

#### spending_profiles
Stores reusable spending restriction templates.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| account_id | INTEGER | Foreign key to accounts |
| name | STRING | Profile name |
| description | STRING | Profile description |
| spend_limit | DECIMAL | Spending limit amount |
| spend_limit_duration | STRING | monthly/daily/yearly |
| allowed_categories | TEXT | JSON array of allowed MCCs |
| blocked_categories | TEXT | JSON array of blocked MCCs |
| lithic_auth_rule_token | STRING | Lithic auth rule token |

## API Architecture

### RESTful Endpoints

All backend APIs follow REST conventions:

```
/api/auth/*              - Authentication endpoints
/api/accounts/*          - Account management
/api/users/*             - User management
/api/cards/*             - Card management
/api/spending-profiles/* - Spending profile management
```

See **[API.md](API.md)** for complete API documentation.

### Authentication Flow

```
1. User logs in
   ├─► Admin: POST /api/auth/admin-login (username/password)
   └─► User: POST /api/auth/user-login (email only)
   
2. Server validates credentials
   └─► Returns JWT token
   
3. Client stores token
   └─► localStorage.setItem('token', token)
   
4. Subsequent requests include token
   └─► Authorization: Bearer <token>
   
5. Middleware validates token
   ├─► Valid: req.user populated, continue
   └─► Invalid: Return 401 Unauthorized
```

### Middleware Chain

```
Request → CORS → JSON Parser → Route Handler → Auth Middleware → Controller → Response
```

## Lithic Integration Architecture

### Account Hierarchy

```
Lithic Account (Business)
│
├─► Account Holder (Eric - Owner)
├─► Account Holder (Seth - Admin)
├─► Account Holder (Gabriel - User)
├─► Account Holder (Nathalia - User)
└─► Account Holder (Lindsey - Analyst)
    │
    ├─► Financial Account (Funding source)
    │   │
    │   └─► Cards (Debit, Reloadable)
    │       │
    │       └─► Auth Rules (Spending Profiles)
```

### Integration Points

1. **Account Holder Creation**
   - Every user gets a Lithic account holder
   - Stores `lithic_account_holder_token` in database
   - Type: Individual

2. **Financial Account Management**
   - Created when first card is issued
   - Stores `lithic_financial_account_token`
   - Used for funding cards

3. **Card Provisioning**
   - Creates physical or virtual cards
   - Stores `lithic_card_token`
   - Supports debit and reloadable types

4. **Auth Rules (Spending Profiles)**
   - Creates authorization rules
   - Stores `lithic_auth_rule_token`
   - Controls spending limits and categories

### API Client Configuration

Located in `backend/config/lithic.js`:

```javascript
const axios = require('axios');

const lithicClient = axios.create({
  baseURL: process.env.LITHIC_BASE_URL || 'https://sandbox.lithic.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.LITHIC_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## Security Architecture

### Authentication
- **Admin:** Username/password with bcrypt hashing
- **Users:** Email-only (POC simplicity)
- **Tokens:** JWT with 24-hour expiration
- **Secret:** Stored in environment variable

### Authorization (RBAC)

Role-based access control with 4 roles:

| Role | Permissions |
|------|-------------|
| Owner | Full account control, create users/cards |
| Admin | Create users, create cards, manage profiles |
| User | View own cards, limited access |
| Analyst | Read-only access to reports |

### Middleware Protection

```javascript
// Protect routes with authentication
router.get('/users', authenticateToken, getUsers);

// Middleware checks:
// 1. Token exists
// 2. Token is valid
// 3. User belongs to account
// 4. User has required role
```

### Environment Variables

Sensitive data stored in `.env`:
- `LITHIC_API_KEY` - Lithic sandbox API key
- `JWT_SECRET` - JWT signing secret
- `ADMIN_PASSWORD` - Admin CRM password (hashed)

## Scalability Considerations

### Database
- **Current:** SQLite for simplicity
- **Production:** PostgreSQL recommended
- **Migration:** Change `DB_DIALECT` in `.env`
- **Connection Pooling:** Built into Sequelize

### Caching
- **Current:** None (POC)
- **Future:** Redis for sessions, API responses
- **Implementation:** Add caching middleware

### Load Balancing
- **Current:** Single instance
- **Future:** Multiple instances behind load balancer
- **Stateless:** JWT allows horizontal scaling

### Monitoring
- **Current:** Console logs
- **Future:** Structured logging (Winston, Pino)
- **Metrics:** Add APM (Application Performance Monitoring)

## Error Handling

### Backend Error Strategy

```javascript
try {
  // Operation
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Operation failed',
    message: error.message 
  });
}
```

### Frontend Error Strategy

```javascript
try {
  const response = await axios.post('/api/endpoint', data);
  // Success handling
} catch (error) {
  alert(error.response?.data?.error || 'Operation failed');
}
```

## Deployment Architecture

### Development
```
localhost:3001 (Backend) ← localhost:3000 (Frontend)
```

### Production (Recommended)
```
nginx (Reverse Proxy)
├─► /api/* → Backend Server (Port 3001)
└─► /* → Frontend Static Files

Or use separate domains:
├─► api.example.com → Backend
└─► app.example.com → Frontend
```

## Performance Optimizations

### Database Indexes
- User email (for login)
- Account ID (for foreign keys)
- Card tokens (for lookups)

### API Response Caching
- GET requests can be cached
- Cache invalidation on updates

### Frontend Optimization
- Code splitting (React.lazy)
- Memoization (React.memo, useMemo)
- Image optimization (future)

## Future Architecture Enhancements

1. **Microservices:** Split into auth, card, user services
2. **Message Queue:** Async processing (RabbitMQ, Kafka)
3. **Event Sourcing:** Track all state changes
4. **CQRS:** Separate read/write models
5. **GraphQL:** Alternative to REST API
6. **WebSockets:** Real-time transaction updates
7. **Multi-tenancy:** Improve account isolation

---

**Last Updated:** 2025-10-06

For questions about architecture decisions, see related documentation:
- **[FEATURES.md](FEATURES.md)** - Feature descriptions
- **[API.md](API.md)** - API documentation
- **[LITHIC_INTEGRATION.md](LITHIC_INTEGRATION.md)** - Lithic integration details
