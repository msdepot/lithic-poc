# Lithic POC - Frontend Admin CRM Documentation

## 🎯 Overview

This React TypeScript frontend replaces the Postman collection with a comprehensive admin CRM interface for the Lithic Payment Card Management POC. The application provides all the functionality needed to test and demonstrate the complete business scenario through a user-friendly web interface.

## 🚀 Quick Start

### Option 1: Start Everything Together (Recommended)
```bash
# From the project root directory
./start-full-poc.sh
```
This script will automatically:
- Start Supabase (if not running)
- Start the Node.js backend API (port 3000)
- Start the React frontend (port 3001)
- Display all access points

### Option 2: Manual Startup
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

## 🔗 Access Points

- **Frontend Admin UI**: http://localhost:3001
- **Backend API**: http://localhost:3000  
- **Database Studio**: http://127.0.0.1:54323
- **Health Check**: http://localhost:3000/health

**Default Login**: admin / admin123

## 📋 Complete POC Testing Workflow

The frontend replicates the entire Postman collection workflow through an intuitive interface:

### Phase 1: Foundation Setup 🏗️

**1.1 Admin Login**
- Navigate to http://localhost:3001
- Login with: admin / admin123
- Verify you're on the Dashboard

**1.2 Create Eric Medina (Account Owner)**
1. Go to **Users** → **Create User**
2. Fill in Eric's details:
   - Username: eric_medina
   - Email: eric@msdcafe.com
   - Password: securepass123
   - First Name: Eric
   - Last Name: Medina
   - Role: Super Admin
3. Click **Create User**
4. ✅ Eric created with Lithic account holder integration

**1.3 Create MSD Cafe Business Account**
1. Go to **Accounts** → **Create Account**
2. Fill in account details:
   - Account Name: MSD Cafe Business Account
   - Account Owner: Eric Medina (eric_medina)
   - Account Type: Business Account
   - Initial Balance: 50000.00
3. Click **Create Account**
4. ✅ Business account linked to Eric

### Phase 2: User Hierarchy 👥

**2.1 Create Family Members**
Continue in **Users** section to create:

**Seth Medina (Admin)**
- Username: seth_medina
- Email: seth@msdcafe.com
- Role: Admin
- First/Last: Seth Medina

**Gabriel Medina (Admin)**  
- Username: gabriel_medina
- Email: gabriel@msdcafe.com
- Role: Admin
- First/Last: Gabriel Medina

**Nathalia Medina (User)**
- Username: nathalia_medina  
- Email: nathalia@msdcafe.com
- Role: User
- First/Last: Nathalia Medina

**Lindsey Medina (Analyst)**
- Username: lindsey_medina
- Email: lindsey@msdcafe.com
- Role: Analyst  
- First/Last: Lindsey Medina

**2.2 Verify User Creation**
- Check **Users** list shows all 6 users (including admin + Eric)
- Verify roles are correctly assigned
- Confirm all users show "Active" status

### Phase 3: Card Creation 💳

**3.1 Create Business Debit Card for Eric**
1. Go to **Cards** → **Create Card**
2. Configure:
   - Card Holder: Eric Medina (eric_medina)
   - Linked Account: MSD Cafe Business Account
   - Card Type: Debit Card
   - Card Subtype: Business Card
   - Memo: "Owner business debit card"
3. Click **Create Card**
4. ✅ Verify card appears with Lithic integration

**3.2 Create Personal Debit Card for Seth**
1. Create new personal account for Seth first:
   - Go to **Accounts** → **Create Account**
   - Account Name: Seth Personal Account
   - Account Owner: Seth Medina
   - Account Type: Personal Account
2. Then create card:
   - Card Holder: Seth Medina
   - Linked Account: Seth Personal Account  
   - Card Type: Debit Card
   - Card Subtype: Personal Card

**3.3 Create Reloadable Prepaid Card for Gabriel**
1. Create Gabriel's account:
   - Account Name: Gabriel Reloadable Account
   - Account Owner: Gabriel Medina
   - Account Type: Personal Account
2. Create prepaid card:
   - Card Holder: Gabriel Medina
   - Linked Account: Gabriel Reloadable Account
   - Card Type: Prepaid Card
   - Card Subtype: Reloadable Card

**3.4 Create Spending Profile for Nathalia**
1. Go to **Spending Profiles** → **Create Profile**
2. Configure conservative limits:
   - Profile Name: Conservative Spending
   - Description: Limited spending for junior family member
   - Daily Limit: 500.00
   - Monthly Limit: 2000.00
   - Per Transaction Limit: 250.00
   - Allowed Countries: US
   - Block international: ✓
   - Block ATM: ✓
