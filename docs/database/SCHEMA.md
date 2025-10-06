# Schema Overview

The backend uses Sequelize models defined in `backend/models`. The default runtime database is SQLite (file `database.sqlite`), with Postgres supported via env vars (set `DB_DIALECT=postgres`).

## Tables

### accounts
- id (INTEGER, PK, auto-increment)
- business_name (STRING, NOT NULL)
- owner_email (STRING, NOT NULL, UNIQUE)
- lithic_account_token (STRING, NULLABLE)
- lithic_financial_account_token (STRING, NULLABLE)
- balance (DECIMAL(10,2), DEFAULT 0)
- status (STRING, DEFAULT 'active')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Indexes:
- UNIQUE(owner_email)

### users
- id (INTEGER, PK, auto-increment)
- account_id (INTEGER, NOT NULL) — FK → accounts.id
- email (STRING, NOT NULL, UNIQUE)
- first_name (STRING, NOT NULL)
- last_name (STRING, NOT NULL)
- role (STRING, NOT NULL, DEFAULT 'user')
- lithic_account_holder_token (STRING, NULLABLE)
- status (STRING, DEFAULT 'active')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Indexes:
- UNIQUE(email)
- (Recommended) INDEX(account_id)

### spending_profiles
- id (INTEGER, PK, auto-increment)
- account_id (INTEGER, NOT NULL) — FK → accounts.id
- name (STRING, NOT NULL)
- description (TEXT, NULLABLE)
- spend_limit (DECIMAL(10,2), NULLABLE)
- spend_limit_duration (STRING, NULLABLE)
- allowed_categories (JSON, NULLABLE)
- blocked_categories (JSON, NULLABLE)
- lithic_auth_rule_token (STRING, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Indexes:
- (Recommended) INDEX(account_id)
- (Optional) UNIQUE(account_id, name) to prevent duplicates

### cards
- id (INTEGER, PK, auto-increment)
- account_id (INTEGER, NOT NULL) — FK → accounts.id
- user_id (INTEGER, NOT NULL) — FK → users.id
- spending_profile_id (INTEGER, NULLABLE) — FK → spending_profiles.id
- lithic_card_token (STRING, NULLABLE)
- card_type (STRING, NOT NULL)
- last_four (STRING, NULLABLE)
- status (STRING, DEFAULT 'pending')
- spend_limit (DECIMAL(10,2), NULLABLE)
- spend_limit_duration (STRING, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Indexes:
- (Recommended) INDEX(account_id)
- (Recommended) INDEX(user_id)
- (Optional) UNIQUE(lithic_card_token) if managed as unique

## Relationships
- accounts 1—N users (via users.account_id)
- accounts 1—N cards (via cards.account_id)
- users 1—N cards (via cards.user_id)
- spending_profiles 1—N cards (via cards.spending_profile_id)
- accounts 1—N spending_profiles (via spending_profiles.account_id)

Note: Relationships are configured in `backend/models/index.js` using Sequelize associations.
