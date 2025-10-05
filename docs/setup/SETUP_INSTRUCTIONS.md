# Lithic POC - Complete Setup Instructions

## 🚀 Quick Start Guide

Follow these steps to get your Lithic POC up and running with the complete test scenario.

## Prerequisites

- **Node.js 18+** installed
- **Docker** installed and running
- **Supabase CLI** installed
- **Postman** installed
- **Git** (for cloning if needed)

## Step 1: Install Supabase CLI

Choose your platform:

### macOS
```bash
brew install supabase/tap/supabase
```

### Windows (with Scoop)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Linux
```bash
curl -o- https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

### Alternative (npm)
```bash
npm install -g supabase
```

## Step 2: Project Setup

1. **Navigate to project directory:**
```bash
cd lithic-poc
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp env.example .env
```

## Step 3: Start Supabase

1. **Initialize and start Supabase:**
```bash
supabase start
```

2. **Copy the output keys to your `.env` file:**
```env
# Update these with actual values from supabase start output
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-actual-anon-key-from-output
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-from-output
```

3. **Verify database schema was applied:**
   - Open Supabase Studio: http://localhost:54323
   - Check that tables are created with sample data

## Step 4: Start the API Server

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Lithic API connection successful
🚀 Lithic POC API server running on port 3000
📚 Environment: development
🏥 Health check: http://localhost:3000/health
📖 API docs: See LITHIC_POC_DOCUMENTATION.md
```

## Step 5: Verify System Health

Visit: http://localhost:3000/health

You should see:
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "lithic_api": "healthy"
  }
}
```

## Step 6: Import Postman Collection

1. **Open Postman**
2. **Click "Import"**
3. **Select file:** `Lithic_POC_Corrected_Flow.postman_collection.json`
4. **Create new environment called "Lithic POC Local"**
5. **Set environment variables:**
   - `base_url`: `http://localhost:3000/api`
   - `lithic_api_key`: `595234f1-968e-4fad-b308-41f6e19bc93f`

## Step 7: Run the Complete Test Scenario

### 🎯 Corrected Test Scenario Flow

**Phase 1: Foundation Setup**
1. **Login as Admin** → Get authentication token
2. **Create Eric Medina (Owner)** → Creates Lithic account holder
3. **Create MSD Cafe Business Account** → Creates Lithic financial account

**Phase 2: User Hierarchy (Following RBAC)**
4. **Login as Eric (Owner)** → Switch context
5. **Eric creates Seth (Super Admin)** → Owner privilege
6. **Create Seth's Personal Account** → For his card
7. **Login as Seth (Super Admin)** → Switch context
8. **Seth creates Gabriel (Admin)** → Super admin privilege
9. **Create Gabriel's Personal Account** → For his card
10. **Login as Gabriel (Admin)** → Switch context
11. **Gabriel creates Nathalia (User)** → Admin privilege
12. **Gabriel creates Lindsey (Analyst)** → Admin privilege
13. **Create Nathalia's Personal Account** → For her card

**Phase 3: Card Creation (Following Hierarchy)**
14. **Eric creates debit card for himself** → Business account, high limits
15. **Eric creates debit card for Seth** → Personal account, moderate limits
16. **Seth creates reloadable card for Gabriel** → Prepaid type
17. **Gabriel creates spending profile** → For Nathalia's limits
18. **Gabriel creates limit-based card for Nathalia** → With spending profile

**Phase 4: Validation**
19. **Test card operations** → Lock/unlock functionality
20. **Verify RBAC** → Lindsey card creation blocked
21. **System health check** → Lithic integration confirmed

### 🏃‍♂️ Run the Tests

1. **Select the "Lithic POC Local" environment**
2. **Run the collection in order** (phases must be sequential):
   - 🔐 **Phase 1: Foundation Setup**
   - 👥 **Phase 2: User Hierarchy Creation** 
   - 💳 **Phase 3: Card Creation Flow**
   - 🔍 **Phase 4: Validation & Testing**

### Expected Results:
- ✅ **Proper account creation flow:** Account holder → Financial account → Cards
- ✅ **RBAC hierarchy working:** Owner → Super Admin → Admin → User/Analyst
- ✅ **Lithic integration functional:** All API calls to sandbox successful
- ✅ **Card types distributed correctly:** Debit, prepaid, limit-based cards
- ✅ **Spending profiles integrated:** Custom limits via Lithic auth rules
- ✅ **Permission validation:** Analyst role blocked from card creation
- ✅ **Card operations working:** Lock/unlock, status management
- ✅ **System health confirmed:** Database and Lithic API connectivity

## Step 8: Explore the System

### Supabase Studio (Database)
- **URL:** http://localhost:54323
- **View:** All tables, data, and relationships
- **Monitor:** Real-time data changes

### API Documentation
- **File:** `LITHIC_POC_DOCUMENTATION.md`
- **Contains:** All 32 API endpoints with examples

### Business Rules
- **File:** `BUSINESS_RULES.md`
- **Contains:** Complete business logic and constraints

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3000  # API server
lsof -i :54321 # Supabase API
lsof -i :54322 # PostgreSQL
lsof -i :54323 # Supabase Studio

# Kill processes if needed
kill -9 <PID>
```

2. **Database Connection Issues**
```bash
# Reset Supabase completely
supabase stop
supabase start
```

3. **Missing Environment Variables**
```bash
# Check your .env file has all required variables
cat .env
```

4. **Lithic API Connection Failed**
- Verify the API key: `595234f1-968e-4fad-b308-41f6e19bc93f`
- Check internet connectivity
- Verify sandbox environment access

### Reset Everything
```bash
# Stop all services
npm run supabase:stop
pkill -f "node.*lithic-poc"

# Clean start
supabase start
npm run dev
```

## 🎯 Success Criteria

After completing the setup, you should have:

✅ **System Running:**
- API server on port 3000
- Supabase on ports 54321-54323
- Health check returning "healthy"

✅ **Test Data Created:**
- 6 users (admin + 5 Medina family)
- 5 accounts (1 business + 4 personal)  
- 2 spending profiles
- 4 cards (Lindsey's blocked correctly)

✅ **Features Working:**
- Authentication with JWT
- Role-based access control
- Card creation and management
- Spending profile assignment
- Card status changes (lock/unlock)
- Lithic API integration

✅ **RBAC Validated:**
- Users can only access their own data
- Admins can manage lower-level users
- Analysts have read-only access
- Proper permission blocking

## 🚀 Next Steps

1. **Explore the API** using Postman
2. **Review the code** in `/src` directory
3. **Modify test data** as needed
4. **Add new features** following the established patterns
5. **Deploy to production** when ready

## 📞 Support

If you encounter issues:

1. **Check logs** in the terminal running the API
2. **Review Postman test results** for specific errors
3. **Check Supabase Studio** for database state
4. **Verify environment variables** are set correctly

The system is now ready for your complete Lithic POC testing! 🎉
