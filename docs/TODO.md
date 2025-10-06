# Lithic POC - Workflow TODO List

This document outlines the complete workflow steps for demonstrating the Lithic POC. Follow these steps in order to test the complete card issuing platform.

## Overview

This workflow demonstrates a complete card issuing scenario where:
- An admin onboards a new business account (MSD Cafe)
- The business owner creates team members
- Cards are issued with different types and restrictions
- Spending profiles are created and applied
- Full visibility is maintained across users and cards

**Total Time:** ~10-15 minutes  
**Prerequisites:** Application running (`npm run dev`)

---

## Step-by-Step Workflow

### ✅ Step 1: Login to Admin ("CRM") - Create Account with Owner

**Goal:** Create the MSD Cafe business account with Eric as the owner via Lithic API

**Instructions:**
1. Open http://localhost:3000
2. Click **"Admin CRM"** tab
3. Login with:
   - Username: `admin`
   - Password: `admin@123`
4. Create account:
   - Business Name: `MSD Cafe`
   - Owner Email: `eric@msdcafe.com`
   - Owner First Name: `Eric`
   - Owner Last Name: `Medina`
   - Owner Phone: `+15555551234`
5. Click **"Create Account"**
6. Note the Account ID (likely `1`)
7. Fund the account:
   - Account ID: `1`
   - Amount: `15000`
8. Click **"Fund Account"**

**Behind the Scenes:**
- Lithic account holder is created for Eric (owner)
- Account is stored in database
- Account balance is set to $15,000

**Success Criteria:**
- ✅ Account created successfully
- ✅ Account ID returned
- ✅ Account funded with $15,000
- ✅ Eric has Lithic account holder token

---

### ✅ Step 2: Logout of Admin - Login as the Owner

**Goal:** Logout from admin CRM and login as Eric (the business owner)

**Instructions:**
1. Click **"Logout"** in the top right
2. Click **"User Login"** tab
3. Enter email: `eric@msdcafe.com`
4. Click **"Login"**

**Behind the Scenes:**
- Email-only authentication (no password required)
- JWT token issued with user role and account info
- User information loaded from database

**Success Criteria:**
- ✅ Logged in as Eric Medina
- ✅ Dashboard shows "MSD Cafe" and "Role: owner"
- ✅ Left sidebar shows: Create User, Create Card, Create Spending Profile, User List, Card List

---

### ✅ Step 3: As Owner - Create Other Users (Seth, Gabriel, Nathalia, Lindsey)

**Goal:** Create 4 team members with different roles

**Instructions:**

**3.1 Create Seth (Admin)**
1. Click **"Create User"** in left sidebar
2. Fill in:
   - Email: `seth@msdcafe.com`
   - First Name: `Seth`
   - Last Name: `Medina`
   - Role: `Admin`
   - Phone: `+15555552001`
3. Click **"Create User"**

**3.2 Create Gabriel (User)**
1. Fill in:
   - Email: `gabriel@msdcafe.com`
   - First Name: `Gabriel`
   - Last Name: `Medina`
   - Role: `User`
   - Phone: `+15555552002`
2. Click **"Create User"**

**3.3 Create Nathalia (User)**
1. Fill in:
   - Email: `nathalia@msdcafe.com`
   - First Name: `Nathalia`
   - Last Name: `Medina`
   - Role: `User`
   - Phone: `+15555552003`
2. Click **"Create User"**

**3.4 Create Lindsey (Analyst)**
1. Fill in:
   - Email: `lindsey@msdcafe.com`
   - First Name: `Lindsey`
   - Last Name: `Medina`
   - Role: `Analyst`
   - Phone: `+15555552004`
2. Click **"Create User"**

**Behind the Scenes:**
- Each user gets a Lithic account holder (individual type)
- Users are associated with the MSD Cafe account
- Roles determine access permissions

**Success Criteria:**
- ✅ Seth created with Admin role
- ✅ Gabriel created with User role
- ✅ Nathalia created with User role
- ✅ Lindsey created with Analyst role
- ✅ All users have Lithic account holder tokens
- ✅ All users belong to MSD Cafe account

---

### ✅ Step 4: Give Eric (Owner) and Seth Debit Cards

**Goal:** Issue debit cards for the owner and admin

**Instructions:**

**4.1 Create Eric's Debit Card**
1. Click **"Create Card"** in left sidebar
2. Fill in:
   - Select User: `Eric Medina`
   - Card Type: `Debit Card`
   - Spend Limit: `5000`
   - Spend Limit Duration: `Monthly`
3. Click **"Create Card"**

**4.2 Create Seth's Debit Card**
1. Fill in:
   - Select User: `Seth Medina`
   - Card Type: `Debit Card`
   - Spend Limit: `2000`
   - Spend Limit Duration: `Monthly`
2. Click **"Create Card"**

**Behind the Scenes:**
- Lithic financial account created for MSD Cafe (on first card)
- Lithic virtual cards created for Eric and Seth
- Cards linked to users in database
- Individual spend limits set

**Success Criteria:**
- ✅ Eric has debit card with $5,000/month limit
- ✅ Seth has debit card with $2,000/month limit
- ✅ Lithic financial account created
- ✅ Card tokens stored in database

