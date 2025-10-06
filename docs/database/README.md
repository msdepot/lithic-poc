# 🗄️ Database Documentation

This folder contains comprehensive documentation for the Lithic POC database schema.

## 📚 Documentation Structure

- **[SCHEMA_OVERVIEW.md](SCHEMA_OVERVIEW.md)** - Complete database schema overview with ERD
- **[TABLES.md](TABLES.md)** - Detailed documentation of all tables, columns, primary keys, and indexes
- **[RELATIONSHIPS.md](RELATIONSHIPS.md)** - Foreign key relationships and data integrity
- **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - Schema improvement recommendations and best practices

## 🎯 Quick Reference

### Database Technology
- **ORM:** Sequelize
- **Default Database:** SQLite (`database.sqlite`)
- **Production Ready:** PostgreSQL (configurable via environment)
- **Timestamps:** All tables include `created_at` and `updated_at`

### Core Tables (4)

| Table | Purpose | Primary Key | Foreign Keys |
|-------|---------|-------------|--------------|
| `accounts` | Business accounts | `id` (INTEGER) | None |
| `users` | Account users/cardholders | `id` (INTEGER) | `account_id` |
| `cards` | Issued payment cards | `id` (INTEGER) | `account_id`, `user_id`, `spending_profile_id` |
| `spending_profiles` | Spending control templates | `id` (INTEGER) | `account_id` |

### Key Relationships

```
accounts (1) ──< users (many)
accounts (1) ──< cards (many)
accounts (1) ──< spending_profiles (many)
users (1) ──< cards (many)
spending_profiles (1) ──< cards (many)
```

## 🔍 Important Indexes

### Unique Constraints
- `users.email` - Email must be unique across all users
- `accounts.owner_email` - Owner email must be unique across accounts

### Foreign Key Indexes
Sequelize automatically creates indexes on all foreign key columns for optimal join performance.

## 🚀 Quick Start

### View Current Schema
```bash
# SQLite
sqlite3 database.sqlite ".schema"

# Or use Sequelize sync to see what would be created
node -e "require('./backend/models').sequelize.sync({ logging: console.log })"
```

### Database Migrations
Currently using Sequelize auto-sync. For production, consider implementing proper migrations using Sequelize CLI or Umzug.

## 📊 Table Statistics

Based on the current schema design:

- **Total Tables:** 4
- **Total Relationships:** 5 foreign keys
- **Unique Constraints:** 2
- **Auto-incrementing PKs:** 4
- **Lithic Integration Fields:** 6 token storage fields
- **JSON Columns:** 2 (allowed_categories, blocked_categories)

---

**Last Updated:** 2025-10-06  
**Schema Version:** 1.0  
**Database:** Lithic POC
