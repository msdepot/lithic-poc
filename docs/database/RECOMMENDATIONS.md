# Schema Recommendations

Last Updated: 2025-10-06

This document lists targeted improvements for the current schema and guidance for moving from SQLite to PostgreSQL.

## Improvements

- Validation & Types
  - `users.role`: change to ENUM('owner','admin','user','analyst') in Postgres; validate in model
  - Monetary fields (`accounts.balance`, `cards.spend_limit`, `spending_profiles.spend_limit`): store as INTEGER cents to avoid float/scale issues; or use `DECIMAL(12,2)` with server-side normalization
  - `status` columns: add ENUMs or constrained values per table

- Uniqueness & Integrity
  - `users.email`: make unique per `account_id` instead of globally if multiple accounts can reuse email
  - `spending_profiles (account_id,name)`: unique to prevent duplicates per account
  - Add NOT NULL where appropriate: `accounts.status`, `users.status`, `cards.status`
  - Add `onDelete`/`onUpdate` behaviors: e.g., cascade delete cards when user or account is removed

- Indexing (see INDEXES.md)
  - Add indexes on all FK columns: `account_id`, `user_id`, `spending_profile_id`
  - Token columns used for external lookups: add unique indexes if tokens are 1:1

- Auditing & Metadata
  - Add `deleted_at` (paranoid tables) for soft deletes where appropriate
  - Add `created_by`, `updated_by` in auditable tables
  - Add `last_login_at` to `users`

- JSON Columns
  - `allowed_categories` and `blocked_categories`: in Postgres, consider `jsonb` with GIN index if you need to query categories; otherwise keep as arrays and manage at app level

- Naming & Consistency
  - Standardize `lithic_*` fields naming (e.g., `_token` suffix)
  - Ensure all tables use `underscored` and timestamps consistently

## Example Sequelize Enhancements

- Add enums and indexes (Postgres dialect):
```js
const User = sequelize.define('User', {
  // ...
  role: {
    type: DataTypes.ENUM('owner','admin','user','analyst'),
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true, // adds deleted_at
  indexes: [
    { fields: ['account_id'] },
    { unique: true, fields: ['account_id','email'] }
  ]
});
```

- Add cascading behavior in associations:
```js
Account.hasMany(User, { foreignKey: 'account_id', onDelete: 'CASCADE' });
User.belongsTo(Account, { foreignKey: 'account_id', onDelete: 'CASCADE' });
```

## Migration to PostgreSQL

1. Configure `.env` with Postgres settings, install `pg` dependencies
2. Create migration scripts:
   - Create tables with appropriate types (ENUMs, DECIMAL/INTEGER for money)
   - Add the indexes and unique constraints
   - Define foreign keys with `ON DELETE` and `ON UPDATE`
3. Data migration:
   - Export from SQLite; transform monetary values to cents if changing type
   - Ensure uniqueness constraints are satisfied
4. Cutover:
   - Run migrations against Postgres
   - Point app to Postgres (`DB_DIALECT=postgres`)
   - Validate with integration tests

## Future Extensions

- Add `transactions` table for card authorizations, clears, and refunds
- Add `webhook_events` table to store Lithic webhooks with deduplication key
- Add `auth_rules` table if Lithic auth rules are managed internally
- Add `account_funding_sources` if supporting multiple ledgers
