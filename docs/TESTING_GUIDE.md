# Lithic POC - Testing Guide

This guide provides complete step-by-step instructions for testing all features of the Lithic POC application.

## Prerequisites

Before testing, ensure:
- Application is running (`npm run dev`)
- Frontend is accessible at http://localhost:3000
- Backend is accessible at http://localhost:3001

## Complete Test Flow

The complete test flow takes approximately **10-15 minutes** and demonstrates:
- Admin CRM account creation
- User management with roles
- Card creation (debit and reloadable)
- Spending profile creation and application
- Complete user and card visibility

---

## Phase 1: Admin CRM - Create Business Account (3 minutes)

### 1.1 Access Admin CRM

1. Open http://localhost:3000
2. Click the **"Admin CRM"** tab
3. You should see the admin login form

### 1.2 Admin Login

**Credentials:**
- Username: `admin`
- Password: `admin@123`

Click **"Login"** button.

**Expected Result:** You should see the Admin CRM Dashboard with options to create and fund accounts.

### 1.3 Create MSD Cafe Account

Fill in the Create Account form:

| Field | Value |
|-------|-------|
| Business Name | `MSD Cafe` |
| Owner Email | `eric@msdcafe.com` |
| Owner First Name | `Eric` |
| Owner Last Name | `Medina` |
| Owner Phone | `+15555551234` |

Click **"Create Account"**.

**Expected Result:**
- Success message appears
- Account ID is displayed (note this down, likely ID: 1)
- Behind the scenes: Lithic account holder created for Eric

### 1.4 Fund the Account

Fill in the Fund Account form:

| Field | Value |
|-------|-------|
| Account ID | `1` (from previous step) |
| Amount | `15000` |

Click **"Fund Account"**.

**Expected Result:**
- Success message appears
- Account balance is now $15,000

### 1.5 Logout

Click **"Logout"** button at the top right.

**Expected Result:** You're returned to the login page.

---

## Phase 2: Owner Login - Create Users (4 minutes)

### 2.1 Login as Owner (Eric)

1. Click the **"User Login"** tab
2. Enter email: `eric@msdcafe.com`
3. Click **"Login"**

**Expected Result:**
- You're logged in as Eric Medina
- Dashboard shows: "MSD Cafe" and "Role: owner"
- Left sidebar shows: Create User, Create Card, Create Spending Profile, User List, Card List

### 2.2 Create User: Seth (Admin)

1. Click **"Create User"** in left sidebar
2. Fill in the form:

| Field | Value |
|-------|-------|
| Email | `seth@msdcafe.com` |
| First Name | `Seth` |
| Last Name | `Medina` |
| Role | `Admin` |
| Phone | `+15555552001` |

3. Click **"Create User"**

**Expected Result:**
- Success message appears
- Seth is created with Admin role
- Lithic account holder created for Seth

### 2.3 Create User: Gabriel (User)

1. Fill in the Create User form:

| Field | Value |
|-------|-------|
| Email | `gabriel@msdcafe.com` |
| First Name | `Gabriel` |
| Last Name | `Medina` |
| Role | `User` |
| Phone | `+15555552002` |

2. Click **"Create User"**

**Expected Result:** Gabriel is created successfully.

### 2.4 Create User: Nathalia (User)

1. Fill in the Create User form:

| Field | Value |
|-------|-------|
| Email | `nathalia@msdcafe.com` |
| First Name | `Nathalia` |
| Last Name | `Medina` |
| Role | `User` |
| Phone | `+15555552003` |

2. Click **"Create User"**

**Expected Result:** Nathalia is created successfully.

### 2.5 Create User: Lindsey (Analyst)

1. Fill in the Create User form:

| Field | Value |
|-------|-------|
| Email | `lindsey@msdcafe.com` |
| First Name | `Lindsey` |
| Last Name | `Medina` |
| Role | `Analyst` |
| Phone | `+15555552004` |

2. Click **"Create User"**

**Expected Result:** Lindsey is created successfully.

---

## Phase 3: Create Cards for Eric and Seth (2 minutes)

### 3.1 Create Eric's Debit Card

1. Click **"Create Card"** in left sidebar
2. Fill in the form:

| Field | Value |
|-------|-------|
| Select User | `Eric Medina` |
| Card Type | `Debit Card` |
| Spend Limit | `5000` |
| Spend Limit Duration | `Monthly` |

