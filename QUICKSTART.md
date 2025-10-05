# 🚀 Lithic POC - Quick Start

**Goal**: Get the POC running in under 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ Internet connection (for Lithic API)

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 2: Setup Backend

```bash
cd backend
npm install
supabase init
supabase start
```

**Wait for Supabase to start.** You'll see output like:
```
Started supabase local development setup.
API URL: http://127.0.0.1:54321
Studio URL: http://127.0.0.1:54323
```

## Step 3: Setup Database

1. Open http://127.0.0.1:54323 in your browser
2. Click "SQL Editor" in left menu
3. Open `backend/database-schema.sql` file
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click "Run"

✅ You should see "Success. No rows returned"

## Step 4: Start Backend

```bash
# In backend directory
npm start
```

You should see:
```
✅ Server running on http://localhost:3001
```

## Step 5: Setup Frontend

**Open a NEW terminal:**

```bash
cd frontend
npm install
npm start
```

Browser should open automatically to http://localhost:3000

## ✅ Verify Everything Works

Open these URLs:

1. **Frontend**: http://localhost:3000 - Should see login page
2. **Backend**: http://localhost:3001/health - Should see `{"status":"ok"}`
3. **Supabase**: http://127.0.0.1:54323 - Should see database tables

## 🎮 Test the Flow

### 1. Login as Admin
- Username: `admin`
- Password: `admin@123`

### 2. Create Account
- Business Name: `MSD Cafe`
- Owner Name: `Eric Medina`
- Owner Email: `eric@msdcafe.com`
- Initial Balance: `15000`
- Click "Create Account"

### 3. Logout and Login as Owner
- Logout from admin
- Login with: `eric@msdcafe.com`

### 4. Create Users
- Click "Create User"
- Create:
  - Seth Medina - seth@msdcafe.com - Admin
  - Gabriel Medina - gabriel@msdcafe.com - User
  - Nathalia Medina - nathalia@msdcafe.com - User
  - Lindsey Medina - lindsey@msdcafe.com - Analyst

### 5. Create Cards
- Click "Create Card"
- Create debit card for yourself (Eric)
- Create debit card for Seth

### 6. Login as Seth
- Logout
- Login with: `seth@msdcafe.com`

### 7. Create More Cards
- Create reloadable card for Gabriel

### 8. Create Spending Profile
- Click "Create Spending Profile"
- Name: `Basic User Limits`
- Daily Limit: `500`
- Monthly Limit: `5000`

### 9. Create Card with Profile
- Click "Create Card"
- Select Nathalia
- Select "Basic User Limits" profile
- Create card

### 10. View Everything
- Click "View Users" - See all 5 users
- Click "View Cards" - See all 4 cards

## 🎉 Done!

You now have a fully working card issuing platform!

**What you built:**
- ✅ Multi-tenant account system
- ✅ User management with roles
- ✅ Card issuance integrated with Lithic
- ✅ Spending limit controls
- ✅ Complete visibility

## 🐛 Problems?

### Supabase won't start
```bash
supabase stop
supabase start
```

### Port in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Tables not found
- Go to http://127.0.0.1:54323
- Run the SQL from `database-schema.sql` again

### Can't connect to backend
- Check backend is running
- Visit http://localhost:3001/health
- Check for errors in terminal

## 📚 More Info

- Full documentation: See `README.md`
- Detailed setup: See `SETUP_GUIDE.md`
- Testing guide: See `TESTING_FLOW.md`

---

**That's it!** Your Lithic POC is ready to demo! 🚀
