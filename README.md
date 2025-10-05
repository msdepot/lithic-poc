# Lithic POC - Full Stack Card Issuing Platform

A complete proof-of-concept for a card issuing platform using Lithic's sandbox API.

## 🚀 **START HERE**

### Quick Start (2 Commands)

```bash
# 1. Install dependencies (first time only)
npm install && cd frontend && npm install && cd ..

# 2. Start the application
npm run dev
```

**Then open:** http://localhost:3000

**For detailed testing steps, see:** [START_HERE.md](START_HERE.md) or [QUICK_START.md](QUICK_START.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Lithic sandbox API key configured in `.env` (already set up)

### Installation & Setup

**Option 1: Quick Start (SQLite - No Docker needed)**

1. **Install dependencies**:
```bash
npm install && cd frontend && npm install && cd ..
```

2. **Start the application**:
```bash
npm run dev
```

The application will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Database**: SQLite (database.sqlite)

**Option 2: With PostgreSQL/Supabase**

If you have PostgreSQL or Supabase running:

1. Edit `.env` and uncomment PostgreSQL settings
2. Run setup and start as above

## 📋 Complete Flow Test

### Step 1: Admin CRM - Create Account

1. Go to http://localhost:3000
2. Click **Admin CRM** tab
3. Login with:
   - Username: `admin`
   - Password: `admin@123`
4. Create MSD Cafe account:
   - Business Name: `MSD Cafe`
   - Owner Email: `eric@msdcafe.com`
   - Owner First Name: `Eric`
   - Owner Last Name: `Medina`
   - Owner Phone: `+15555551234`
5. **Note the Account ID** from success message
6. Fund the account:
   - Account ID: (use the ID from step 5)
   - Amount: `15000`
7. Logout

### Step 2: Login as Owner (Eric)

1. Click **User Login** tab
2. Enter email: `eric@msdcafe.com`
3. You're now logged in as Eric (Owner)

### Step 3: Create Users

Create the following users (all with phone: +15555552XXX where XXX is unique):

1. **Seth Medina**
   - Email: `seth@msdcafe.com`
   - Role: Admin
   - Phone: `+15555552001`

2. **Gabriel Medina**
   - Email: `gabriel@msdcafe.com`
   - Role: User
   - Phone: `+15555552002`

3. **Nathalia Medina**
   - Email: `nathalia@msdcafe.com`
   - Role: User
   - Phone: `+15555552003`

4. **Lindsey Medina**
   - Email: `lindsey@msdcafe.com`
   - Role: Analyst
   - Phone: `+15555552004`

### Step 4: Create Cards for Eric and Seth

1. Navigate to **Create Card**
2. Create debit card for Eric:
   - User: Eric Medina
   - Card Type: Debit Card
   - Spend Limit: (optional)
3. Create debit card for Seth:
   - User: Seth Medina
   - Card Type: Debit Card
4. Logout

### Step 5: Login as Seth

1. Login with email: `seth@msdcafe.com`

### Step 6: Create Reloadable Card for Gabriel

1. Navigate to **Create Card**
2. Create card:
   - User: Gabriel Medina
   - Card Type: Reloadable Card

### Step 7: Create Spending Profile

1. Navigate to **Create Spending Profile**
2. Create profile:
   - Name: `Basic User Spending`
   - Description: `Limited spending for regular users`
   - Spend Limit: `500`
   - Spend Limit Duration: Monthly
   - Blocked Categories: `7995, 7011` (gambling, hotels)

### Step 8: Create Card with Spending Profile

1. Navigate to **Create Card**
2. Create card for Nathalia:
   - User: Nathalia Medina
   - Card Type: Debit Card
   - Spending Profile: Basic User Spending

### Step 9: View Lists

1. Navigate to **User List** - See all 5 users with their details
2. Navigate to **Card List** - See all cards with spending limits and profiles

## 🎯 Key Features Demonstrated

- ✅ Admin CRM for account onboarding
- ✅ Passwordless user login (email only)
- ✅ Role-based access control (Owner, Admin, User, Analyst)
- ✅ Lithic account holder creation
- ✅ Multiple card types (debit, reloadable)
- ✅ Custom spending profiles
- ✅ Spending limits and restrictions
- ✅ Complete user and card management

## 🔧 Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (can easily switch to PostgreSQL/Supabase)
- **Frontend**: React with simple grayscale UI
- **Card Provider**: Lithic Sandbox API
- **Authentication**: JWT

## 📝 Key Features

- ✅ This is a POC - no passwords for user accounts (only email)
- ✅ Uses Lithic sandbox environment with real API integration
- ✅ Simple grayscale UI focused on functionality
- ✅ All data persists in SQLite database
- ✅ Complete role-based access control
- ✅ Full card lifecycle management
- ✅ Custom spending profiles and limits

## 📚 Documentation

See **[QUICK_START.md](QUICK_START.md)** for detailed step-by-step testing guide.
