# 📋 Database Tables Documentation

Detailed documentation of all database tables, columns, constraints, and indexes.

---

## Table: `accounts`

### Purpose
Stores business account information. This is the root entity that owns all users, cards, and spending profiles in the system.

### Schema Definition

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique account identifier |
| `business_name` | STRING | NOT NULL | - | Business or organization name |
| `owner_email` | STRING | NOT NULL, UNIQUE | - | Primary contact email (used for account owner login) |
| `lithic_account_token` | STRING | - | NULL | Lithic API account token for integration |
| `lithic_financial_account_token` | STRING | - | NULL | Lithic financial account token for funding |
| `balance` | DECIMAL(10,2) | - | 0.00 | Current account balance in dollars |
| `status` | STRING | - | 'active' | Account status (active/inactive/suspended) |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| PRIMARY | `id` | PRIMARY KEY | Unique identifier |
| `owner_email` | `owner_email` | UNIQUE | Prevent duplicate business registrations |

### Relationships

**Outgoing (Has Many):**
- `users` - One account has many users (FK: `users.account_id`)
- `cards` - One account has many cards (FK: `cards.account_id`)
- `spending_profiles` - One account has many spending profiles (FK: `spending_profiles.account_id`)

**Incoming:**
- None (root entity)

### Business Rules

1. **Uniqueness:** Each `owner_email` must be unique across all accounts
2. **Required Fields:** `business_name` and `owner_email` are mandatory
3. **Balance:** Cannot be negative (should add CHECK constraint)
4. **Status Values:** Should be ENUM ('active', 'inactive', 'suspended')
5. **Lithic Tokens:** Populated after successful Lithic API integration

### Example Data

```sql
{
  id: 1,
  business_name: "Acme Corporation",
  owner_email: "eric@acme.com",
  lithic_account_token: "aac_1234567890abcdef",
  lithic_financial_account_token: "fa_abcdef1234567890",
  balance: 5000.00,
  status: "active",
  created_at: "2025-10-01T10:00:00Z",
  updated_at: "2025-10-06T15:30:00Z"
}
```

---

## Table: `users`

### Purpose
Stores individual users (cardholders) within an account. Supports role-based access control and links to Lithic account holders.

### Schema Definition

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique user identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY → `accounts.id` | - | Parent account reference |
| `email` | STRING | NOT NULL, UNIQUE | - | User's email address (login credential) |
| `first_name` | STRING | NOT NULL | - | User's first name |
| `last_name` | STRING | NOT NULL | - | User's last name |
| `role` | STRING | NOT NULL | 'user' | User role (owner/admin/user/analyst) |
| `lithic_account_holder_token` | STRING | - | NULL | Lithic account holder token |
| `status` | STRING | - | 'active' | User status (active/inactive/suspended) |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| PRIMARY | `id` | PRIMARY KEY | Unique identifier |
| `email` | `email` | UNIQUE | Fast login lookup, prevent duplicates |
| `account_id` | `account_id` | FOREIGN KEY INDEX | Optimize account-scoped queries |

### Relationships

**Outgoing (Has Many):**
- `cards` - One user can have many cards (FK: `cards.user_id`)

**Incoming (Belongs To):**
- `accounts` - Each user belongs to one account (FK: `account_id`)

### Business Rules

1. **Email Uniqueness:** Email must be unique across ALL users (not just within account)
2. **Role Values:** Must be one of: 'owner', 'admin', 'user', 'analyst'
3. **Account Association:** Every user MUST belong to a valid account
4. **Lithic Holder:** Token populated when user is created in Lithic
5. **Name Requirements:** Both first and last names are mandatory

### Role Permissions

| Role | Create Users | Create Cards | View All Cards | Modify Settings |
|------|--------------|--------------|----------------|-----------------|
| owner | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ❌ |
| user | ❌ | ❌ | Own cards only | ❌ |
| analyst | ❌ | ❌ | ✅ (read-only) | ❌ |

### Example Data

```sql
{
  id: 1,
  account_id: 1,
  email: "eric@acme.com",
  first_name: "Eric",
  last_name: "Smith",
  role: "owner",
  lithic_account_holder_token: "ah_1234567890abcdef",
  status: "active",
  created_at: "2025-10-01T10:05:00Z",
  updated_at: "2025-10-01T10:05:00Z"
}
```

---

## Table: `spending_profiles`

### Purpose
Stores reusable spending control templates that can be applied to multiple cards. Maps to Lithic Auth Rules for transaction authorization.

### Schema Definition

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique profile identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY → `accounts.id` | - | Parent account reference |
| `name` | STRING | NOT NULL | - | Profile name (e.g., "Travel Cards", "Employee Spend") |
| `description` | TEXT | - | NULL | Detailed description of profile purpose |
| `spend_limit` | DECIMAL(10,2) | - | NULL | Maximum spending amount |
| `spend_limit_duration` | STRING | - | NULL | Limit timeframe (daily/monthly/yearly/lifetime) |
| `allowed_categories` | JSON | - | NULL | Array of allowed MCC codes |
| `blocked_categories` | JSON | - | NULL | Array of blocked MCC codes |
| `lithic_auth_rule_token` | STRING | - | NULL | Lithic authorization rule token |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| PRIMARY | `id` | PRIMARY KEY | Unique identifier |
| `account_id` | `account_id` | FOREIGN KEY INDEX | Optimize account-scoped queries |

### Relationships

**Outgoing (Has Many):**
- `cards` - One profile can be applied to many cards (FK: `cards.spending_profile_id`)

**Incoming (Belongs To):**
- `accounts` - Each profile belongs to one account (FK: `account_id`)

