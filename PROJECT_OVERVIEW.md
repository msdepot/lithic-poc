# Lithic POC - Project Overview

## 📌 What This Is

A complete, working proof-of-concept for a card issuing platform powered by Lithic's sandbox API. This demonstrates all key functionality needed for a multi-tenant card management system.

## 🎯 What It Demonstrates

### 1. Multi-Tenant Account Management
- Admin CRM for onboarding new businesses
- Each business is isolated with its own users and cards
- Real Lithic account holder creation per business

### 2. Role-Based Access Control (RBAC)
- **Owner**: Full control, can create admins
- **Admin**: Can manage users and cards
- **User**: Can view and manage their own cards
- **Analyst**: Read-only access, cannot have cards

### 3. Card Lifecycle Management
- **Debit Cards**: Full account access
- **Reloadable Cards**: Pre-loaded amount
- **Limit-Based Cards**: With spending profiles
- Real Lithic API integration for all card operations

### 4. Spending Controls
- Custom spending profiles (daily/monthly limits)
- Lithic auth rules integration
- Apply profiles to multiple cards
- Merchant category controls (ready to implement)

### 5. Complete Visibility
- User list with roles
- Card list with details
- Spending profile management
- Real-time status updates

## 🏗️ Technical Architecture

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Supabase connection
│   │   └── lithic.js           # Lithic client setup
│   ├── controllers/
│   │   ├── auth.controller.js          # Login logic
│   │   ├── account.controller.js       # Account management
│   │   ├── user.controller.js          # User CRUD
│   │   ├── card.controller.js          # Card operations
│   │   └── spending-profile.controller.js  # Spending rules
│   ├── services/
│   │   └── lithic.service.js   # Lithic API wrapper
│   ├── routes/
│   │   └── index.js            # All API routes
│   └── middleware/
│       └── auth.js             # JWT authentication
├── server.js                   # Express server
└── database-schema.sql         # PostgreSQL schema
```

### Frontend (React)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.js            # Dual login (admin/user)
│   │   ├── AdminDashboard.js   # CRM interface
│   │   └── UserDashboard.js    # User interface
│   ├── services/
│   │   └── api.js              # API client
│   └── App.js                  # Main app with routing
└── public/
    └── index.html
```

### Database (Supabase/PostgreSQL)

```
Tables:
├── accounts          # Business accounts
├── users            # Users within accounts
├── cards            # Issued cards
├── spending_profiles # Spending limit templates
└── sessions         # JWT sessions
```

## 🔄 Complete User Flow

### Flow 1: Account Onboarding (Admin)
1. Admin logs into CRM (`admin` / `admin@123`)
2. Creates business account (e.g., "MSD Cafe")
3. System creates:
   - Database record
   - Lithic account holder (business)
   - Lithic financial account
   - Owner user record
4. Owner can now login with their email

### Flow 2: Team Setup (Owner)
1. Owner logs in with email (no password)
2. Creates team members:
   - Admins for card management
   - Users for card holders
   - Analysts for reporting
3. Each user gets:
   - Database record
   - Lithic account holder (individual)
   - Login credentials (email only)

### Flow 3: Card Issuance (Owner/Admin)
1. Select user to receive card
2. Choose card type:
   - **Debit**: Full account access
   - **Reloadable**: Pre-funded amount
   - **Limit-Based**: With spending profile
3. Optionally select spending profile
4. System creates:
   - Lithic virtual card
   - Database card record
   - Applies auth rules if profile selected

### Flow 4: Spending Control (Admin)
1. Create spending profile:
   - Daily limit (e.g., $500)
   - Monthly limit (e.g., $5000)
   - Merchant categories (optional)
2. System creates:
   - Database profile record
   - Lithic auth rule
3. Apply to cards:
   - Select existing profile when creating card
   - Multiple cards can use same profile

### Flow 5: Monitoring (All Roles)
1. View Users:
   - See all team members
   - View roles and status
2. View Cards:
   - See all issued cards
   - Check spending profiles
   - Monitor card status
3. View Profiles:
   - See all spending rules
   - Check which cards use them

## 📊 Data Model

### Account
```
{
  id: uuid,
  name: string,
  owner_email: string,
  lithic_account_holder_token: string,
  lithic_financial_account_token: string,
  balance: decimal,
  created_at: timestamp
}
```

### User
```
{
  id: uuid,
  account_id: uuid (FK),
  email: string,
  name: string,
  role: enum(owner, admin, user, analyst),
  lithic_account_holder_token: string,
  created_at: timestamp
}
```

### Card
```
{
  id: uuid,
  account_id: uuid (FK),
  user_id: uuid (FK),
  card_type: enum(debit, reloadable, limit_based),
  lithic_card_token: string,
  last_four: string,
  spending_profile_id: uuid (FK, nullable),
  status: string,
  created_at: timestamp
}
```

