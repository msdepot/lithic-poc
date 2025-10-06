# 🎯 Features Documentation

This document describes all features implemented in the Lithic POC platform.

## Feature Overview

The Lithic POC demonstrates a complete card issuing platform with the following capabilities:

1. **Admin CRM System** - Business account onboarding
2. **User Management** - Multi-role user system
3. **Card Management** - Multiple card types and limits
4. **Spending Profiles** - Reusable restriction templates
5. **Dashboard & Reporting** - User and card lists

---

## 1. Admin CRM System

### Purpose
Allows platform administrators to onboard new business accounts with owner information.

### Features

#### Admin Login
- **Endpoint:** Admin CRM tab
- **Credentials:** 
  - Username: `admin`
  - Password: `admin@123`
- **Security:** Separate from user authentication system

#### Account Creation
- **Business Information:**
  - Business name
  - Owner details (email, name, phone)
- **Lithic Integration:**
  - Creates account holder for business owner
  - Stores account tokens in database
- **Automatic Setup:**
  - Owner user is automatically created
  - Owner gets "owner" role

#### Account Funding
- **Purpose:** Add funds to account for card operations
- **Process:**
  - Select account by ID
  - Enter funding amount
  - Updates account balance
- **Note:** In sandbox mode, this is simulated

### User Interface
- Simple form-based interface
- Success/error messages
- Account ID displayed after creation

---

## 2. User Management

### Purpose
Create and manage users within a business account with different permission levels.

### User Roles

#### Owner
- **Permissions:**
  - Full account control
  - Create/manage users
  - Create/manage cards
  - Create/manage spending profiles
  - View all reports
- **Automatic:** Created with business account
- **Count:** One per account

#### Admin
- **Permissions:**
  - Create/manage users
  - Create/manage cards
  - Create/manage spending profiles
  - View all reports
- **Use Case:** Management team members
- **Created By:** Owner or other Admins

#### User
- **Permissions:**
  - View own cards
  - Limited dashboard access
- **Use Case:** Regular employees
- **Created By:** Owner or Admins

#### Analyst
- **Permissions:**
  - Read-only access
  - View reports
  - Cannot create/modify
- **Use Case:** Finance/compliance team
- **Created By:** Owner or Admins

### User Creation Process

1. **User enters information:**
   - Email (unique within account)
   - First and last name
   - Role selection
   - Phone number

2. **System creates:**
   - User record in database
   - Lithic account holder
   - Stores account holder token

3. **User can now:**
   - Login with email (no password)
   - Access role-appropriate features

### User List View

Displays all users in the account with:
- Name and email
- Role
- Phone number
- Number of cards assigned
- Status (active/inactive)

---

## 3. Card Management

### Purpose
Issue and manage cards for users with different types and spending controls.

### Card Types

#### Debit Card
- **Description:** Standard spending card
- **Funding:** Linked to account balance
- **Use Case:** General business expenses
- **Features:**
  - Individual spend limits
  - Optional spending profiles
  - Immediate activation

#### Reloadable Card
- **Description:** Prepaid card that can be reloaded
- **Funding:** Specific amount loaded
- **Use Case:** Controlled employee spending
- **Features:**
  - Load specific amounts
  - Set spending limits
  - Optional spending profiles

### Card Creation Process

1. **Select user** from dropdown
2. **Choose card type:**
   - Debit Card
   - Reloadable Card
3. **Set spending limit** (optional):
   - Amount (e.g., $500)
   - Duration (daily/monthly/yearly)
4. **Attach spending profile** (optional):
   - Select from existing profiles
   - Applies additional restrictions
5. **System creates:**
   - Card via Lithic API
   - Card record in database
   - Links to user and profile

### Card Features

#### Individual Spending Limits
- **Per-card limits:** Each card has its own limit
- **Duration options:**
  - Daily: Resets every 24 hours
  - Monthly: Resets on 1st of month
  - Yearly: Resets on January 1st
- **Enforcement:** Via Lithic authorization system

#### Card Details
Each card displays:
- Card type (debit/reloadable)
- Last 4 digits
- Assigned user
- Spending limit and duration
- Attached spending profile
- Status (active/inactive)

### Card List View

Displays all cards in the account with:
- Card number (masked)
- Card type
- User name
- Spending limit
- Spending profile (if attached)
- Status

---

## 4. Spending Profiles

### Purpose
Create reusable templates of spending restrictions that can be applied to multiple cards.

### What is a Spending Profile?

A spending profile is a **saved set of rules** that includes:
- Spending limits
- Merchant category controls
- Other authorization rules

### Why Use Spending Profiles?

**Without Profiles:**
- Set limits on each card individually
- Repeat same restrictions multiple times
- Hard to maintain consistency

**With Profiles:**
- Define rules once
- Apply to multiple cards
- Update once, affects all cards
- Maintain consistency across teams

### Profile Components

#### Spending Limits
- **Amount:** Maximum spend amount
- **Duration:** Time period (daily/monthly/yearly)
- **Applies to:** All cards using this profile

#### Merchant Category Controls

**Blocked Categories:**
- Specify MCC codes to block
- Example: `7995` (gambling), `7011` (hotels)
- Card will be declined at these merchants

**Allowed Categories:**
- Specify only allowed MCC codes
- All other categories blocked
- Example: `5411` (grocery), `5814` (fast food)

### Common MCC Codes

