# 🚀 START HERE - Lithic POC

## 🎉 Welcome!

You now have a **complete, working card issuing platform** built from scratch! This POC demonstrates a real-world integration with Lithic's sandbox API.

## 📦 What You Have

✅ **Backend API** (Node.js + Express)  
✅ **Frontend UI** (React with grayscale design)  
✅ **Database** (SQLite - zero configuration needed)  
✅ **Lithic Integration** (Real sandbox API)  
✅ **Complete Flow** (Admin CRM → Users → Cards → Profiles)

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies (First Time Only)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Start the Application

```bash
npm run dev
```

This starts both backend and frontend:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### Step 3: Test the Complete Flow

Open http://localhost:3000 and follow the testing guide below.

---

## 🎯 Complete Test Flow (10 minutes)

### Test 1: Admin CRM (2 min)

1. Click **"Admin CRM"** tab
2. Login: `admin` / `admin@123`
3. Create account:
   - Business: **MSD Cafe**
   - Owner Email: **eric@msdcafe.com**
   - First Name: **Eric**
   - Last Name: **Medina**
   - Phone: **+15555551234**
4. Fund account: **ID: 1, Amount: 15000**
5. Logout

### Test 2: Owner Login (2 min)

1. Click **"User Login"** tab
2. Login: **eric@msdcafe.com**
3. Create these users:

| Name     | Email              | Role    | Phone         |
|----------|-------------------|---------|---------------|
| Seth     | seth@msdcafe.com  | Admin   | +15555552001  |
| Gabriel  | gabriel@msdcafe.com | User  | +15555552002  |
| Nathalia | nathalia@msdcafe.com | User | +15555552003  |
| Lindsey  | lindsey@msdcafe.com | Analyst | +15555552004 |

### Test 3: Create Cards as Eric (2 min)

1. Click **"Create Card"**
2. Create Eric's card: **Debit, $5000/month**
3. Create Seth's card: **Debit, $2000/month**
4. Logout

### Test 4: Login as Seth (2 min)

1. Login: **seth@msdcafe.com**
2. Create Gabriel's card: **Reloadable, $500/month**

### Test 5: Create Spending Profile (1 min)

1. Click **"Create Spending Profile"**
2. Create profile:
   - Name: **Basic User Spending**
   - Limit: **$500/month**
   - Blocked: **7995, 7011** (gambling, hotels)

### Test 6: Create Card with Profile (1 min)

1. Click **"Create Card"**
2. Create Nathalia's card: **Debit with "Basic User Spending" profile**

### Test 7: View Everything (2 min)

1. Click **"User List"** → See 5 users
2. Click **"Card List"** → See 4 cards with details

---

## ✅ What You Just Demonstrated

🎯 **Admin CRM** - Created business account via Lithic API  
🎯 **User Management** - Created 5 users with different roles  
🎯 **Card Issuing** - Created 4 cards via Lithic sandbox  
🎯 **Spending Limits** - Applied different limits per card  
🎯 **Spending Profiles** - Created reusable restriction template  
🎯 **Complete Platform** - Full working card issuing system  

---

## 📚 Documentation

- **[README.md](README.md)** - Project overview and setup
- **[QUICK_START.md](QUICK_START.md)** - Detailed step-by-step guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Technical architecture

---

## 🔧 Troubleshooting

**Can't install dependencies?**
```bash
# Try cleaning and reinstalling
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install
```

**Port already in use?**
```bash
# Edit .env and change PORT to different number
# Then restart: npm run dev
```

**Database issues?**
```bash
# Just delete and restart (will recreate)
rm database.sqlite
npm run dev
```

**Backend won't start?**
```bash
# Make sure you're in the workspace directory
cd /workspace
npm run server
```

**Frontend won't start?**
```bash
cd frontend
npm start
```

---

## 🎨 UI Features

The UI is intentionally simple and grayscale to focus on functionality:

- **Left Sidebar Navigation** - Easy access to all features
- **Role-Based Menus** - Different options based on user role
- **Clean Tables** - User and card lists with all details
- **Simple Forms** - Easy data entry for all operations
- **Error/Success Messages** - Clear feedback on all actions

---

## 🔑 Login Credentials

**Admin CRM:**
- Username: `admin`
- Password: `admin@123`

**Users (after creation):**
- Just enter email (no password needed for POC)
- Examples: `eric@msdcafe.com`, `seth@msdcafe.com`

---

## 🚀 What Makes This Special?

1. ✅ **Real Lithic Integration** - Not mocked, uses actual sandbox API
2. ✅ **Complete Full Stack** - Backend + Frontend + Database
3. ✅ **Production Patterns** - Scalable, maintainable architecture
4. ✅ **Role-Based Access** - Proper permission system
5. ✅ **Zero Configuration** - SQLite needs no setup
6. ✅ **Easy Testing** - Complete flow in 10 minutes

---

## 📊 Database

The SQLite database (`database.sqlite`) stores:

- **accounts** - Business accounts
- **users** - All users with roles
- **cards** - All cards with limits
- **spending_profiles** - Custom restriction templates

All data persists across restarts. Delete the file to start fresh.

---

## 🌟 Next Steps

Want to enhance this POC? Consider adding:

- Transaction history
- Real-time webhooks
- Card activation/deactivation
- More spending profile options
- Dashboard analytics
- Export/reporting
- User password authentication

---

## 💡 Key Concepts Demonstrated

### 1. Multi-Tenant Architecture
Each business account is isolated with its own users and cards.

### 2. Role-Based Access Control (RBAC)
- **Owner** - Full control
- **Admin** - User and card management
- **User** - Limited access
- **Analyst** - Read-only

### 3. Card Lifecycle
- Creation via Lithic API
- Spending limit enforcement
- Profile-based restrictions
- Status management

### 4. Spending Profiles
- Reusable restriction templates
- Merchant category controls
- Spending limits
- Duration-based limits

---

## 🎯 Success!

You have successfully built and tested a complete card issuing platform! 🎉

This POC proves that you can:
- Integrate with Lithic's API
- Manage users and permissions
- Issue cards with restrictions
- Build a full-stack fintech application

**Ready to start?** Run `npm run dev` and open http://localhost:3000

---

**Built with ❤️ - A complete Lithic card issuing POC**