### Spending Profile
```
{
  id: uuid,
  account_id: uuid (FK),
  name: string,
  daily_limit: decimal,
  monthly_limit: decimal,
  allowed_categories: array,
  blocked_categories: array,
  lithic_auth_rule_token: string,
  created_at: timestamp
}
```

## 🔐 Authentication & Authorization

### Admin Authentication
- Hard-coded credentials (POC only!)
- Username: `admin`
- Password: `admin@123`
- JWT token with 24hr expiry

### User Authentication
- Email-only login (POC simplification)
- No password required
- JWT token with user context
- Role-based menu rendering

### Authorization Levels
- **Admin**: Can create accounts only
- **Owner**: Can create any user, any card type
- **Admin**: Can create users/analysts, any card type
- **User**: Can view their own data
- **Analyst**: Read-only access, no cards

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/admin/login      # Admin login
POST   /api/auth/user/login       # User login
GET    /api/auth/me               # Current user info
```

### Accounts (Admin only)
```
POST   /api/accounts              # Create account
GET    /api/accounts              # List accounts
GET    /api/accounts/:id          # Get account
```

### Users (Authenticated)
```
POST   /api/users                 # Create user
GET    /api/users                 # List account users
GET    /api/users/:id             # Get user details
```

### Cards (Authenticated)
```
POST   /api/cards                 # Create card
GET    /api/cards                 # List account cards
GET    /api/cards/:id             # Get card details
```

### Spending Profiles (Admin/Owner only)
```
POST   /api/spending-profiles     # Create profile
GET    /api/spending-profiles     # List profiles
GET    /api/spending-profiles/:id # Get profile
```

## 🔌 Lithic Integration

### Account Holders
- Created for each business (beneficial owner entities)
- Created for each user (beneficial owner individuals)
- Stores tokens in database for reference

### Financial Accounts
- Created for each business account
- Type: OPERATING
- Used for funding cards

### Cards
- Type: VIRTUAL
- State: OPEN (active)
- Spend limits applied if profile selected
- Returns last 4 digits for display

### Auth Rules
- Created from spending profiles
- Daily/monthly spending limits
- Merchant category controls
- Applied to cards via tokens

## 🎨 UI Design

### Design Principles
- **Grayscale**: No colors, professional look
- **Left Navigation**: Easy menu access
- **Role-Based**: Menu adapts to permissions
- **Table Views**: Clear data presentation
- **Form Validation**: Immediate feedback

### Key Screens
1. **Login Page**: Dual tabs for admin/user
2. **Admin Dashboard**: Account creation and list
3. **User Dashboard**: User/card/profile management
4. **Data Tables**: Users, cards, profiles

## 🚀 Ready for Production?

### What's Production-Ready
- ✅ Clean architecture
- ✅ Proper separation of concerns
- ✅ Real API integration
- ✅ Role-based access control
- ✅ Audit trail (created_at fields)

### What Needs Work for Production
- ⚠️ Password authentication
- ⚠️ Input validation & sanitization
- ⚠️ Error handling & recovery
- ⚠️ Rate limiting
- ⚠️ Logging & monitoring
- ⚠️ Webhook handling
- ⚠️ Transaction history
- ⚠️ Card controls (freeze/unfreeze)
- ⚠️ Email notifications
- ⚠️ 2FA for sensitive operations
- ⚠️ Comprehensive testing

## 📦 Deployment Considerations

### Backend
- **Hosting**: Any Node.js platform (Heroku, AWS, etc.)
- **Database**: Supabase hosted instance
- **Environment**: Separate sandbox/production
- **Secrets**: Environment variables

### Frontend
- **Hosting**: Static site hosting (Vercel, Netlify)
- **Build**: `npm run build`
- **CDN**: For global distribution
- **Environment**: API URL configuration

### Lithic
- **Sandbox**: For development/testing
- **Production**: Separate API key
- **Webhooks**: For real-time events
- **Compliance**: KYB/KYC requirements

## 🎓 Learning Outcomes

By exploring this POC, you'll understand:

1. **Multi-tenant SaaS architecture**
2. **Role-based access control implementation**
3. **External API integration patterns**
4. **Card issuing workflows**
5. **Spending control mechanisms**
6. **Full-stack development best practices**

## 📚 Documentation Files

- **QUICKSTART.md**: 5-minute setup guide
- **SETUP_GUIDE.md**: Detailed installation
- **TESTING_FLOW.md**: Complete test script
- **README.md**: Full documentation
- **This file**: Project overview

## 🎉 Summary

This POC provides a **complete, working foundation** for a card issuing platform. It demonstrates:

- Real Lithic API integration
- Multi-tenant account management
- Role-based permissions
- Card lifecycle management
- Spending controls
- Clean, scalable architecture

**Perfect starting point** for building a production card issuing platform! 💳

---

**Built to demonstrate the power of Lithic's card issuing API** 🚀
