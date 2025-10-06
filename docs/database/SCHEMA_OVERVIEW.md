# 📊 Database Schema Overview

Complete overview of the Lithic POC database schema, including entity relationships, data flow, and design principles.

## 🎯 Schema Purpose

The database schema supports a multi-tenant card issuing platform that integrates with Lithic's API. It tracks:
- Business accounts and their configurations
- Users with role-based permissions
- Issued payment cards with spending controls
- Reusable spending profile templates

## 🏗️ Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         ACCOUNTS                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ PK: id (INTEGER AUTO_INCREMENT)                         │ │
│  │ UK: owner_email (STRING UNIQUE)                         │ │
│  │                                                          │ │
│  │ • business_name          (STRING, NOT NULL)             │ │
│  │ • owner_email            (STRING, NOT NULL, UNIQUE)     │ │
│  │ • lithic_account_token   (STRING)                       │ │
│  │ • lithic_financial_account_token (STRING)               │ │
│  │ • balance                (DECIMAL 10,2, DEFAULT 0)      │ │
│  │ • status                 (STRING, DEFAULT 'active')     │ │
│  │ • created_at             (TIMESTAMP)                    │ │
│  │ • updated_at             (TIMESTAMP)                    │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────┬─────────────────────┬──────────────┬────────────┘
             │                     │              │
             │                     │              │
    ┌────────▼─────────┐  ┌────────▼────────┐   │
    │      USERS       │  │  SPENDING_      │   │
    │                  │  │  PROFILES       │   │
    │ PK: id           │  │                 │   │
    │ FK: account_id ──┼──┤ PK: id          │   │
    │ UK: email        │  │ FK: account_id  │   │
    │                  │  │                 │   │
    │ • first_name     │  │ • name          │   │
    │ • last_name      │  │ • description   │   │
    │ • role           │  │ • spend_limit   │   │
    │ • lithic_token   │  │ • duration      │   │
    │ • status         │  │ • allowed_cats  │   │
    │ • created_at     │  │ • blocked_cats  │   │
    │ • updated_at     │  │ • lithic_token  │   │
    └────────┬─────────┘  └────────┬────────┘   │
             │                     │            │
             │            ┌────────▼────────────▼─────────┐
             │            │          CARDS                 │
             │            │                                │
             │            │ PK: id                         │
             └────────────┤ FK: account_id                 │
                          │ FK: user_id                    │
                          │ FK: spending_profile_id        │
                          │                                │
                          │ • lithic_card_token            │
                          │ • card_type                    │
                          │ • last_four                    │
                          │ • status                       │
                          │ • spend_limit                  │
                          │ • spend_limit_duration         │
                          │ • created_at                   │
                          │ • updated_at                   │
                          └────────────────────────────────┘