| MCC | Category | Use Case |
|-----|----------|----------|
| 5411 | Grocery Stores | Allow food purchases |
| 5812 | Eating Places | Allow restaurant meals |
| 5814 | Fast Food | Allow quick meals |
| 5541 | Service Stations | Allow fuel |
| 7011 | Lodging | Block/allow hotels |
| 7995 | Betting/Casino | Block gambling |
| 5999 | Miscellaneous | General retail |

### Profile Creation Process

1. **Enter profile details:**
   - Name (e.g., "Basic User Spending")
   - Description
2. **Set spending limit:**
   - Amount
   - Duration
3. **Configure categories:**
   - Blocked categories (comma-separated MCCs)
   - Allowed categories (optional)
4. **System creates:**
   - Profile record in database
   - Lithic auth rule
   - Stores auth rule token

### Using Profiles

#### Attach to New Card
- Select profile from dropdown during card creation
- Profile rules immediately apply

#### Attach to Existing Card
- Update card settings
- Select or change profile
- New rules apply immediately

#### Profile Reusability
- One profile can be used by many cards
- Example: "Employee Spending" profile for all employee cards
- Update profile once, affects all attached cards

### Profile Management

#### View Profiles
- List all spending profiles
- See which cards use each profile
- View profile details

#### Update Profiles
- Modify limits or categories
- Changes apply to all cards using profile
- Lithic auth rules updated automatically

#### Delete Profiles
- Only if no cards are using it
- Must detach from all cards first

---

## 5. Dashboard & Reporting

### Purpose
Provide visibility into users and cards with all relevant details.

### User Dashboard

**Available to:** All logged-in users (role-based menu)

**Features:**
- Left sidebar navigation
- Role-based menu items
- User information display
- Quick access to features

**Menu Items by Role:**

| Feature | Owner | Admin | User | Analyst |
|---------|-------|-------|------|---------|
| Create User | ✓ | ✓ | ✗ | ✗ |
| Create Card | ✓ | ✓ | ✗ | ✗ |
| Create Profile | ✓ | ✓ | ✗ | ✗ |
| User List | ✓ | ✓ | ✗ | ✓ |
| Card List | ✓ | ✓ | ✓ | ✓ |

### User List View

**Purpose:** View all users in the account

**Displays:**
- User's full name
- Email address
- Phone number
- Role (owner/admin/user/analyst)
- Number of cards assigned
- Status (active/inactive)

**Features:**
- Sortable columns
- Search/filter (future)
- Click to view details (future)

### Card List View

**Purpose:** View all cards in the account

**Displays:**
- Card number (last 4 digits)
- Card type (debit/reloadable)
- Assigned user
- Spending limit and duration
- Attached spending profile
- Status (active/inactive)

**Features:**
- Sortable columns
- Filter by user/status (future)
- Click to view transactions (future)

---

## 6. Authentication & Security

### Authentication Methods

#### Admin CRM Login
- **Method:** Username and password
- **Users:** Platform administrators only
- **Session:** JWT token
- **Purpose:** Account onboarding

#### User Login
- **Method:** Email only (no password)
- **Users:** Business users
- **Session:** JWT token
- **Purpose:** POC simplicity
- **Note:** Production would add password/MFA

### Session Management
- **Token Storage:** localStorage
- **Token Expiration:** 24 hours
- **Auto-logout:** On token expiration
- **Refresh:** Manual re-login required

### Role-Based Access Control (RBAC)

**Enforcement:**
- Backend: Middleware checks role for each request
- Frontend: Menu items hidden based on role
- API: Returns 403 Forbidden for unauthorized actions

---

## 7. Lithic Integration

### Real-Time API Integration

All card operations use **real Lithic sandbox API**, not mocked:

#### Account Holder Creation
- **When:** User is created
- **API:** `POST /account_holders`
- **Stored:** `lithic_account_holder_token`

#### Financial Account Creation
- **When:** First card is issued
- **API:** `POST /financial_accounts`
- **Stored:** `lithic_financial_account_token`

#### Card Creation
- **When:** Card is created
- **API:** `POST /cards`
- **Stored:** `lithic_card_token`, `last_four`

#### Auth Rule Creation
- **When:** Spending profile is created
- **API:** `POST /auth_rules`
- **Stored:** `lithic_auth_rule_token`

### Sandbox Environment

- **URL:** https://sandbox.lithic.com/v1
- **Purpose:** Testing without real money
- **Features:** Full API functionality
- **Limits:** Sandbox data only

---

## Feature Roadmap (Future Enhancements)

### Phase 2 (Not in POC)
- [ ] Transaction history
- [ ] Real-time transaction webhooks
- [ ] Card activation/deactivation
- [ ] Enhanced spending profile options
- [ ] User password authentication
- [ ] Multi-factor authentication (MFA)

### Phase 3 (Not in POC)
- [ ] Dashboard analytics
- [ ] Export/reporting features
- [ ] Mobile responsive optimization
- [ ] Push notifications
- [ ] Automated compliance checks
- [ ] Expense categorization

### Phase 4 (Not in POC)
- [ ] Receipt capture
- [ ] Integration with accounting software
- [ ] Approval workflows
- [ ] Budget management
- [ ] Virtual card creation
- [ ] Apple Pay / Google Pay support

---

## Feature Testing

For step-by-step testing of all features, see **[WORKFLOW.md](../WORKFLOW.md)**.

For technical implementation details, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

---

**Last Updated:** 2025-10-06
