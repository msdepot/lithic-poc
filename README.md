# Lithic POC - Card Management System

A complete proof-of-concept demonstrating a card management system integrated with Lithic's sandbox API. This POC includes user management, role-based access control, card creation, and spending profiles.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for Supabase)
- npm or yarn

### Setup Instructions

1. **Clone and Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Start Supabase (requires Docker)**
```bash
cd backend
npx supabase start
```

3. **Run Database Migrations**
```bash
# Apply the database schema
psql postgresql://postgres:postgres@localhost:54322/postgres < src/config/database.sql
```

4. **Start the Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

5. **Start the Frontend**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## 📋 POC Flow

### 1. Admin CRM Login
- Navigate to http://localhost:3000
- Login with email: `admin` (no password required)
- Create a new business account with owner details

### 2. Owner Login
- Logout from admin
- Login with the owner email you just created
- You'll see the Owner Dashboard with full access

### 3. Create Users (as Owner)
- Go to Users menu
- Create the following users:
  - Seth (Admin role)
  - Gabriel (User role)
  - Nathalia (User role)
  - Lindsey (User role)

### 4. Create Cards for Owner and Seth
- Go to All Cards menu
- Create a debit card for yourself (owner)
- Create a debit card for Seth

### 5. Login as Seth
- Logout and login as Seth
- You'll see the Admin Dashboard (limited permissions)

### 6. Create Reloadable Card for Gabriel (as Seth)
- Go to All Cards menu
- Create a reloadable card for Gabriel

### 7. Create Spending Profile
- Go to Spending Profiles menu
- Create a profile with custom limits and restrictions

### 8. Create Card for Nathalia with Profile
- Go to All Cards menu
- Create a card for Nathalia
- Select the spending profile you just created

### 9. View Users and Cards
- Navigate through Users and All Cards to see all details
- Each user can login and view their own cards in "My Cards"

## 🏗️ Architecture

### Backend (Node.js + Express)
- RESTful API with JWT authentication
- Lithic API integration for card management
- Supabase/PostgreSQL for data persistence
- Role-based access control (Owner, Admin, User)

### Frontend (React + Vite)
- Simple grayscale UI with Tailwind CSS
- Role-based dashboard views
- Real-time Lithic integration

### Database Schema
- **accounts** - Business accounts
- **users** - User accounts with roles
- **cards** - Card records linked to users
- **spending_profiles** - Reusable spending limit templates
- **card_transactions** - Transaction history (for demo)

## 🔑 Key Features

### Authentication
- Simple email-based login (no passwords for POC)
- JWT token-based sessions
- Role-based access control

### User Management
- Owner can create Admin and User accounts
- Admin can create User accounts only
- Each user gets a Lithic account holder ID

### Card Management
- Virtual, Physical, and Reloadable card types
- Cards linked to Lithic API
- Custom spending limits per card
- Spending profiles for reusable limits

### Spending Profiles
- Create templates with spending rules
- Daily, Monthly, and Per-Transaction limits
- MCC category restrictions
- Apply profiles to multiple cards

## 🛠️ Environment Variables

Backend `.env` file:
```
PORT=3001
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
LITHIC_API_KEY=595234f1-968e-4fad-b308-41f6e19bc93f
LITHIC_API_URL=https://sandbox.lithic.com/v1
JWT_SECRET=lithic-poc-secret-key-2024
```

## 📝 Notes

- This is a POC - no password authentication for simplicity
- All Lithic operations use the sandbox environment
- Database resets when Supabase restarts
- Cards created in Lithic sandbox are for testing only

## 🎯 Success Criteria

The POC demonstrates:
1. ✅ Multi-tenant account structure
2. ✅ Role-based user management
3. ✅ Lithic API integration
4. ✅ Card lifecycle management
5. ✅ Spending profiles and limits
6. ✅ Clean, functional UI
7. ✅ Complete user flow from account creation to card usage