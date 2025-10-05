# 🚀 Lithic POC - Quick Start Guide

## Complete End-to-End Flow

### 🎯 Goal
Demonstrate a complete card issuing platform where:
1. Admin creates business accounts
2. Business owners manage users
3. Users get cards with different types and spending limits
4. Spending profiles control card restrictions

---

## Setup (One Time)

```bash
# Install all dependencies
npm install
cd frontend && npm install && cd ..

# Start the application
npm run dev
```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📋 Complete Test Flow

### Phase 1: Admin CRM - Create MSD Cafe Account

1. **Open** http://localhost:3000
2. **Switch to "Admin CRM" tab**
3. **Login:**
   - Username: `admin`
   - Password: `admin@123`
4. **Create Account:**
   - Business Name: `MSD Cafe`
   - Owner Email: `eric@msdcafe.com`
   - Owner First Name: `Eric`
   - Owner Last Name: `Medina`
   - Owner Phone: `+15555551234`
   - Click "Create Account"
   - **Save the Account ID** from success message
5. **Fund Account:**
   - Account ID: `1` (or the ID from step 4)
   - Amount: `15000`
   - Click "Fund Account"
6. **Logout**

---

### Phase 2: Owner Login - Create Family Members

1. **Switch to "User Login" tab**
2. **Login:**
   - Email: `eric@msdcafe.com`
3. **You should see:** MSD Cafe dashboard with Eric Medina (owner role)

4. **Create Users** (Click "Create User" in left menu):

   **User 1: Seth (Admin)**
   - Email: `seth@msdcafe.com`
   - First Name: `Seth`
   - Last Name: `Medina`
   - Role: `Admin`
   - Phone: `+15555552001`

   **User 2: Gabriel (User)**
   - Email: `gabriel@msdcafe.com`
   - First Name: `Gabriel`
   - Last Name: `Medina`
   - Role: `User`
   - Phone: `+15555552002`

   **User 3: Nathalia (User)**
   - Email: `nathalia@msdcafe.com`
   - First Name: `Nathalia`
   - Last Name: `Medina`
   - Role: `User`
   - Phone: `+15555552003`

   **User 4: Lindsey (Analyst)**
   - Email: `lindsey@msdcafe.com`
   - First Name: `Lindsey`
   - Last Name: `Medina`
   - Role: `Analyst`
   - Phone: `+15555552004`

---

### Phase 3: Create Cards for Eric and Seth

1. **Still logged in as Eric**, click "Create Card"

   **Card 1: Eric's Business Debit Card**
   - User: `Eric Medina`
   - Card Type: `Debit Card`
   - Spend Limit: `5000`
   - Spend Limit Duration: `Monthly`
   - Click "Create Card"

   **Card 2: Seth's Debit Card**
   - User: `Seth Medina`
   - Card Type: `Debit Card`
   - Spend Limit: `2000`
   - Spend Limit Duration: `Monthly`
   - Click "Create Card"

2. **Logout**

---

### Phase 4: Seth Login - Create Reloadable Card

1. **Login as Seth:**
   - Email: `seth@msdcafe.com`
2. **Click "Create Card"**

   **Gabriel's Reloadable Card**
   - User: `Gabriel Medina`
   - Card Type: `Reloadable Card`
   - Spend Limit: `500`
   - Spend Limit Duration: `Monthly`
   - Click "Create Card"

---

### Phase 5: Create Spending Profile

1. **Still logged in as Seth**, click "Create Spending Profile"

   **Basic User Spending Profile**
   - Profile Name: `Basic User Spending`
   - Description: `Limited spending for regular users - no gambling or hotels`
   - Spend Limit: `500`
   - Spend Limit Duration: `Monthly`
   - Blocked Categories: `7995, 7011` (gambling, hotels)
   - Click "Create Spending Profile"

---

### Phase 6: Create Card with Spending Profile

1. **Click "Create Card"**

   **Nathalia's Card with Profile**
   - User: `Nathalia Medina`
   - Card Type: `Debit Card`
   - Spending Profile: `Basic User Spending`
   - Click "Create Card"

---

### Phase 7: View Everything

1. **Click "User List"**
   - Should see 5 users: Eric, Seth, Gabriel, Nathalia, Lindsey
   - Shows roles, card counts, status

2. **Click "Card List"**
   - Should see 4 cards:
     - Eric's card (debit, $5000/month)
     - Seth's card (debit, $2000/month)
     - Gabriel's card (reloadable, $500/month)
     - Nathalia's card (debit, with spending profile)
   - Each card shows: Last 4 digits, type, user, spending limits

---

## ✅ Success Criteria

You've successfully demonstrated:

- ✅ **Admin CRM** - Created business account via Lithic API
- ✅ **Account Holder Integration** - Each user has Lithic account holder
- ✅ **Role-Based Access** - Owner, Admin, User, Analyst roles
- ✅ **Multiple Card Types** - Debit and reloadable cards
- ✅ **Spending Limits** - Different limits per card
- ✅ **Spending Profiles** - Reusable restriction templates
- ✅ **Complete Management** - Full user and card visibility

---

## 🔍 Technical Details

**What's Happening Behind the Scenes:**

1. **Lithic Integration:**
   - Every user → Lithic account holder (individual)
   - Account → Lithic financial account (when cards created)
   - Every card → Real Lithic card in sandbox
   - Spending profiles → Lithic auth rules

2. **Database:**
   - SQLite database (`database.sqlite`)
   - Tables: accounts, users, cards, spending_profiles
   - All relationships properly linked

3. **Authentication:**
   - Admin: username/password (for CRM)
   - Users: email only (POC simplicity)
   - JWT tokens for session management

---

## 🐛 Troubleshooting

**Frontend won't start:**
```bash
cd frontend && npm install && npm start
```

**Backend won't start:**
```bash
npm install sqlite3
npm run server
```

**Database issues:**
```bash
rm database.sqlite
npm run server  # Will recreate database
```

**Port conflicts:**
Edit `.env` and change `PORT=3001` to another port

---

## 📊 What Makes This POC Complete?

1. ✅ **Real Lithic Integration** - Not mocked, uses actual sandbox API
2. ✅ **Complete User Lifecycle** - Create, manage, assign cards
3. ✅ **Role-Based Access Control** - Proper permissions by role
4. ✅ **Multiple Card Types** - Different card types for different use cases
5. ✅ **Spending Controls** - Limits and profiles for compliance
6. ✅ **Production Patterns** - Scalable architecture, proper error handling
7. ✅ **Full Stack** - Backend API + React frontend
8. ✅ **Data Persistence** - SQLite database (easy to switch to PostgreSQL)

This POC demonstrates everything needed for a real card issuing platform! 🎉
