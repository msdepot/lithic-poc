# Lithic POC - Complete Testing Flow

This document provides a detailed walkthrough of the complete POC functionality.

## 🎬 Overview

This POC demonstrates:
1. Admin creates business account with Lithic
2. Owner logs in and manages team
3. Team members get different card types
4. Spending profiles control card limits
5. Complete visibility of users and cards

## 📝 Testing Checklist

Use this checklist to verify all functionality:

- [ ] Admin can login
- [ ] Admin can create account
- [ ] Owner can login with email only
- [ ] Owner can create admin users
- [ ] Owner can create regular users
- [ ] Owner can create analyst users
- [ ] Owner can create debit card for self
- [ ] Owner can create debit card for admin
- [ ] Admin can login
- [ ] Admin can create reloadable card for user
- [ ] Admin can create spending profile
- [ ] Admin can create card with spending profile
- [ ] All users are visible in user list
- [ ] All cards are visible in card list
- [ ] Analyst users cannot get cards
- [ ] Logout works correctly

## 🎯 Detailed Flow

### Phase 1: Admin Setup (CRM)

**Goal**: Create business account and owner

1. **Open Application**
   - Navigate to http://localhost:3000
   - Should see login page with two tabs

2. **Login as Admin**
   - Ensure "Admin Login" tab is selected
   - Username: `admin`
   - Password: `admin@123`
   - Click "Login as Admin"
   - Should redirect to Admin Dashboard

3. **Verify Admin Dashboard**
   - Left sidebar shows: "Admin CRM"
   - Menu items: "Create Account", "View Accounts"
   - Main content shows: "Create New Account"

4. **Create Business Account**
   - Business Name: `MSD Cafe`
   - Owner Name: `Eric Medina`
   - Owner Email: `eric@msdcafe.com`
   - Initial Balance: `15000`
   - Click "Create Account & Lithic Integration"
   - Wait for processing (may take 5-10 seconds)

5. **Verify Success**
   - Should see success message with owner email
   - Note: This created Lithic account holder and financial account
   - Copy owner email for next step

6. **View Created Account**
   - Click "View Accounts" in left menu
   - Should see MSD Cafe in table
   - Balance: $15,000.00

7. **Logout**
   - Click "Logout" button at bottom of sidebar
   - Should return to login page

### Phase 2: Owner Operations

**Goal**: Owner creates team and manages cards

8. **Login as Owner**
   - Switch to "User Login" tab
   - Email: `eric@msdcafe.com`
   - Click "Login"
   - Should redirect to User Dashboard

9. **Verify Owner Dashboard**
   - Top shows: "MSD Cafe"
   - Your name: "Eric Medina"
   - Badge shows: "owner"
   - Left menu shows all options (owner has full access)

10. **Create Admin User (Seth)**
    - Click "Create User"
    - Name: `Seth Medina`
    - Email: `seth@msdcafe.com`
    - Role: `Admin`
    - Click "Create User"
    - Should see success message

11. **Create User (Gabriel)**
    - Name: `Gabriel Medina`
    - Email: `gabriel@msdcafe.com`
    - Role: `User`
    - Click "Create User"
    - Success!

12. **Create User (Nathalia)**
    - Name: `Nathalia Medina`
    - Email: `nathalia@msdcafe.com`
    - Role: `User`
    - Click "Create User"
    - Success!

13. **Create Analyst (Lindsey)**
    - Name: `Lindsey Medina`
    - Email: `lindsey@msdcafe.com`
    - Role: `Analyst`
    - Click "Create User"
    - Success!

14. **Verify All Users**
    - Click "View Users"
    - Should see 5 users:
      - Eric Medina (owner)
      - Seth Medina (admin)
      - Gabriel Medina (user)
      - Nathalia Medina (user)
      - Lindsey Medina (analyst)

15. **Create Card for Self (Eric)**
    - Click "Create Card"
    - User: Select "Eric Medina - eric@msdcafe.com (owner)"
    - Card Type: `Debit Card`
    - Spending Profile: Leave as "No spending profile"
    - Click "Create Card"
    - Wait for Lithic API call (5-10 seconds)
    - Should see success message

16. **Create Card for Seth**
    - User: Select "Seth Medina - seth@msdcafe.com (admin)"
    - Card Type: `Debit Card`
    - Spending Profile: "No spending profile"
    - Click "Create Card"
    - Success!

17. **Verify Cards Created**
    - Click "View Cards"
    - Should see 2 cards:
      - Eric Medina - debit card
      - Seth Medina - debit card
    - Note the last 4 digits

18. **Logout as Owner**
    - Click "Logout"
    - Return to login page

### Phase 3: Admin Operations

**Goal**: Seth creates cards and spending profiles

19. **Login as Seth**
    - User Login tab
    - Email: `seth@msdcafe.com`
    - Click "Login"
    - Should see dashboard

20. **Verify Seth's Access**
    - Account: MSD Cafe
    - Name: Seth Medina
    - Badge: "admin"
    - Can see: Create User, Create Card, Create Spending Profile

