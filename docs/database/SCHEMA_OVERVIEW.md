# 📋 Database Schema Overview

Complete reference for all tables, columns, types, and constraints in the Lithic POC database.

---

## Table: `accounts`

**Purpose:** Stores business account information. Each account represents a separate business entity using the card issuing platform.

**Importance:** 🔴 **CRITICAL** - Root entity for multi-tenancy and data isolation.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique account identifier |
| `business_name` | STRING(255) | NOT NULL | Business/company name |
| `owner_email` | STRING(255) | NOT NULL, UNIQUE | Primary owner's email address |
| `lithic_account_token` | STRING(255) | NULLABLE | Lithic API account token reference |
| `lithic_financial_account_token` | STRING(255) | NULLABLE | Lithic financial account for funding |
| `balance` | DECIMAL(10,2) | DEFAULT 0 | Current account balance |
| `status` | STRING(255) | DEFAULT 'active' | Account status (active/inactive/suspended) |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Last update timestamp |

### Primary Key

- **Column:** `id`
- **Type:** Integer, Auto-increment
- **Purpose:** Unique identifier for each business account

### Unique Constraints

- **`owner_email`** - Ensures one account per email address

### Default Values

- `balance`: 0
- `status`: 'active'

### Notes

- Root table in the hierarchy
- All other tables reference this via `account_id`
- Lithic tokens are nullable (populated after API creation)
- Balance is stored as DECIMAL for precision

---

## Table: `users`

**Purpose:** Stores individual user accounts belonging to business accounts. Supports role-based access control.

**Importance:** 🔴 **CRITICAL** - Core entity for authentication and authorization.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY | Reference to parent account |
| `email` | STRING(255) | NOT NULL, UNIQUE | User's email address (login) |
| `first_name` | STRING(255) | NOT NULL | User's first name |
| `last_name` | STRING(255) | NOT NULL | User's last name |
| `role` | STRING(255) | NOT NULL, DEFAULT 'user' | User role (owner/admin/user/analyst) |
| `lithic_account_holder_token` | STRING(255) | NULLABLE | Lithic account holder token |
| `status` | STRING(255) | DEFAULT 'active' | User status (active/inactive) |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Last update timestamp |

### Primary Key

- **Column:** `id`
- **Type:** Integer, Auto-increment
- **Purpose:** Unique identifier for each user

### Foreign Keys

| Column | References | On Delete | Description |
|--------|-----------|-----------|-------------|
| `account_id` | `accounts.id` | CASCADE | Parent account |

### Unique Constraints

- **`email`** - One email per user globally

### Default Values

- `role`: 'user'
- `status`: 'active'

### Role Values

- **owner** - Full account control (account creator)
- **admin** - Can create users and cards
- **user** - Standard user with card access
- **analyst** - Read-only reporting access

### Notes

- Each user belongs to exactly one account
- Email is used for authentication (POC: no password)
- Lithic account holder created when user is onboarded
- Role determines UI permissions and API access

---

## Table: `cards`

**Purpose:** Stores card information for cards issued to users. Integrates with Lithic API for physical/virtual card provisioning.

**Importance:** 🟡 **HIGH** - Primary business entity for card operations.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique card identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY | Reference to parent account |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | Reference to card holder |
| `spending_profile_id` | INTEGER | NULLABLE, FOREIGN KEY | Optional spending controls |
| `lithic_card_token` | STRING(255) | NULLABLE | Lithic card token reference |
| `card_type` | STRING(255) | NOT NULL | Card type (debit/reloadable) |
| `last_four` | STRING(4) | NULLABLE | Last 4 digits of card number |
| `status` | STRING(255) | DEFAULT 'pending' | Card status (pending/active/inactive/frozen) |
| `spend_limit` | DECIMAL(10,2) | NULLABLE | Individual card spend limit |
| `spend_limit_duration` | STRING(255) | NULLABLE | Limit duration (daily/monthly/yearly) |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Last update timestamp |

### Primary Key

- **Column:** `id`
- **Type:** Integer, Auto-increment
- **Purpose:** Unique identifier for each card

### Foreign Keys

| Column | References | On Delete | Description |
|--------|-----------|-----------|-------------|
| `account_id` | `accounts.id` | CASCADE | Parent account |
| `user_id` | `users.id` | CASCADE | Card holder |
| `spending_profile_id` | `spending_profiles.id` | SET NULL | Optional spending controls |

### Default Values

- `status`: 'pending'

### Card Types