3. Click **"Create Card"**

**Expected Result:**
- Success message appears
- Card details shown (last 4 digits)
- Lithic financial account created (if first card)
- Lithic card created for Eric

### 3.2 Create Seth's Debit Card

1. Fill in the Create Card form:

| Field | Value |
|-------|-------|
| Select User | `Seth Medina` |
| Card Type | `Debit Card` |
| Spend Limit | `2000` |
| Spend Limit Duration | `Monthly` |

2. Click **"Create Card"**

**Expected Result:**
- Success message appears
- Card created for Seth with $2,000/month limit

### 3.3 Logout

Click **"Logout"** button.

---

## Phase 4: Login as Seth - Create Reloadable Card (2 minutes)

### 4.1 Login as Seth

1. Click **"User Login"** tab
2. Enter email: `seth@msdcafe.com`
3. Click **"Login"**

**Expected Result:**
- Logged in as Seth Medina
- Dashboard shows: "MSD Cafe" and "Role: admin"
- Left sidebar shows same options (Admin has full access)

### 4.2 Create Gabriel's Reloadable Card

1. Click **"Create Card"** in left sidebar
2. Fill in the form:

| Field | Value |
|-------|-------|
| Select User | `Gabriel Medina` |
| Card Type | `Reloadable Card` |
| Spend Limit | `500` |
| Spend Limit Duration | `Monthly` |

3. Click **"Create Card"**

**Expected Result:**
- Success message appears
- Reloadable card created for Gabriel with $500/month limit

---

## Phase 5: Create Spending Profile (2 minutes)

### 5.1 Create "Basic User Spending" Profile

1. Click **"Create Spending Profile"** in left sidebar
2. Fill in the form:

| Field | Value |
|-------|-------|
| Profile Name | `Basic User Spending` |
| Description | `Limited spending for regular users - no gambling or hotels` |
| Spend Limit | `500` |
| Spend Limit Duration | `Monthly` |
| Allowed Categories | (leave empty - allow all by default) |
| Blocked Categories | `7995, 7011` |

**Category Codes:**
- `7995` - Gambling
- `7011` - Hotels

3. Click **"Create Spending Profile"**

**Expected Result:**
- Success message appears
- Profile created in database
- Lithic auth rule created
- Profile is now available for card assignment

---

## Phase 6: Create Card with Spending Profile (2 minutes)

### 6.1 Create Nathalia's Card with Profile

1. Click **"Create Card"** in left sidebar
2. Fill in the form:

| Field | Value |
|-------|-------|
| Select User | `Nathalia Medina` |
| Card Type | `Debit Card` |
| Spending Profile | `Basic User Spending` (from dropdown) |

**Note:** When a spending profile is selected, the card will automatically inherit:
- Spend limit: $500/month
- Blocked categories: 7995 (gambling), 7011 (hotels)

3. Click **"Create Card"**

**Expected Result:**
- Success message appears
- Card created for Nathalia with spending profile applied
- Card is restricted according to profile rules

---

## Phase 7: View All Users and Cards (2 minutes)

### 7.1 View User List

1. Click **"User List"** in left sidebar

**Expected Result:**
You should see a table with 5 users:

| Name | Email | Role | Card Count | Status |
|------|-------|------|------------|--------|
| Eric Medina | eric@msdcafe.com | owner | 1 | active |
| Seth Medina | seth@msdcafe.com | admin | 1 | active |
| Gabriel Medina | gabriel@msdcafe.com | user | 1 | active |
| Nathalia Medina | nathalia@msdcafe.com | user | 1 | active |
| Lindsey Medina | lindsey@msdcafe.com | analyst | 0 | active |

### 7.2 View Card List

1. Click **"Card List"** in left sidebar

**Expected Result:**
You should see a table with 4 cards:

| Last 4 | User | Type | Limit | Duration | Profile | Status |
|--------|------|------|-------|----------|---------|--------|
| XXXX | Eric Medina | Debit Card | $5,000 | Monthly | - | active |
| XXXX | Seth Medina | Debit Card | $2,000 | Monthly | - | active |
| XXXX | Gabriel Medina | Reloadable Card | $500 | Monthly | - | active |
| XXXX | Nathalia Medina | Debit Card | $500 | Monthly | Basic User Spending | active |

---

## Test Validation Checklist

After completing all phases, verify:

