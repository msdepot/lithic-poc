# 📊 Database Documentation

This directory contains comprehensive documentation for the Lithic POC database schema.

## 📑 Documentation Index

- **[SCHEMA_OVERVIEW.md](SCHEMA_OVERVIEW.md)** - Complete schema overview with all tables, columns, and data types
- **[RELATIONSHIPS.md](RELATIONSHIPS.md)** - Entity relationships and foreign key constraints
- **[INDEXES.md](INDEXES.md)** - Current and recommended indexes for performance
- **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - Schema improvement recommendations
- **[ER_DIAGRAM.md](ER_DIAGRAM.md)** - Visual entity relationship diagrams

## 🗄️ Database Technology

- **ORM:** Sequelize v6.32.0
- **Default:** SQLite (file-based, `./database.sqlite`)
- **Production Ready:** PostgreSQL (configurable via environment)

## 📊 Schema Summary

The Lithic POC database consists of 4 core tables:

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| **accounts** | Business accounts | Parent of users, cards, spending_profiles |
| **users** | User accounts with roles | Belongs to account, has many cards |
| **cards** | Issued cards | Belongs to account, user, optional spending_profile |
| **spending_profiles** | Spending control templates | Belongs to account, has many cards |

## 🔑 Key Features

- **Multi-tenancy:** Account-based data isolation
- **Role-based Access:** Owner, Admin, User, Analyst roles
- **Lithic Integration:** External tokens stored for API sync
- **Flexible Constraints:** JSON fields for dynamic data
- **Audit Trails:** Automatic timestamps (created_at, updated_at)

## 🚀 Getting Started

1. Start with [SCHEMA_OVERVIEW.md](SCHEMA_OVERVIEW.md) to understand all tables
2. Review [RELATIONSHIPS.md](RELATIONSHIPS.md) for data modeling
3. Check [INDEXES.md](INDEXES.md) for query optimization
4. Read [RECOMMENDATIONS.md](RECOMMENDATIONS.md) for improvements
5. Reference [ER_DIAGRAM.md](ER_DIAGRAM.md) for visual understanding

## 📈 Database Growth Projections

Based on typical usage patterns:

| Entity | Expected Growth |
|--------|-----------------|
| Accounts | ~100-1000 (stable) |
| Users | ~5-50 per account |
| Cards | ~1-10 per user |
| Spending Profiles | ~5-20 per account |

## ⚠️ Important Notes

- All foreign keys use integer IDs (auto-increment)
- Sequelize automatically adds `created_at` and `updated_at` timestamps
- Column names use `snake_case` (underscored: true)
- Table names are pluralized (accounts, users, cards, spending_profiles)
- Lithic tokens are stored as strings for API integration

---

**Last Updated:** 2025-10-06

**For questions:** Refer to individual documentation files or the main [ARCHITECTURE.md](../ARCHITECTURE.md)
