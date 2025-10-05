# Lithic POC - Setup Guide

## Prerequisites Installation

### 1. Install Node.js (if not already installed)
```bash
# Check if Node.js is installed
node --version  # Should be 18+

# If not installed, download from: https://nodejs.org/
```

### 2. Install Supabase CLI
```bash
npm install -g supabase
```

## Step-by-Step Setup

### Step 1: Initialize Supabase

```bash
cd backend
supabase init
```

This creates a `supabase` folder with configuration files.

### Step 2: Start Supabase

```bash
supabase start
```

**Important**: This will output credentials. Save them! You'll see:
- API URL: http://127.0.0.1:54321
- Studio URL: http://127.0.0.1:54323
- Anon key: (long string)
- Service role key: (long string)

### Step 3: Setup Database Schema

**Option A - Using Supabase Studio (Recommended)**:
1. Open http://127.0.0.1:54323 in your browser
2. Click on "SQL Editor" in the left menu
3. Open `backend/database-schema.sql` in a text editor
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click "Run" button

**Option B - Using Migration Files**:
```bash
# Still in backend directory
mkdir -p supabase/migrations
cp database-schema.sql supabase/migrations/20240101000000_initial_schema.sql
supabase db reset
```

### Step 4: Install Backend Dependencies

```bash
# Still in backend directory
npm install
```

### Step 5: Verify Backend Configuration

Check `backend/.env` file exists and has:
```
PORT=3001
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
LITHIC_API_KEY=595234f1-968e-4fad-b308-41f6e19bc93f
LITHIC_ENVIRONMENT=sandbox
JWT_SECRET=your-secret-key-change-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@123
```

### Step 6: Start Backend Server

```bash
# In backend directory
npm start
```

You should see:
```
✅ Server running on http://localhost:3001
✅ Health check: http://localhost:3001/health
✅ API endpoints: http://localhost:3001/api
```

### Step 7: Install Frontend Dependencies

Open a NEW terminal window:

```bash
cd frontend
npm install
```

### Step 8: Start Frontend

```bash
# In frontend directory
npm start
```

Browser should automatically open to http://localhost:3000

## Verification Checklist

✅ **Backend Running**: Visit http://localhost:3001/health - should return `{"status":"ok",...}`

✅ **Frontend Running**: Visit http://localhost:3000 - should see login page

✅ **Supabase Running**: Visit http://127.0.0.1:54323 - should see Supabase Studio

✅ **Database Tables**: In Supabase Studio, check "Table Editor" - should see:
- accounts
- users  
- cards
- spending_profiles
- sessions

## Troubleshooting

### Supabase won't start
```bash
# Stop all Docker containers
supabase stop

# Start fresh
supabase start
```

### Port already in use
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Database schema not loaded
1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to SQL Editor
3. Run the schema manually from `backend/database-schema.sql`

### Cannot connect to backend
1. Check backend is running: `curl http://localhost:3001/health`
2. Check backend logs for errors
3. Verify `.env` file is correct

### Lithic API errors
- Check internet connection (Lithic is external)
- Verify API key in `.env` is correct
- Check Lithic sandbox status

## Quick Start (After First Setup)

Once everything is set up once, you can start quickly:

### Terminal 1 - Backend
```bash
cd backend
supabase start  # If not already running
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Or use the provided script:
```bash
./start.sh
```

## Next: Complete the Flow

Once everything is running, follow the flow in the main README.md:
1. Login as admin
2. Create MSD Cafe account
3. Login as owner
4. Create users
5. Create cards
6. Create spending profiles
7. View all data

## Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| `command not found: supabase` | Install Supabase CLI: `npm install -g supabase` |
| Tables don't exist | Run database schema in Supabase Studio |
| Backend won't start | Check if port 3001 is free, verify .env file |
| Frontend can't connect | Ensure backend is running on port 3001 |
| Lithic errors | Check API key and internet connection |

## Success!

If you see:
- ✅ Login page at http://localhost:3000
- ✅ Backend API responding at http://localhost:3001
- ✅ Database tables visible in Supabase Studio

You're ready to go! 🎉

Proceed to the main README.md for the complete flow walkthrough.