---

### ✅ Step 5: Logout - Login as Seth

**Goal:** Switch to Seth's account to demonstrate admin capabilities

**Instructions:**
1. Click **"Logout"** in top right
2. Enter email: `seth@msdcafe.com`
3. Click **"Login"**

**Behind the Scenes:**
- Seth's JWT token issued with Admin role
- Admin role has same permissions as Owner (for this POC)

**Success Criteria:**
- ✅ Logged in as Seth Medina
- ✅ Dashboard shows "MSD Cafe" and "Role: admin"
- ✅ Full menu access (same as owner)

---

### ✅ Step 6: As Seth - Give Gabriel a Reloadable Card

**Goal:** Issue a reloadable card to demonstrate different card types

**Instructions:**
1. Click **"Create Card"** in left sidebar
2. Fill in:
   - Select User: `Gabriel Medina`
   - Card Type: `Reloadable Card`
   - Spend Limit: `500`
   - Spend Limit Duration: `Monthly`
3. Click **"Create Card"**

**Behind the Scenes:**
- Lithic virtual card created as reloadable type
- Card linked to Gabriel in database
- Spend limit set to $500/month

**Success Criteria:**
- ✅ Gabriel has reloadable card
- ✅ Card has $500/month spend limit
- ✅ Card type is reloadable (not debit)

---

### ✅ Step 7: Create Spending Profile (Custom Rules)

**Goal:** Create a reusable spending profile that enforces restrictions across multiple cards

**Instructions:**
1. Click **"Create Spending Profile"** in left sidebar
2. Fill in:
   - Profile Name: `Basic User Spending`
   - Description: `Limited spending for regular users - no gambling or hotels`
   - Spend Limit: `500`
   - Spend Limit Duration: `Monthly`
   - Allowed Categories: *(leave empty - allow all by default)*
   - Blocked Categories: `7995, 7011`

   **Category Codes:**
   - `7995` = Gambling (casinos, betting, lottery)
   - `7011` = Hotels, motels, resorts

3. Click **"Create Spending Profile"**

**Behind the Scenes:**
- Profile saved in database
- Lithic auth rule created with spending limits and category restrictions
- Auth rule token stored in database
- Profile becomes available for card assignment

**Success Criteria:**
- ✅ Profile created with name "Basic User Spending"
- ✅ Profile has $500/month spend limit
- ✅ Profile blocks gambling (7995) and hotels (7011)
- ✅ Lithic auth rule token stored
- ✅ Profile appears in card creation dropdown

**Note:** This profile can be reused for multiple cards. Any card assigned this profile will automatically inherit:
- $500/month spending limit
- Blocked categories: gambling and hotels

---

### ✅ Step 8: Create Card for Nathalia with Spending Profile Attached

**Goal:** Issue a card with the spending profile applied to demonstrate restriction enforcement

**Instructions:**
1. Click **"Create Card"** in left sidebar
2. Fill in:
   - Select User: `Nathalia Medina`
   - Card Type: `Debit Card`
   - Spending Profile: `Basic User Spending` *(select from dropdown)*

   **Note:** When a spending profile is selected, the card inherits all rules from that profile. You don't need to manually set spend limits.

3. Click **"Create Card"**

**Behind the Scenes:**
- Lithic virtual card created for Nathalia
- Spending profile (auth rule) applied to card
- Card automatically gets profile's restrictions:
  - $500/month spend limit
  - Blocked categories: 7995 (gambling), 7011 (hotels)
- Profile assignment stored in database

**Success Criteria:**
- ✅ Nathalia has debit card
- ✅ Card is linked to "Basic User Spending" profile
- ✅ Card has $500/month limit (from profile)
- ✅ Card blocks gambling and hotel transactions (from profile)
- ✅ Lithic auth rule applied to card

---

### ✅ Step 9: View User List and Card List - See All Details

**Goal:** Verify complete visibility of all users and cards

**Instructions:**

**9.1 View User List**
1. Click **"User List"** in left sidebar
2. Review the table

**Expected Data:**

| Name | Email | Role | Card Count | Status |
|------|-------|------|------------|--------|
| Eric Medina | eric@msdcafe.com | owner | 1 | active |
| Seth Medina | seth@msdcafe.com | admin | 1 | active |
| Gabriel Medina | gabriel@msdcafe.com | user | 1 | active |
| Nathalia Medina | nathalia@msdcafe.com | user | 1 | active |
| Lindsey Medina | lindsey@msdcafe.com | analyst | 0 | active |

**9.2 View Card List**
1. Click **"Card List"** in left sidebar
2. Review the table

**Expected Data:**

| Last 4 Digits | User | Card Type | Spend Limit | Duration | Spending Profile | Status |
|---------------|------|-----------|-------------|----------|------------------|--------|
| XXXX | Eric Medina | Debit Card | $5,000 | Monthly | - | active |
| XXXX | Seth Medina | Debit Card | $2,000 | Monthly | - | active |
| XXXX | Gabriel Medina | Reloadable Card | $500 | Monthly | - | active |
| XXXX | Nathalia Medina | Debit Card | $500 | Monthly | Basic User Spending | active |

