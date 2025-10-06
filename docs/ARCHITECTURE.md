# Lithic POC - Architecture Documentation

## Overview

This document describes **what things are** in the Lithic POC project. It explains the architecture, components, and how they work together.

## System Architecture

The Lithic POC is a full-stack card issuing platform with three main layers:

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│   - User Interface                      │
│   - Admin CRM Dashboard                 │
│   - User Dashboard                      │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────┐
│      Backend (Node.js + Express)        │
│   - API Routes                          │
│   - Authentication (JWT)                │
│   - Lithic API Integration              │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼─────┐   ┌──▼────────┐
│SQLite  │   │Sequelize│   │Lithic API │
│Database│   │   ORM   │   │ (Sandbox) │
└────────┘   └─────────┘   └───────────┘
```

## Core Components

### 1. Frontend (React Application)

**Location:** `/frontend/src/`

The frontend is a single-page application built with React that provides:

#### Pages
- **Login.js** - Dual-purpose login (Admin CRM and User login)
- **AdminDashboard.js** - Admin CRM for account creation and funding
- **UserDashboard.js** - Main dashboard for authenticated users

#### Components
- **CreateUser.js** - Form to create new users with roles
- **CreateCard.js** - Form to create cards (debit/reloadable)
- **CreateSpendingProfile.js** - Form to create spending restriction templates
- **UserList.js** - Table view of all users in the account
- **CardList.js** - Table view of all cards with details

#### Design Philosophy
- **Grayscale only** - No colors, focus on functionality
- **Left sidebar navigation** - Easy access to all features
- **Role-based UI** - Different menu items based on user role
- **Simple forms** - Clear, functional data entry

### 2. Backend (Node.js + Express)

**Location:** `/backend/`

The backend is a RESTful API that handles all business logic and external integrations.

#### Server Configuration
- **server.js** - Main Express server setup with CORS, JSON parsing, and route mounting

#### Middleware
- **auth.js** - JWT token validation and user authentication

#### API Routes

| Route | Purpose | Key Endpoints |
|-------|---------|---------------|
| **auth.js** | Authentication | `POST /api/auth/admin/login`<br>`POST /api/auth/user/login` |
| **accounts.js** | Account management | `POST /api/accounts/create`<br>`POST /api/accounts/fund` |
| **users.js** | User management | `POST /api/users/create`<br>`GET /api/users/list` |
| **cards.js** | Card management | `POST /api/cards/create`<br>`GET /api/cards/list` |
| **spendingProfiles.js** | Spending profiles | `POST /api/spending-profiles/create`<br>`GET /api/spending-profiles/list` |

#### Configuration
- **lithic.js** - Lithic API client configuration with base URL and API key

### 3. Database Layer

**Location:** `/backend/models/`

The database uses Sequelize ORM with SQLite (can be switched to PostgreSQL).

#### Data Models

**Account Model** (`Account.js`)
```
accounts
├── id (primary key)
├── business_name
├── owner_email
├── owner_first_name
├── owner_last_name
├── owner_phone
├── lithic_account_token (Lithic account holder token)
├── lithic_financial_account_token (Lithic financial account)
├── balance
└── status
```

**User Model** (`User.js`)
```
users
├── id (primary key)
├── account_id (foreign key → accounts)
├── email
├── first_name
├── last_name
├── role (owner/admin/user/analyst)
├── phone
├── lithic_account_holder_token (Lithic account holder for this user)
└── status
```

**Card Model** (`Card.js`)
```
cards
├── id (primary key)
├── account_id (foreign key → accounts)
├── user_id (foreign key → users)
├── spending_profile_id (foreign key → spending_profiles, optional)
├── lithic_card_token (Lithic card token)
├── card_type (debit_card/reloadable_card)
├── last_four (last 4 digits)
├── spend_limit
├── spend_limit_duration (monthly/annually/forever)
└── status
```

**SpendingProfile Model** (`SpendingProfile.js`)
```
spending_profiles
├── id (primary key)
├── account_id (foreign key → accounts)
├── name
├── description
├── spend_limit
├── spend_limit_duration
├── allowed_categories (comma-separated MCC codes)
├── blocked_categories (comma-separated MCC codes)
└── lithic_auth_rule_token (Lithic auth rule token)
```

### 4. Lithic Integration

**API Base URL:** `https://sandbox.lithic.com/v1`

The application integrates with Lithic's sandbox API for real card issuing functionality.

#### Integration Points

**Account Holders**
- Every user (including account owner) gets a Lithic account holder
- Type: `INDIVIDUAL`
- Stores: `lithic_account_holder_token` in database

**Financial Accounts**
- Created when first card is issued for an account
- Type: `ISSUING` (for card issuing)
- Stores: `lithic_financial_account_token` in database
- Tracks balance for the account

**Card Creation**
- Created via Lithic's card creation API
- Types supported: `VIRTUAL` (all cards are virtual in sandbox)
- Card type mapped internally: `debit_card` or `reloadable_card`
- Stores: `lithic_card_token` and `last_four` in database

