# Lithic POC - Full Working Implementation

A complete proof-of-concept for card issuing platform with Lithic integration, featuring admin CRM and user management.

## 🎯 Overview

This POC demonstrates:
- **Admin CRM** for onboarding accounts (login: `admin` / `admin@123`)
- **User Dashboard** for managing users and cards (login: just email, no password)
- **Lithic Integration** for card creation and spending controls
- **Complete Flow** from account creation to card issuance with spending profiles

## 🏗️ Architecture

- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Frontend**: React (simple grayscale design)
- **External API**: Lithic Sandbox API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase CLI (for local database)

## 🚀 Quick Start

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Setup Backend

```bash
cd backend
npm install

# Initialize and start Supabase
supabase init
supabase start

# This will output your local Supabase credentials
# Update .env file if needed (should work with defaults)

# Run the database schema
# Copy the SQL from database-schema.sql and run it in Supabase Studio
# OR use: supabase db reset (after adding migration files)
```

**Supabase Studio**: Open http://127.0.0.1:54323 in your browser and run the SQL from `database-schema.sql` in the SQL editor.

### 3. Start Backend Server

```bash
# Still in backend directory
npm start
# Backend will run on http://localhost:3001
```

### 4. Setup Frontend

```bash
# Open a new terminal
cd frontend
npm install
npm start
# Frontend will run on http://localhost:3000
```

## 📊 Database Setup

### Option 1: Using Supabase Studio (Recommended)

1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to "SQL Editor"
3. Copy and paste the contents of `backend/database-schema.sql`
4. Click "Run" to execute

### Option 2: Using CLI

```bash
cd backend
# Create migration file
mkdir -p supabase/migrations
cp database-schema.sql supabase/migrations/20240101000000_initial_schema.sql
supabase db reset
```

## 🎮 Complete POC Flow

### Step 1: Admin Creates Account

1. Go to http://localhost:3000
2. Login as Admin:
   - Username: `admin`
   - Password: `admin@123`
3. Create account:
   - Business Name: `MSD Cafe`
   - Owner Name: `Eric Medina`
   - Owner Email: `eric@msdcafe.com`
   - Initial Balance: `15000`
4. Click "Create Account & Lithic Integration"
5. Note the success message with login email

### Step 2: Login as Owner

1. Logout from Admin
2. Switch to "User Login" tab
3. Enter email: `eric@msdcafe.com`
4. Click "Login" (no password needed)

### Step 3: Owner Creates Users

1. Go to "Create User" in left menu
2. Create users:
   - **Seth Medina** - `seth@msdcafe.com` - Role: Admin
   - **Gabriel Medina** - `gabriel@msdcafe.com` - Role: User
   - **Nathalia Medina** - `nathalia@msdcafe.com` - Role: User
   - **Lindsey Medina** - `lindsey@msdcafe.com` - Role: Analyst

### Step 4: Owner Creates Cards

1. Go to "Create Card" in left menu
2. Create cards:
   - **Owner (Eric)**: Debit Card
   - **Seth**: Debit Card

### Step 5: Login as Seth

1. Logout
2. Login with: `seth@msdcafe.com`

### Step 6: Seth Creates Reloadable Card

1. Go to "Create Card"
2. Select Gabriel
3. Card Type: Reloadable Card
4. Create card

### Step 7: Seth Creates Spending Profile

1. Go to "Create Spending Profile"
2. Profile details:
   - Name: `Basic User Limits`
   - Daily Limit: `500`
   - Monthly Limit: `5000`
3. Create profile

### Step 8: Seth Creates Card with Profile

1. Go to "Create Card"
2. Select Nathalia
3. Card Type: Limit-Based Card
4. Spending Profile: Select "Basic User Limits"
5. Create card

### Step 9: View Everything

1. Go to "View Users" - See all 5 users
2. Go to "View Cards" - See all 4 cards with details
3. Go to "View Spending Profiles" - See the profile

## 🔑 Login Credentials

### Admin CRM
- Username: `admin`
- Password: `admin@123`

### User Accounts (No password required)
- `eric@msdcafe.com` (Owner)
- `seth@msdcafe.com` (Admin)
- `gabriel@msdcafe.com` (User)
- `nathalia@msdcafe.com` (User)
- `lindsey@msdcafe.com` (Analyst)

## 📁 Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Lithic config
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Auth middleware
│   ├── server.js            # Main server file
│   ├── database-schema.sql  # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Main pages
│   │   ├── services/        # API client
│   │   └── App.js           # Main app
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/login` - User login
- `GET /api/auth/me` - Get current user

### Accounts (Admin only)
- `POST /api/accounts` - Create account
- `GET /api/accounts` - List accounts
- `GET /api/accounts/:id` - Get account

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user

### Cards
- `POST /api/cards` - Create card
- `GET /api/cards` - List cards
- `GET /api/cards/:id` - Get card

### Spending Profiles
- `POST /api/spending-profiles` - Create profile
- `GET /api/spending-profiles` - List profiles
- `GET /api/spending-profiles/:id` - Get profile

## 🎨 UI Features

- **Grayscale Design**: Simple, professional look
- **Left Navigation**: Easy access to all features
- **Role-Based Menu**: Different options based on user role
- **Real-time Updates**: Instant feedback on all actions
- **Responsive Tables**: View all data clearly

## 🔐 Security Notes

⚠️ **This is a POC** - Several security features are simplified:
- No password encryption for user accounts
- Simplified authentication flow
- Basic permission checks
- No input sanitization

For production, implement:
- Password hashing (bcrypt)
- Proper input validation
- CSRF protection
- Rate limiting
- Audit logging

## 📝 Lithic Integration

The POC uses Lithic Sandbox API:
- **API Key**: `595234f1-968e-4fad-b308-41f6e19bc93f`
- **Environment**: Sandbox
- **Features Used**:
  - Account holder creation
  - Financial accounts
  - Card creation
  - Auth rules (spending limits)

## 🐛 Troubleshooting

### Backend won't start
- Check if Supabase is running: `supabase status`
- Verify .env file has correct values
- Check port 3001 is not in use

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is not in use
- Verify backend is running first

### Database errors
- Ensure schema is loaded in Supabase Studio
- Check Supabase Studio at http://127.0.0.1:54323
- Verify tables exist: accounts, users, cards, spending_profiles, sessions

### Lithic API errors
- Check API key in backend/.env
- Verify internet connection (Lithic is external API)
- Check Lithic sandbox status

## 🎯 Next Steps for Production

1. **Security Hardening**
   - Implement proper authentication
   - Add password encryption
   - Add input validation
   - Implement rate limiting

2. **Enhanced Features**
   - Transaction history
   - Card controls (freeze/unfreeze)
   - Real-time notifications
   - Advanced spending rules

3. **Monitoring & Logging**
   - Error tracking (Sentry)
   - Application monitoring
   - Audit trail for all actions

4. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests

## 📧 Support

This is a POC for demonstration purposes. For production implementation, consult with:
- Lithic documentation: https://docs.lithic.com
- Supabase documentation: https://supabase.com/docs

## ✅ Success Criteria

- ✅ Admin can create accounts with Lithic integration
- ✅ Owner can login and manage users
- ✅ Owner/Admin can create cards
- ✅ Spending profiles can be created and applied
- ✅ All users and cards are visible
- ✅ Complete flow works end-to-end

---

**Built with** ❤️ **for demonstrating Lithic card issuing capabilities**