- **debit** - Direct debit from financial account
- **reloadable** - Prepaid card with loadable balance

### Card Statuses

- **pending** - Card creation in progress
- **active** - Card is active and usable
- **inactive** - Card deactivated
- **frozen** - Temporarily suspended

### Notes

- Each card belongs to one account and one user
- Spending profile is optional (null = no restrictions)
- Card-level spend limits override profile limits
- `last_four` populated after Lithic provisioning
- Status synced with Lithic API

---

## Table: `spending_profiles`

**Purpose:** Reusable templates for spending restrictions. Applied to cards for merchant category restrictions and spending limits.

**Importance:** 🟢 **MEDIUM** - Optional feature for spending controls.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique profile identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY | Reference to parent account |
| `name` | STRING(255) | NOT NULL | Profile name (e.g., "Travel Only") |
| `description` | TEXT | NULLABLE | Profile description |
| `spend_limit` | DECIMAL(10,2) | NULLABLE | Spend limit amount |
| `spend_limit_duration` | STRING(255) | NULLABLE | Limit duration (daily/monthly/yearly) |
| `allowed_categories` | JSON | NULLABLE | Array of allowed MCC codes |
| `blocked_categories` | JSON | NULLABLE | Array of blocked MCC codes |
| `lithic_auth_rule_token` | STRING(255) | NULLABLE | Lithic authorization rule token |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Last update timestamp |

### Primary Key

- **Column:** `id`
- **Type:** Integer, Auto-increment
- **Purpose:** Unique identifier for each profile

### Foreign Keys

| Column | References | On Delete | Description |
|--------|-----------|-----------|-------------|
| `account_id` | `accounts.id` | CASCADE | Parent account |

### JSON Fields

**`allowed_categories`** - Array of MCC codes
```json
["5812", "5814"]  // Restaurants
```

**`blocked_categories`** - Array of MCC codes
```json
["7995", "5813"]  // Gambling, bars
```

### Notes

- Profiles are account-scoped (reusable within account)
- One profile can be applied to multiple cards
- JSON fields allow flexible category definitions
- Lithic auth rule created when profile is applied
- Null categories = no restrictions

---

## Schema Statistics

### Table Sizes (Typical POC Usage)

| Table | Estimated Rows | Growth Rate |
|-------|---------------|-------------|
| accounts | 10-100 | Slow (businesses) |
| users | 50-1000 | Moderate (5-10 per account) |
| cards | 100-5000 | Fast (1-5 per user) |
| spending_profiles | 20-200 | Slow (reusable templates) |

### Storage Estimates (SQLite)

- **Small deployment:** < 1 MB (10 accounts, 100 users)
- **Medium deployment:** 5-10 MB (100 accounts, 1000 users)
- **Large deployment:** 50-100 MB (1000 accounts, 10000 users)

### Column Type Distribution

| Data Type | Count | Percentage |
|-----------|-------|------------|
| INTEGER | 12 | 32% |
| STRING | 23 | 62% |
| DECIMAL | 5 | 14% |
| JSON | 2 | 5% |
| TEXT | 1 | 3% |
| TIMESTAMP | 8 | 22% |

---

## Automatic Fields (Sequelize)

All tables automatically include:

### Timestamps
- **`created_at`** - Set on INSERT
- **`updated_at`** - Set on INSERT and UPDATE

### Naming Conventions
- **Table names:** Plural, lowercase (accounts, users, cards, spending_profiles)
- **Column names:** snake_case (first_name, lithic_card_token)
- **Sequelize config:** `timestamps: true, underscored: true`

---

## Data Integrity Rules

### Cascade Deletes

When an account is deleted:
- ✅ All users deleted
- ✅ All cards deleted
- ✅ All spending profiles deleted

When a user is deleted:
- ✅ All their cards deleted

When a spending profile is deleted:
- ⚠️ Cards' `spending_profile_id` set to NULL (not deleted)

### NULL Handling

**Cannot be NULL:**
- All `id` fields (primary keys)
- All `account_id` fields (foreign keys)
- User: `email`, `first_name`, `last_name`, `role`
- Card: `user_id`, `card_type`
- SpendingProfile: `name`

**Can be NULL:**
- All Lithic token fields (populated after API calls)
- Card: `spending_profile_id`, `spend_limit`
- SpendingProfile: `description`, spending controls

---

**Last Updated:** 2025-10-06

**Next:** See [RELATIONSHIPS.md](RELATIONSHIPS.md) for entity relationships