**Auth Rules (Spending Profiles)**
- Created as Lithic auth rules
- Applied to cards via profile assignment
- Controls: spending limits, merchant categories
- Stores: `lithic_auth_rule_token` in database

## Authentication & Authorization

### Authentication

**Admin Authentication**
- Type: Username/Password
- Credentials: `admin` / `admin@123` (hardcoded for POC)
- Token: JWT with 24-hour expiration
- Used for: Admin CRM access only

**User Authentication**
- Type: Email only (passwordless for POC)
- Flow: User enters email → system validates → issues JWT
- Token: JWT with 24-hour expiration
- Used for: All user dashboard access

### Authorization (Role-Based Access Control)

**Roles:**

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| **Owner** | Full control | Create users, create cards, create profiles, view all |
| **Admin** | Management | Create users, create cards, create profiles, view all |
| **User** | Limited | View own cards only |
| **Analyst** | Read-only | View users and cards, no creation |

**Implementation:**
- Role stored in `users` table
- JWT token includes user role
- Frontend conditionally renders UI based on role
- Backend validates permissions on protected routes

## Data Flow Examples

### Example 1: Creating a Business Account

```
Admin → Frontend → Backend → Lithic API → Database
   ↓
1. Admin logs in with credentials
2. Admin submits account creation form
3. Backend validates data
4. Backend creates Lithic account holder for owner
5. Backend stores account in database
6. Backend returns success with account ID
7. Frontend displays success message
```

### Example 2: Creating a Card with Spending Profile

```
User → Frontend → Backend → Lithic API → Database
   ↓
1. User selects user and spending profile
2. User submits card creation form
3. Backend validates user has permission
4. Backend creates financial account (if first card)
5. Backend creates Lithic card
6. Backend applies spending profile (auth rule)
7. Backend stores card in database
8. Backend returns success with card details
9. Frontend displays card information
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** SQLite (production can use PostgreSQL)
- **Authentication:** JSON Web Tokens (jsonwebtoken)
- **HTTP Client:** Axios (for Lithic API)
- **Environment:** dotenv

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Custom CSS (grayscale design)
- **State Management:** Component state + localStorage

### External Services
- **Lithic API:** Card issuing platform (sandbox)

## Environment Configuration

The application uses environment variables defined in `.env`:

```env
# Server Configuration
PORT=3001                    # Backend server port

# Database Configuration
DB_DIALECT=sqlite           # Database type (sqlite/postgres)
DB_STORAGE=./database.sqlite # SQLite database file path

# Authentication
JWT_SECRET=your-super-secret-jwt-key  # JWT signing secret

# Lithic API Configuration
LITHIC_API_KEY=595234f1-968e-4fad-b308-41f6e19bc93f
LITHIC_BASE_URL=https://sandbox.lithic.com/v1

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123
```

## Security Considerations

**Current Implementation (POC):**
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ CORS enabled for frontend
- ⚠️ No password for users (email-only login)
- ⚠️ Hardcoded admin credentials
- ⚠️ Simple JWT secret

**Production Recommendations:**
- Add password authentication for users
- Implement password hashing (bcrypt)
- Use secure JWT secrets (environment-based)
- Add rate limiting
- Implement HTTPS/TLS
- Add audit logging
- Implement refresh tokens

## Scalability Considerations

**Current Architecture:**
- Single backend server
- SQLite database (file-based)
- No caching layer
- No load balancing

**Production Scaling Path:**
1. **Database:** Switch to PostgreSQL (configuration already supports it)
2. **Caching:** Add Redis for session management
3. **Load Balancing:** Multiple backend instances behind load balancer
4. **CDN:** Serve frontend assets via CDN
5. **Monitoring:** Add APM and logging (Datadog, New Relic, etc.)

## Extension Points

The architecture is designed to be easily extensible:

1. **New Card Types:** Add to `card_type` enum in Card model
2. **Additional Roles:** Add to `role` enum in User model
3. **Transaction History:** Add Transaction model and integrate Lithic webhooks
4. **More Spending Rules:** Extend SpendingProfile model
5. **Reporting:** Add reporting routes and dashboard components
6. **Notifications:** Add email/SMS notification service

## Key Design Decisions

**Why SQLite?**
- Zero configuration for POC
- Easy to get started
- Can easily migrate to PostgreSQL

**Why Passwordless (Email-only) Login?**
- Simplifies POC demonstration
- Reduces friction during testing
- Can easily add password authentication later

**Why Grayscale UI?**
- Focus on functionality over aesthetics
- Reduces design complexity
- Professional, clean appearance

**Why Separate Admin CRM?**
- Mirrors real-world CRM systems
- Separate authentication flow
- Clear separation of concerns

## Conclusion

This architecture provides a solid foundation for a card issuing platform with:
- Clear separation of concerns
- Scalable patterns
- Real external API integration
- Production-ready code structure
- Easy to understand and extend