21. **Create Reloadable Card for Gabriel**
    - Click "Create Card"
    - User: "Gabriel Medina - gabriel@msdcafe.com (user)"
    - Card Type: `Reloadable Card`
    - Spending Profile: "No spending profile"
    - Click "Create Card"
    - Success!

22. **Create Spending Profile**
    - Click "Create Spending Profile"
    - Profile Name: `Basic User Limits`
    - Daily Limit: `500`
    - Monthly Limit: `5000`
    - Click "Create Profile"
    - Should see success with Lithic auth rule creation

23. **Verify Spending Profile**
    - Click "View Spending Profiles"
    - Should see "Basic User Limits"
    - Daily: $500.00
    - Monthly: $5,000.00

24. **Create Card with Spending Profile for Nathalia**
    - Click "Create Card"
    - User: "Nathalia Medina - nathalia@msdcafe.com (user)"
    - Card Type: `Limit-Based Card`
    - Spending Profile: Select "Basic User Limits - $500/day"
    - Click "Create Card"
    - Success!

25. **Verify All Cards**
    - Click "View Cards"
    - Should see 4 cards:
      1. Eric - debit - No profile
      2. Seth - debit - No profile
      3. Gabriel - reloadable - No profile
      4. Nathalia - limit_based - Basic User Limits

26. **Verify All Users**
    - Click "View Users"
    - Should still see all 5 users
    - Note: Lindsey (analyst) has no card

### Phase 4: Final Verification

**Goal**: Verify complete system state

27. **Check User Roles Work Correctly**
    - Owner (Eric): Can create all roles, all card types
    - Admin (Seth): Can create user/analyst, all card types
    - User (Gabriel): Would only see limited menu
    - Analyst (Lindsey): Read-only, no cards

28. **Verify Lithic Integration**
    - All cards should have last 4 digits
    - All cards should show ACTIVE/OPEN status
    - Spending profile should have Lithic auth rule

29. **Test Login for Other Users**
    - Logout as Seth
    - Try logging in as:
      - `gabriel@msdcafe.com` - Should work, limited menu
      - `nathalia@msdcafe.com` - Should work, limited menu
      - `lindsey@msdcafe.com` - Should work, analyst view

30. **Final Admin Check**
    - Login as admin (username: admin, password: admin@123)
    - View Accounts
    - Should see MSD Cafe with all details

## ✅ Success Criteria

All of these should be true:

- ✅ 1 business account created
- ✅ 5 users created (1 owner, 1 admin, 2 users, 1 analyst)
- ✅ 4 cards issued (owner, admin, 2 users)
- ✅ 1 spending profile created
- ✅ 1 card with spending profile
- ✅ Analyst has no card (correct behavior)
- ✅ All Lithic integrations working
- ✅ All roles have appropriate permissions

## 🐛 Troubleshooting Common Issues

### Card Creation Fails
- **Issue**: "Failed to create card"
- **Solutions**:
  1. Check backend logs for Lithic API errors
  2. Verify Lithic API key in `.env`
  3. Check internet connection
  4. Try again (Lithic sandbox can be slow)

### User Not Found on Login
- **Issue**: "User not found"
- **Solutions**:
  1. Verify email is correct
  2. Check user exists in "View Users"
  3. Check database in Supabase Studio

### Spending Profile Not Applying
- **Issue**: Card created but profile not showing
- **Solutions**:
  1. Verify profile was created successfully
  2. Check if Lithic auth rule was created
  3. Refresh the cards list

### Permission Denied
- **Issue**: "You cannot create users with this role"
- **Solutions**:
  1. This is correct behavior
  2. Admin cannot create Owner/Admin roles
  3. User cannot create anyone
  4. Login as owner to create admins

## 📊 Expected Results

### Users Table (View Users)
| Name | Email | Role |
|------|-------|------|
| Eric Medina | eric@msdcafe.com | owner |
| Seth Medina | seth@msdcafe.com | admin |
| Gabriel Medina | gabriel@msdcafe.com | user |
| Nathalia Medina | nathalia@msdcafe.com | user |
| Lindsey Medina | lindsey@msdcafe.com | analyst |

### Cards Table (View Cards)
| User | Type | Profile |
|------|------|---------|
| Eric Medina | debit | None |
| Seth Medina | debit | None |
| Gabriel Medina | reloadable | None |
| Nathalia Medina | limit_based | Basic User Limits |

### Spending Profiles Table
| Name | Daily | Monthly |
|------|-------|---------|
| Basic User Limits | $500.00 | $5,000.00 |

## 🎉 Completion

If all steps completed successfully, you have:

1. ✅ Demonstrated full admin CRM functionality
2. ✅ Demonstrated user management and RBAC
3. ✅ Demonstrated card issuance with Lithic
4. ✅ Demonstrated spending profile creation and application
5. ✅ Demonstrated complete visibility and control

**Congratulations!** You have successfully completed the Lithic POC full flow! 🚀

This demonstrates a working card issuing platform with:
- Multi-tenant account management
- Role-based access control
- Card lifecycle management
- Spending limit controls
- Real Lithic API integration

Perfect foundation for a production card issuing platform! 💳
