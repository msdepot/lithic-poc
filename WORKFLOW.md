# 🔄 Lithic POC - Testing Workflow

This document describes the **step-by-step workflow** for testing the complete Lithic POC functionality. This is the testing checklist referenced in the Linear issue MSD-5.

## ⚡ Quick Setup

Before starting the workflow, ensure the application is running:

```bash
# Install dependencies (first time only)
npm install && cd frontend && npm install && cd ..

# Start the application
npm run dev
```

**Application URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📋 Complete Testing Workflow

### Step 1: Login to Admin (CRM)

**Purpose:** Create an account with the owner via Lithic API

1. Open http://localhost:3000
2. Click **"Admin CRM"** tab
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
5. **Fund Account:**
   - Account ID: `1` (from success message)
   - Amount: `15000`
   - Click "Fund Account"

**Result:** ✅ MSD Cafe account created with Eric as owner

---

### Step 2: Logout and Login as Owner

**Purpose:** Switch from admin to owner account

1. Click **"Logout"** button
2. Click **"User Login"** tab
3. **Login:**
   - Email: `eric@msdcafe.com`
4. You should see the MSD Cafe dashboard with Eric Medina (Owner role)

**Result:** ✅ Logged in as Eric (owner)

---

### Step 3: As Owner, Create Other Users

**Purpose:** Create seth, gabriel, nathalia, and lindsey

Click **"Create User"** in the left menu and create each user:

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

**Result:** ✅ Four users created (Seth, Gabriel, Nathalia, Lindsey)

---

### Step 4: Give Owner and Seth Debit Cards

**Purpose:** Create debit cards for owner and admin

Still logged in as Eric, click **"Create Card"** and create:

**Card 1: Eric's Business Debit Card**
- User: `Eric Medina`
- Card Type: `Debit Card`
- Spend Limit: `5000` (optional)
- Spend Limit Duration: `Monthly`
- Click "Create Card"

**Card 2: Seth's Debit Card**
- User: `Seth Medina`
- Card Type: `Debit Card`
- Spend Limit: `2000` (optional)
- Spend Limit Duration: `Monthly`
- Click "Create Card"

**Result:** ✅ Debit cards created for Eric and Seth

---

### Step 5: Logout and Login as Seth

**Purpose:** Switch to Seth's account

1. Click **"Logout"** button
2. **Login:**
   - Email: `seth@msdcafe.com`
3. You should see the dashboard with Seth Medina (Admin role)

**Result:** ✅ Logged in as Seth (admin)

---

### Step 6: As Seth, Give Reloadable Card to Gabriel

**Purpose:** Create a reloadable card for Gabriel

1. Click **"Create Card"**
2. **Create Gabriel's Reloadable Card:**
   - User: `Gabriel Medina`
   - Card Type: `Reloadable Card`
   - Spend Limit: `500` (optional)
   - Spend Limit Duration: `Monthly`
   - Click "Create Card"

**Result:** ✅ Reloadable card created for Gabriel

---

### Step 7: Create Spending Profile

**Purpose:** Create custom spending rules saved in database and attached via Lithic API

1. Click **"Create Spending Profile"**
2. **Create Profile:**
   - Profile Name: `Basic User Spending`
   - Description: `Limited spending for regular users - no gambling or hotels`
   - Spend Limit: `500`
   - Spend Limit Duration: `Monthly`
   - Blocked Categories: `7995, 7011` (gambling, hotels)
   - Click "Create Spending Profile"

**Result:** ✅ Spending profile created with custom rules

**What happens behind the scenes:**
- Custom rules are saved in our database
- Lithic API is called to create an auth rule
- This profile can now be attached to multiple cards

---

### Step 8: Create Card for Nathalia with Profile

**Purpose:** Attach the spending profile to a new card

1. Click **"Create Card"**
2. **Create Nathalia's Card:**
   - User: `Nathalia Medina`
   - Card Type: `Debit Card`
   - Spending Profile: `Basic User Spending` (select from dropdown)
   - Click "Create Card"

**Result:** ✅ Nathalia's card created with spending restrictions

---

### Step 9: View User List and Card List

**Purpose:** See all users and cards with complete details

1. Click **"User List"**
   - Should display 5 users:
     - Eric Medina (Owner)
     - Seth Medina (Admin)
     - Gabriel Medina (User)
     - Nathalia Medina (User)
     - Lindsey Medina (Analyst)
   - Shows: Email, Role, Phone, Card Count, Status

2. Click **"Card List"**
   - Should display 4 cards:
     - Eric's debit card ($5000/month)
     - Seth's debit card ($2000/month)
     - Gabriel's reloadable card ($500/month)
     - Nathalia's debit card (with spending profile)
   - Shows: Card type, Last 4 digits, User, Limits, Profile

**Result:** ✅ Complete visibility of all users and cards

---

## ✅ Workflow Complete!

You have successfully tested the complete workflow:

- ✅ **Step 1:** Admin created account with owner
- ✅ **Step 2:** Logged out and logged in as owner
- ✅ **Step 3:** Owner created 4 users
- ✅ **Step 4:** Created debit cards for owner and Seth
- ✅ **Step 5:** Logged out and logged in as Seth
- ✅ **Step 6:** Seth created reloadable card for Gabriel
- ✅ **Step 7:** Created spending profile with custom rules
- ✅ **Step 8:** Created card with spending profile for Nathalia
- ✅ **Step 9:** Viewed complete user and card lists

---

## 🔑 Key Points

### Authentication (No Passwords)
- **Admin CRM:** Uses username/password (`admin`/`admin@123`)
- **Users:** Email-only login (no password required for POC)
- This is intentional for POC simplicity

### Roles & Permissions
- **Owner:** Full control of the account
- **Admin:** Can create users and cards
- **User:** Limited access (can view own cards)
- **Analyst:** Read-only access

### Spending Profiles
Spending profiles are **reusable templates** that:
1. Store custom rules in our database
2. Create auth rules via Lithic API
3. Can be attached to multiple cards
4. Include spend limits, durations, and merchant category controls

---

## 🐛 Troubleshooting

**If something doesn't work:**

1. **Check backend is running:**
   ```bash
   # Should show server logs
   npm run server
   ```

2. **Check frontend is running:**
   ```bash
   cd frontend && npm start
   ```

3. **Reset database:**
   ```bash
   rm database.sqlite
   npm run dev
   ```

4. **Check browser console for errors**

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview and quick start
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture
- **[docs/API.md](docs/API.md)** - API endpoints documentation
- **[docs/FEATURES.md](docs/FEATURES.md)** - Feature descriptions

---

**Estimated Time:** 10-15 minutes for complete workflow

**Ready to test?** → `npm run dev` and follow the steps above!