### Business Rules

1. **Account Scoped:** Profiles can only be used by cards in the same account
2. **Optional Limits:** Spend limit and duration can be NULL (unlimited)
3. **Category Control:** Can specify allowed OR blocked categories (or both)
4. **MCC Format:** Categories stored as JSON arrays of MCC codes (e.g., `["5411", "5812"]`)
5. **Reusability:** Same profile can be assigned to multiple cards
6. **Duration Values:** Should be ENUM ('daily', 'monthly', 'yearly', 'lifetime')

### MCC Category Examples

```json
{
  "allowed_categories": [
    "5411",  // Grocery Stores
    "5812",  // Eating Places, Restaurants
    "5541"   // Service Stations
  ],
  "blocked_categories": [
    "7995",  // Gambling
    "5813"   // Drinking Places (Bars)
  ]
}
```

### Example Data

```sql
{
  id: 1,
  account_id: 1,
  name: "Employee Travel Profile",
  description: "For employee travel expenses - flights, hotels, meals",
  spend_limit: 2500.00,
  spend_limit_duration: "monthly",
  allowed_categories: ["3000-3299", "4000-4799", "5812"],
  blocked_categories: ["7995"],
  lithic_auth_rule_token: "ar_1234567890abcdef",
  created_at: "2025-10-01T11:00:00Z",
  updated_at: "2025-10-01T11:00:00Z"
}
```

---

## Table: `cards`

### Purpose
Central entity representing individual payment cards issued to users. Links users, accounts, and spending profiles together.

### Schema Definition

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | - | Unique card identifier |
| `account_id` | INTEGER | NOT NULL, FOREIGN KEY → `accounts.id` | - | Parent account reference |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY → `users.id` | - | Cardholder reference |
| `spending_profile_id` | INTEGER | FOREIGN KEY → `spending_profiles.id` | NULL | Optional spending profile |
| `lithic_card_token` | STRING | - | NULL | Lithic card token |
| `card_type` | STRING | NOT NULL | - | Card type (debit/reloadable/virtual) |
| `last_four` | STRING | - | NULL | Last 4 digits of card number |
| `status` | STRING | - | 'pending' | Card status (pending/active/inactive/closed) |
| `spend_limit` | DECIMAL(10,2) | - | NULL | Card-specific spending limit |
| `spend_limit_duration` | STRING | - | NULL | Limit timeframe (daily/monthly/yearly) |
| `created_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp |

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| PRIMARY | `id` | PRIMARY KEY | Unique identifier |
| `account_id` | `account_id` | FOREIGN KEY INDEX | Account-scoped queries |
| `user_id` | `user_id` | FOREIGN KEY INDEX | User's card lookups |
| `spending_profile_id` | `spending_profile_id` | FOREIGN KEY INDEX | Profile-based queries |
| `lithic_card_token` | `lithic_card_token` | INDEX (recommended) | Fast Lithic webhook lookups |

### Relationships

**Incoming (Belongs To):**
- `accounts` - Each card belongs to one account (FK: `account_id`)
- `users` - Each card belongs to one user (FK: `user_id`)
- `spending_profiles` - Each card optionally has one profile (FK: `spending_profile_id`)

### Business Rules

1. **Account Consistency:** Card's `account_id` must match user's `account_id`
2. **Profile Scope:** If using a profile, it must belong to same account
3. **Spending Control Priority:**
   - If `spending_profile_id` is set: Use profile rules
   - If card-level `spend_limit` is set: Use card-specific limit
   - Both can coexist (card limit can be more restrictive)
4. **Card Types:** Should be ENUM ('debit', 'reloadable', 'virtual', 'physical')
5. **Status Lifecycle:** pending → active → inactive/closed
6. **Last Four:** Populated after successful card creation in Lithic

### Spending Control Hierarchy

```
Profile Limits (global)
    ↓
Card-specific Limits (override/restrict further)
    ↓
Transaction Authorization
```

### Status Values

| Status | Description | User Actions |
|--------|-------------|--------------|
| pending | Card creation in progress | None |
| active | Card is active and can be used | View, use for transactions |
| inactive | Temporarily suspended | Can be reactivated |
| closed | Permanently closed | Read-only |

### Example Data

```sql
{
  id: 1,
  account_id: 1,
  user_id: 3,
  spending_profile_id: 1,
  lithic_card_token: "card_1234567890abcdef",
  card_type: "virtual",
  last_four: "4242",
  status: "active",
  spend_limit: 1000.00,
  spend_limit_duration: "monthly",
  created_at: "2025-10-02T09:00:00Z",
  updated_at: "2025-10-06T14:20:00Z"
}
```

---

## Summary Table

| Table | Rows (Estimated) | Primary Purpose | Most Important Indexes |
|-------|------------------|-----------------|------------------------|
| `accounts` | Low (10-1000) | Multi-tenant root | `id`, `owner_email` |
| `users` | Medium (100-10K) | User management | `id`, `email`, `account_id` |
| `spending_profiles` | Low (10-500) | Reusable templates | `id`, `account_id` |
| `cards` | High (1K-100K+) | Card tracking | `id`, `account_id`, `user_id`, `lithic_card_token` |

---

## Maintenance Recommendations

### Regular Cleanup
- Archive closed cards older than 7 years (compliance)
- Remove inactive accounts after notification period
- Audit orphaned Lithic tokens

### Monitoring
- Track table growth rates
- Monitor query performance on foreign key joins
- Alert on failed Lithic token validations

### Backup Strategy
- Daily incremental backups
- Weekly full backups
- Test restore procedures monthly

---

**Last Updated:** 2025-10-06  
**Schema Version:** 1.0