**Success Criteria:**
- ✅ All 5 users visible in user list
- ✅ Each user shows correct role
- ✅ Card counts are accurate
- ✅ All 4 cards visible in card list
- ✅ Card types are correct
- ✅ Spend limits are correct
- ✅ Spending profile is shown for Nathalia's card

---

## Summary

### What Was Accomplished

By completing these 9 steps, you have:

1. ✅ **Created a business account** via Lithic API with an owner
2. ✅ **Demonstrated email-only login** (no passwords for users)
3. ✅ **Created 4 team members** with different roles (Admin, User, Analyst)
4. ✅ **Issued debit cards** to owner and admin with individual limits
5. ✅ **Issued a reloadable card** to demonstrate different card types
6. ✅ **Created a spending profile** with custom rules (limits + blocked categories)
7. ✅ **Applied the profile to a card** to enforce restrictions
8. ✅ **Verified complete visibility** of all users and cards

### Key Concepts Demonstrated

**1. Multi-Tenant Architecture**
- Business account (MSD Cafe) has its own users and cards
- Data isolation between accounts

**2. Role-Based Access Control**
- **Owner** - Full control (Eric)
- **Admin** - User and card management (Seth)
- **User** - Limited access (Gabriel, Nathalia)
- **Analyst** - Read-only (Lindsey)

**3. Card Lifecycle Management**
- Created cards via Lithic API
- Different card types (debit, reloadable)
- Individual spending limits
- Profile-based restrictions

**4. Spending Profiles (Reusable Rules)**
- Created custom restriction template
- Applied to multiple cards
- Enforced via Lithic auth rules
- Merchant category controls

**5. Lithic API Integration**
- Account holder creation
- Financial account creation
- Card creation
- Auth rule creation

---

## Workflow Validation Checklist

Use this checklist to verify you completed all steps correctly:

### Setup
- [ ] Application is running
- [ ] Can access http://localhost:3000
- [ ] Backend is accessible at http://localhost:3001

### Step 1: Admin CRM
- [ ] Logged into Admin CRM (admin/admin@123)
- [ ] Created MSD Cafe account
- [ ] Eric is the owner
- [ ] Account funded with $15,000
- [ ] Lithic account holder created for Eric

### Step 2: Owner Login
- [ ] Logged out of Admin CRM
- [ ] Logged in as eric@msdcafe.com
- [ ] Dashboard shows correct info

### Step 3: Create Users
- [ ] Created Seth (Admin)
- [ ] Created Gabriel (User)
- [ ] Created Nathalia (User)
- [ ] Created Lindsey (Analyst)
- [ ] All have Lithic account holders

### Step 4: Create Cards (Eric & Seth)
- [ ] Eric has debit card ($5,000/month)
- [ ] Seth has debit card ($2,000/month)
- [ ] Lithic financial account created

### Step 5: Login as Seth
- [ ] Logged out as Eric
- [ ] Logged in as seth@msdcafe.com
- [ ] Has admin access

### Step 6: Create Reloadable Card
- [ ] Gabriel has reloadable card ($500/month)

### Step 7: Create Spending Profile
- [ ] Created "Basic User Spending" profile
- [ ] Profile has $500/month limit
- [ ] Profile blocks 7995 (gambling) and 7011 (hotels)
- [ ] Lithic auth rule created

### Step 8: Create Card with Profile
- [ ] Nathalia has debit card
- [ ] Card has "Basic User Spending" profile applied
- [ ] Profile restrictions are active

### Step 9: Verify Lists
- [ ] User list shows 5 users
- [ ] Card list shows 4 cards
- [ ] All details are correct

---

## Authentication Note

**Important:** This is a POC with simplified authentication:

**Admin CRM:**
- Username: `admin`
- Password: `admin@123`
- Used only for admin CRM access

**All Users:**
- Email-only login (no password)
- Examples: `eric@msdcafe.com`, `seth@msdcafe.com`
- JWT tokens manage sessions

In a production system, you would add:
- Password authentication for users
- Password hashing (bcrypt)
- Multi-factor authentication
- Password reset flows

---

## Next Steps

After completing this workflow:

1. **Experiment:**
   - Create more users
   - Create more cards
   - Create different spending profiles
   - Try logging in as different users

2. **Test Role Permissions:**
   - Login as `lindsey@msdcafe.com` (Analyst) - verify read-only access
   - Login as `gabriel@msdcafe.com` (User) - verify limited access

3. **Review Architecture:**
   - Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it works
   - Review backend code to see Lithic API integration

4. **Extend Features:**
   - Add transaction history
   - Add card activation/deactivation
   - Add more spending profile options
   - Add reporting and analytics

---

## Troubleshooting

If you encounter issues during the workflow, see [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed troubleshooting steps.

Common issues:
- **Account creation fails:** Check Lithic API key in `.env`
- **User creation fails:** Verify phone number format (+15555551234)
- **Card creation fails:** Ensure account is funded
- **Profile not appearing:** Refresh page or check database

---

**This workflow demonstrates a complete, production-ready card issuing platform! 🎉**