### Admin CRM
- [ ] Can login to admin CRM
- [ ] Can create business account
- [ ] Can fund account
- [ ] Account creation creates Lithic account holder

### User Management
- [ ] Owner can login with email only
- [ ] Owner can create users with different roles
- [ ] Each user gets Lithic account holder
- [ ] Users appear in user list

### Card Management
- [ ] Can create debit cards
- [ ] Can create reloadable cards
- [ ] Can set individual spend limits
- [ ] Cards appear in card list
- [ ] Financial account created on first card

### Spending Profiles
- [ ] Can create spending profile
- [ ] Can block merchant categories
- [ ] Can set spend limits in profile
- [ ] Can assign profile to cards
- [ ] Profile appears in card details

### Role-Based Access
- [ ] Owner has full access
- [ ] Admin can create users and cards
- [ ] Different roles see appropriate menus

### Lithic Integration
- [ ] Account holders created successfully
- [ ] Financial account created
- [ ] Cards created in Lithic sandbox
- [ ] Auth rules created for profiles

---

## Additional Test Scenarios

### Test User Role: Analyst (Read-Only)

1. Logout
2. Login as: `lindsey@msdcafe.com`
3. Verify:
   - Can view User List
   - Can view Card List
   - Cannot create users (no menu item)
   - Cannot create cards (no menu item)
   - Cannot create profiles (no menu item)

### Test User Role: Regular User

1. Logout
2. Login as: `gabriel@msdcafe.com`
3. Verify:
   - Limited menu options
   - Can view own card details
   - Cannot create users
   - Cannot create cards for others

---

## Troubleshooting Test Issues

### Account Creation Fails

**Symptoms:** Error when creating MSD Cafe account

**Check:**
- Backend is running (http://localhost:3001)
- Lithic API key in `.env` is correct
- Check backend console for Lithic API errors

### User Creation Fails

**Symptoms:** Error when creating users

**Check:**
- Logged in as Owner or Admin role
- Email is unique (not already used)
- Phone number is in E.164 format (+15555551234)
- Check backend console for errors

### Card Creation Fails

**Symptoms:** Error when creating cards

**Check:**
- User exists and belongs to the account
- Account has sufficient balance (funded)
- Lithic API is reachable
- Check backend console for Lithic API errors

### Spending Profile Not Appearing

**Symptoms:** Profile doesn't show in dropdown

**Check:**
- Profile was created successfully
- Refresh the page
- Check database for spending_profiles table
- Verify logged into correct account

### Cannot Login

**Symptoms:** Login fails for user

**Check:**
- User was created successfully
- Email is spelled correctly
- Backend is running
- Check browser console for errors

---

## Test Data Summary

After completing all tests, you will have:

**1 Account:**
- MSD Cafe (Balance: $15,000)

**5 Users:**
- Eric Medina (Owner)
- Seth Medina (Admin)
- Gabriel Medina (User)
- Nathalia Medina (User)
- Lindsey Medina (Analyst)

**4 Cards:**
- Eric: Debit, $5,000/month
- Seth: Debit, $2,000/month
- Gabriel: Reloadable, $500/month
- Nathalia: Debit, $500/month with profile

**1 Spending Profile:**
- Basic User Spending ($500/month, blocks gambling & hotels)

---

## Next Steps

After successful testing:

1. **Review Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it all works
2. **Review TODO:** Check [TODO.md](TODO.md) for the workflow steps
3. **Experiment:** Try creating more users, cards, and profiles
4. **Extend:** Consider adding new features based on the architecture

---

## Test Report Template

After testing, you can use this template to document results:

```
LITHIC POC TEST REPORT
Date: _______________
Tester: _____________

✅ PASSED / ❌ FAILED

Phase 1: Admin CRM
[ ] Admin login
[ ] Account creation
[ ] Account funding

Phase 2: User Management
[ ] Owner login
[ ] Create 4 users
[ ] All users appear in list

Phase 3: Card Creation (Owner)
[ ] Eric's debit card
[ ] Seth's debit card

Phase 4: Card Creation (Admin)
[ ] Login as Seth
[ ] Gabriel's reloadable card

Phase 5: Spending Profile
[ ] Create profile
[ ] Profile with restrictions

Phase 6: Card with Profile
[ ] Nathalia's card with profile

Phase 7: Visibility
[ ] User list shows all 5 users
[ ] Card list shows all 4 cards

NOTES:
_______________________________
_______________________________
```