3. Click **Create Profile**

**3.5 Create Limit-Based Card for Nathalia**
1. Create Nathalia's account first
2. Create card with spending profile:
   - Card Holder: Nathalia Medina
   - Card Type: Debit Card
   - Card Subtype: Personal Card
   - Note: Will need to manually link spending profile via API or future UI enhancement

### Phase 4: Testing & Validation ✅

**4.1 Card Status Management**
- In **Cards** section, test:
  - Lock/unlock cards using the card action buttons
  - Verify status changes reflect immediately
  - Check card visual states (colors change with status)

**4.2 Role-Based Access Control**
- Verify different role capabilities:
  - Admin can create users/accounts/cards
  - Users can view their own data
  - Analyst role limitations are enforced

**4.3 Data Validation**
- Check **Dashboard** statistics update correctly
- Verify all created entities appear in their respective sections
- Confirm database integrity via Database Studio

## 🎨 UI Features

### Design Philosophy
- **Greyscale Theme**: Professional, fintech-appropriate styling
- **Clean Layout**: Left sidebar navigation with clear sections
- **Responsive Design**: Works on desktop and mobile devices

### Key Interface Elements

**Dashboard**
- Statistics cards showing system overview
- Quick action buttons for common tasks
- Real-time status indicators

**Users Management**
- Comprehensive user creation form
- Role-based badge system
- User status management
- Search and filtering capabilities

**Accounts Management**
- Visual account cards with type indicators
- Balance display and account linking
- Business vs. Personal account differentiation

**Cards Management**
- Visual payment card representations
- Card type-specific styling and colors
- Status management (Active/Locked/Pending)
- Real-time Lithic integration feedback

**Spending Profiles**
- Comprehensive limit configuration
- Geographic and merchant restrictions
- Visual limit displays
- Profile application to cards

## 🔧 Technical Implementation

### API Integration
- Full REST API integration with error handling
- JWT authentication with automatic refresh
- Real-time data updates
- Proper loading and error states

### State Management
- React Query for server state management
- Context API for authentication
- Local component state for UI interactions

### Form Handling  
- React Hook Form with validation
- Real-time form validation
- Error message display
- Proper form submission handling

### Security
- JWT token management
- Role-based route protection
- Secure API communication
- Input validation and sanitization

## 🚨 Troubleshooting

### Common Issues

**Frontend won't start**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**API connection failed**
- Verify backend is running on port 3000
- Check `frontend/.env` has correct API URL
- Confirm no CORS issues in browser console

**Authentication issues**
- Clear browser localStorage
- Verify admin credentials: admin/admin123
- Check JWT token expiration

**Database connection issues**
- Restart Supabase: `npm run supabase:stop && npm run supabase:start`
- Verify database is seeded with initial admin user
- Check Supabase Studio at http://127.0.0.1:54323

### Debug Mode
- Open browser DevTools → Network tab
- Monitor API requests and responses
- Check Console for JavaScript errors
- Use React DevTools for component state

## 🎯 Success Criteria

The POC is complete when you can:

✅ **Authentication & Authorization**
- Login as admin successfully
- Create users with different roles
- Verify role-based access control

✅ **Account Management**  
- Create business and personal accounts
- Link accounts to proper owners
- Manage account types and balances

✅ **Card Operations**
- Issue cards of different types
- See real Lithic API integration
- Manage card statuses (lock/unlock)

✅ **Spending Controls**
- Create spending profiles with limits
- Apply geographic restrictions
- Set transaction rules

✅ **Complete Business Scenario**
- MSD Cafe business setup complete
- Medina family user hierarchy established  
- All card types issued and functional
- Spending controls properly configured

## 💡 Next Steps

### Production Enhancements
1. **Advanced Card Management**: Card replacement, PIN management
2. **Transaction Monitoring**: Real-time transaction display
3. **Advanced Spending Rules**: MCC code management, time-based rules
4. **Audit Trail**: Complete activity logging interface
5. **Bulk Operations**: Mass user/card creation
6. **Analytics Dashboard**: Usage statistics and reports

### Integration Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Enhanced Security**: Multi-factor authentication
3. **API Rate Limiting**: Request throttling display
4. **Offline Support**: Progressive Web App features

This frontend successfully replaces the Postman testing workflow with a production-ready admin interface that demonstrates the full capabilities of the Lithic Payment Card Management system! 🚀