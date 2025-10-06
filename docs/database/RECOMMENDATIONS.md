# Schema Recommendations

The schema is clean and minimal for a POC. Below are targeted improvements and extensions to improve data integrity, performance, and scalability, especially when moving from SQLite to Postgres in production.

## Data Integrity & Constraints
- Add NOT NULL + length constraints where appropriate:
  - `accounts.business_name` length (e.g., VARCHAR(200))
  - `users.email` length + format validation at app layer; DB CHECK via Postgres optional
  - `cards.card_type` consider ENUM('virtual','physical','single_use','merchant_locked')
  - `cards.status` consider ENUM('pending','active','inactive','canceled')
- Add unique and composite keys where business rules require:
  - `spending_profiles`: UNIQUE(account_id, name) to prevent duplicates per account
  - `cards.lithic_card_token`: UNIQUE if token is guaranteed unique
- Add ON DELETE/UPDATE behavior on FKs (especially in Postgres):
  - `users.account_id` → ON DELETE CASCADE if deleting an account should delete its users; otherwise RESTRICT
  - `cards.user_id`/`cards.account_id` → CASCADE or RESTRICT based on lifecycle rules
  - `cards.spending_profile_id` → SET NULL on profile deletion, if desired

## Indexing
- Add foreign key indexes explicitly (Postgres typically benefits):
  - `users(account_id)`
  - `spending_profiles(account_id)`
  - `cards(account_id)`, `cards(user_id)`, `cards(spending_profile_id)`
- Consider partial or conditional indexes in Postgres for common queries, e.g.:
  - `cards (account_id) WHERE status = 'active'`

## Auditing & Observability
- Add immutable audit fields:
  - `created_by_user_id`, `updated_by_user_id` on auditable tables
  - For critical operations, consider `events` table capturing lifecycle events from Lithic webhooks
- Store Lithic webhook deliveries:
  - `webhook_events` table with delivery id, type, payload hash, processed_at, status

## Monetary & Locale Considerations
- Store amounts in integer minor units to avoid rounding (`BIGINT cents`). If keeping DECIMAL, ensure precision (e.g., DECIMAL(18, 2)).
- Add currency code (`accounts`, `cards` limits) if multi-currency is envisioned.

## Security & PII
- Separate PII into a dedicated table with restricted access if required by compliance.
- Mask or hash sensitive identifiers where possible (last four is fine, avoid storing full PANs).

## Extensions / New Tables
- `transactions` table to capture Lithic authorization and settlement data:
  - `id (PK)`, `account_id (FK)`, `card_id (FK)`, `user_id (FK)`, `lithic_transaction_token (UNIQUE)`, `amount`, `currency`, `merchant_data (JSONB)`, `status`, `occurred_at`
  - Index on `(card_id, occurred_at)` and `(account_id, occurred_at)`
- `auth_rules` table if you need to manage multiple Lithic rules per account or profile, versioned over time.
- `budgets` table to set per-user or per-team spend caps, with effective dates.

## Sequelize Model-Level Improvements
- Add model scopes for common filters (e.g., active records).
- Add validation rules (len, isEmail) at the model level for `email`, limits for decimals.
- For Postgres, define ENUMs via `Sequelize.ENUM`.
- Explicitly define indexes in model options for clarity and to ensure generation in Postgres migrations.

## Migration Strategy
- Introduce Sequelize migrations (e.g., `sequelize-cli`) to version the schema.
- Generate initial migration reflecting current models, then incremental migrations for each change above.
- Use `sequelize.sync({ alter: false })` in production; prefer migrations over `sync()`.
