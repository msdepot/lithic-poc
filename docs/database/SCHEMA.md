# Database Schema

Last Updated: 2025-10-06

This document describes the relational schema used by the backend (Sequelize). It focuses on tables, columns, primary keys, foreign keys, and relationships actually defined in the model files.

## Overview

- Dialect: SQLite by default, PostgreSQL-ready
- ORM: Sequelize (`sequelize.sync()` creates tables)
- Naming: `underscored: true` with `created_at` and `updated_at` timestamps

## Tables

### accounts
- Primary key: `id`
- Columns:
  - `id` INTEGER, auto-increment
  - `business_name` STRING, not null
  - `owner_email` STRING, not null, unique
  - `lithic_account_token` STRING, nullable
  - `lithic_financial_account_token` STRING, nullable
  - `balance` DECIMAL(10,2), default 0
  - `status` STRING, default 'active'
  - `created_at` DATETIME
  - `updated_at` DATETIME

### users
- Primary key: `id`
- Foreign keys:
  - `account_id` → `accounts.id`
- Columns:
  - `id` INTEGER, auto-increment
  - `account_id` INTEGER, not null
  - `email` STRING, not null, unique
  - `first_name` STRING, not null
  - `last_name` STRING, not null
  - `role` STRING, not null, default 'user'
  - `lithic_account_holder_token` STRING, nullable
  - `status` STRING, default 'active'
  - `created_at` DATETIME
  - `updated_at` DATETIME

### cards
- Primary key: `id`
- Foreign keys:
  - `account_id` → `accounts.id`
  - `user_id` → `users.id`
  - `spending_profile_id` → `spending_profiles.id` (nullable)
- Columns:
  - `id` INTEGER, auto-increment
  - `account_id` INTEGER, not null
  - `user_id` INTEGER, not null
  - `spending_profile_id` INTEGER, nullable
  - `lithic_card_token` STRING, nullable
  - `card_type` STRING, not null
  - `last_four` STRING, nullable
  - `status` STRING, default 'pending'
  - `spend_limit` DECIMAL(10,2), nullable
  - `spend_limit_duration` STRING, nullable
  - `created_at` DATETIME
  - `updated_at` DATETIME

### spending_profiles
- Primary key: `id`
- Foreign keys:
  - `account_id` → `accounts.id`
- Columns:
  - `id` INTEGER, auto-increment
  - `account_id` INTEGER, not null
  - `name` STRING, not null
  - `description` TEXT, nullable
  - `spend_limit` DECIMAL(10,2), nullable
  - `spend_limit_duration` STRING, nullable
  - `allowed_categories` JSON, nullable
  - `blocked_categories` JSON, nullable
  - `lithic_auth_rule_token` STRING, nullable
  - `created_at` DATETIME
  - `updated_at` DATETIME

## Relationships
- `Account hasMany User` via `users.account_id`
- `Account hasMany Card` via `cards.account_id`
- `User belongsTo Account`
- `User hasMany Card` via `cards.user_id`
- `Card belongsTo Account`
- `Card belongsTo User`
- `SpendingProfile hasMany Card` via `cards.spending_profile_id`
- `Card belongsTo SpendingProfile`

## Notes
- All tables include timestamps due to `timestamps: true`
- All tables use snake_case columns due to `underscored: true`
- Foreign key constraints are defined at the ORM level; onDelete/onUpdate behaviors are default (not explicitly set)