```

## 📋 Table Summary

### 1. accounts
**Purpose:** Root entity storing business account information  
**Key Features:**
- Stores Lithic integration tokens (account and financial account)
- Tracks account balance
- One-to-many parent for all other tables

**Lithic Integration:**
- `lithic_account_token`: Maps to Lithic Account entity
- `lithic_financial_account_token`: Maps to Lithic Financial Account for funding

---

### 2. users
**Purpose:** Stores individual users/cardholders within an account  
**Key Features:**
- Role-based access control (owner, admin, user, analyst)
- Each user can have multiple cards
- Email must be unique across all users
- Linked to Lithic Account Holders

**Lithic Integration:**
- `lithic_account_holder_token`: Maps to Lithic Account Holder entity
- Required for card issuance

---

### 3. spending_profiles
**Purpose:** Reusable templates for spending controls and restrictions  
**Key Features:**
- Define spending limits and duration
- Category-based restrictions (MCC codes)
- Can be applied to multiple cards
- Mapped to Lithic Auth Rules

**Lithic Integration:**
- `lithic_auth_rule_token`: Maps to Lithic Auth Rule entity
- Controls transaction authorization

---

### 4. cards
**Purpose:** Individual payment cards issued to users  
**Key Features:**
- Central entity connecting users, accounts, and spending profiles
- Stores card metadata (last 4 digits, type, status)
- Optional spending profile for advanced controls
- Direct card-level spend limits

**Lithic Integration:**
- `lithic_card_token`: Maps to Lithic Card entity
- Supports both virtual and physical cards

## 🔗 Relationship Details

### Account → Users (1:N)
- One account has many users
- Enforced by `users.account_id` foreign key
- Cascade behavior: Not explicitly set (should be considered)

### Account → Cards (1:N)
- One account has many cards
- Enforced by `cards.account_id` foreign key
- Ensures all cards belong to a valid account

### Account → Spending Profiles (1:N)
- One account has many spending profiles
- Enforced by `spending_profiles.account_id` foreign key
- Profiles are scoped to account

### User → Cards (1:N)
- One user can have multiple cards
- Enforced by `cards.user_id` foreign key
- User must belong to same account as card

### Spending Profile → Cards (1:N)
- One profile can be applied to many cards
- Enforced by `cards.spending_profile_id` foreign key
- **Optional relationship** (cards can exist without a profile)

## 🔐 Data Integrity Rules

### Primary Keys
All tables use auto-incrementing integer primary keys:
- Simple, efficient for joins
- Sequelize default behavior
- Consider UUIDs for distributed systems

### Unique Constraints
1. `accounts.owner_email` - Prevents duplicate business registrations
2. `users.email` - Prevents duplicate user accounts

### Foreign Key Constraints
All foreign keys enforce referential integrity:
- Invalid IDs are rejected
- Prevents orphaned records
- **Missing:** ON DELETE/UPDATE policies

### NOT NULL Constraints
Critical fields marked as NOT NULL:
- `accounts.business_name`, `accounts.owner_email`
- `users.email`, `users.first_name`, `users.last_name`, `users.role`, `users.account_id`
- `cards.account_id`, `cards.user_id`, `cards.card_type`
- `spending_profiles.account_id`, `spending_profiles.name`

## 📈 Data Flow

### 1. Account Creation
```
1. Create Account record
2. Store business information
3. Receive Lithic account token (async)
4. Create financial account (on first card)
```

### 2. User Onboarding
```
1. Create User record (linked to Account)
2. Assign role (owner/admin/user/analyst)
3. Create Lithic Account Holder
4. Store lithic_account_holder_token
```

### 3. Card Issuance
```
1. Select User (cardholder)
2. Optional: Select Spending Profile
3. Set card type and limits
4. Create Lithic Card
5. Store card metadata and lithic_card_token
```

### 4. Spending Profile Application
```
1. Create Spending Profile template
2. Define limits and category rules
3. Create Lithic Auth Rule
4. Apply to cards via spending_profile_id
```

## 🎨 Design Patterns

### Multi-Tenancy
- Account-based isolation
- All resources scoped to account_id
- No cross-account data access

### Token Storage
- Lithic API tokens stored as strings
- Enables two-way sync with Lithic
- Consider encryption for sensitive tokens

### Soft Deletes
- Status field instead of hard deletes
- Values: 'active', 'inactive', 'suspended'
- Maintains historical data

### Timestamps
- All tables include `created_at` and `updated_at`
- Automatic management by Sequelize
- Useful for audit trails

### Flexible Spending Controls
- Two-level system: Profile + Card-level limits
- Profiles are reusable templates
- Cards can override with direct limits

## 🔍 Indexes (Automatic)

Sequelize automatically creates indexes for:

### Primary Keys
- `accounts.id`
- `users.id`
- `cards.id`
- `spending_profiles.id`

### Unique Constraints
- `accounts.owner_email`
- `users.email`

### Foreign Keys
- `users.account_id`
- `cards.account_id`
- `cards.user_id`
- `cards.spending_profile_id`
- `spending_profiles.account_id`

## 🧮 Schema Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 4 |
| Total Columns | 41 |
| Primary Keys | 4 |
| Foreign Keys | 5 |
| Unique Constraints | 2 |
| NOT NULL Constraints | 13 |
| Default Values | 8 |
| Timestamps | 8 (created_at + updated_at) |
| Lithic Integration Fields | 6 |
| JSON Columns | 2 |

---

**Last Updated:** 2025-10-06  
**Schema Version:** 1.0
