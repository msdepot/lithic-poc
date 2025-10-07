# Indexes

Last Updated: 2025-10-06

This document lists known unique constraints and recommends additional indexes based on observed query patterns in routes.

## Existing Constraints (from models)

- `accounts`
  - UNIQUE(`owner_email`)
- `users`
  - UNIQUE(`email`)

Note: Sequelize models do not define explicit non-unique indexes; defaults depend on the dialect. In SQLite, foreign keys do not auto-index. In PostgreSQL, indexes are not automatically created for foreign keys.

## Observed Query Patterns

From route handlers:
- Filter by `users.account_id` when listing users
- Filter by `cards.account_id` when listing cards
- Join `cards` to `users` by `user_id`
- Optional filter/join on `cards.spending_profile_id`
- Lookups by `users.email` during login
- Lookups/joins by Lithic tokens (`lithic_*`) for integration flows (present in data model)

## Recommended Indexes

These indexes improve common read paths and FK joins:

- `users`
  - INDEX(`account_id`)
  - UNIQUE(`account_id`, `email`) — if multi-tenant uniqueness is desired per account
  - INDEX(`status`) — if frequently filtered by status

- `cards`
  - INDEX(`account_id`)
  - INDEX(`user_id`)
  - INDEX(`spending_profile_id`)
  - INDEX(`status`)
  - INDEX(`last_four`) — if last four is used for lookups
  - UNIQUE(`lithic_card_token`) — if token must be unique

- `spending_profiles`
  - INDEX(`account_id`)
  - UNIQUE(`account_id`, `name`) — prevent duplicate profile names per account

- `accounts`
  - UNIQUE(`owner_email`) already exists
  - INDEX(`status`)
  - UNIQUE(`lithic_account_token`) — if one-to-one with Lithic account holder
  - UNIQUE(`lithic_financial_account_token`) — if one-to-one with Lithic financial account

## Sequelize Model Hints

To enforce these at the model level, add `indexes` or `unique` constraints in each model definition.

Example for `users`:
```js
const User = sequelize.define('User', { /* attributes */ }, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['account_id'] },
    { fields: ['status'] },
    { unique: true, fields: ['account_id', 'email'] }
  ]
});
```

## Migration Strategy

- SQLite dev: `sequelize.sync({ alter: true })` can update schema, but verify carefully.
- PostgreSQL: create explicit migrations to add indexes and constraints.
- Roll out in stages: add non-unique indexes first, validate data integrity, then add unique constraints after de-duplication if needed.
