# 🎨 Entity Relationship Diagrams

Visual representations of the database schema, relationships, and data flow.

---

## Complete Schema Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                            ACCOUNTS TABLE                               │
│────────────────────────────────────────────────────────────────────────│
│ PK │ id                              INTEGER AUTO_INCREMENT            │
│    │ business_name                   VARCHAR(255) NOT NULL             │
│ UK │ owner_email                     VARCHAR(255) NOT NULL UNIQUE      │
│    │ lithic_account_token            VARCHAR(255)                      │
│    │ lithic_financial_account_token  VARCHAR(255)                      │
│    │ balance                         DECIMAL(10,2) DEFAULT 0           │
│    │ status                          VARCHAR(255) DEFAULT 'active'     │
│    │ created_at                      TIMESTAMP                         │
│    │ updated_at                      TIMESTAMP                         │
└────┬─────────────────────────────┬─────────────────┬───────────────────┘
     │                             │                 │
     │ 1                           │ 1               │ 1
     │                             │                 │
     │ N                           │ N               │ N
     ▼                             ▼                 ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────────┐
│    USERS TABLE      │   │    CARDS TABLE      │   │ SPENDING_PROFILES TABLE │
│─────────────────────│   │─────────────────────│   │─────────────────────────│
│ PK │ id             │   │ PK │ id             │   │ PK │ id                 │
│ FK │ account_id  ───┼───┼────┼ account_id  ───┼───┼────┼ account_id      ───┤
│ UK │ email          │   │ FK │ user_id     ───┤   │    │ name               │
│    │ first_name     │   │ FK │ spend_prof_id ─┼─┐ │    │ description        │
│    │ last_name      │   │    │ lithic_token   │ │ │    │ spend_limit        │
│    │ role           │   │    │ card_type      │ │ │    │ spend_limit_dur    │
│    │ lithic_token   │   │    │ last_four      │ │ │    │ allowed_categories │
│    │ status         │   │    │ status         │ │ │    │ blocked_categories │
│    │ created_at     │   │    │ spend_limit    │ │ │    │ lithic_auth_token  │
│    │ updated_at     │   │    │ spend_limit_dur│ │ │    │ created_at         │
└─────────┬───────────┘   │    │ created_at     │ │ │    │ updated_at         │
          │               │    │ updated_at     │ │ └─────────────────────────┘
          │ 1             └────────┬────────────┘ │
          │                        │              │
          │ N                      └──────────────┘
          └────────────────────────► N (optional)
                                    Cards can have a
                                    spending profile
```

---

## Detailed Relationship Diagram

```
┏━━━━━━━━━━━━━━━━━━━━━┓
┃      ACCOUNT        ┃ ◄─── Root entity (multi-tenancy boundary)
┃   (Business)        ┃
┗━━━━━━━━━┯━━━━━━━━━━━┛
          │
          │ Owns (1:N)
          │
    ┌─────┴─────┬──────────────┬────────────────┐
    │           │              │                │
    ▼           ▼              ▼                ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────────────┐
│ USERS  │  │ CARDS  │  │ SPENDING │  │ (Future Tables)  │
│        │  │        │  │ PROFILES │  │ - Transactions   │
└───┬────┘  └───┬────┘  └─────┬────┘  │ - Webhooks       │
    │           │             │       │ - Audit Logs     │
    │           │             │       └──────────────────┘
    │ Owns      │ Optional    │
    │ (1:N)     │ Applies to  │
    │           │ (1:N)       │
    └───────────┼─────────────┘
                │
                ▼
            ┌────────┐
            │ CARDS  │ ◄─── Central entity (connects all)
            └────────┘
```

---

## Data Flow Diagram

### Card Creation Flow

```
1. CREATE ACCOUNT
   ├─► accounts table: business_name, owner_email
   └─► Lithic API: Create account holder
       └─► Store: lithic_account_token

2. CREATE USERS
   ├─► users table: email, role, account_id
   └─► Lithic API: Create account holder
       └─► Store: lithic_account_holder_token

3. CREATE SPENDING PROFILE (Optional)
   ├─► spending_profiles table: name, rules, account_id
   └─► Lithic API: Create auth rule
       └─► Store: lithic_auth_rule_token

4. CREATE CARD
   ├─► cards table: user_id, account_id, spending_profile_id
   └─► Lithic API: Create card
       └─► Store: lithic_card_token, last_four
```

---

## Access Control Matrix

```
┌──────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS                         │
├─────────┬──────────┬─────────┬────────────┬─────────────────┤
│  Table  │  Owner   │  Admin  │    User    │    Analyst      │
├─────────┼──────────┼─────────┼────────────┼─────────────────┤
│ Account │ CRUD     │ R       │ R (own)    │ R (own)         │
│ Users   │ CRUD     │ CRUD    │ R (self)   │ R (all)         │
│ Cards   │ CRUD     │ CRUD    │ R (own)    │ R (all)         │
│ Profiles│ CRUD     │ CRUD    │ R (all)    │ R (all)         │
└─────────┴──────────┴─────────┴────────────┴─────────────────┘

Legend: C=Create, R=Read, U=Update, D=Delete
```

---

## Index Strategy Visualization

```
┌──────────────────────────────────────────────────────────┐
│                    INDEXING STRATEGY                     │
└──────────────────────────────────────────────────────────┘

ACCOUNTS
├─► PK: id                         [B-tree, O(log n)]
└─► UK: owner_email                [B-tree, O(log n)]
    ✅ Fast email lookups for login

USERS
├─► PK: id                         [B-tree, O(log n)]
├─► UK: email                      [B-tree, O(log n)]
├─► FK: account_id                 [B-tree, O(log n)]
├─► 🔴 MISSING: role               [Recommended]
└─► 🔴 MISSING: status             [Recommended]
    ⚠️  Slow queries when filtering by role/status

CARDS
├─► PK: id                         [B-tree, O(log n)]
├─► FK: account_id                 [B-tree, O(log n)]
├─► FK: user_id                    [B-tree, O(log n)]
├─► FK: spending_profile_id        [B-tree, O(log n)]
├─► 🔴 MISSING: lithic_card_token  [CRITICAL]
├─► 🔴 MISSING: status             [Recommended]
└─► 🔴 MISSING: (account_id, status, created_at) [Composite]
    ⚠️  Full table scan on Lithic API sync

SPENDING_PROFILES
├─► PK: id                         [B-tree, O(log n)]
├─► FK: account_id                 [B-tree, O(log n)]
└─► 🔴 MISSING: lithic_auth_rule_token [CRITICAL]
    ⚠️  Full table scan on auth rule lookups
```

---

## Query Performance Map

```
┌────────────────────────────────────────────────────────────┐
│              COMMON QUERIES & PERFORMANCE                  │
└────────────────────────────────────────────────────────────┘

🟢 FAST QUERIES (Indexed)
├─► Find user by email
│   SELECT * FROM users WHERE email = ?
│   Uses: email unique index
│   Time: ~1ms
│
├─► Get user's cards
│   SELECT * FROM cards WHERE user_id = ?
│   Uses: user_id foreign key index
│   Time: ~2ms
│
└─► Get account users
    SELECT * FROM users WHERE account_id = ?
    Uses: account_id foreign key index
    Time: ~5ms

🟡 MEDIUM QUERIES (Partially Indexed)
├─► Get account's active cards
│   SELECT * FROM cards WHERE account_id = ? AND status = 'active'
│   Uses: account_id index, then filters status
│   Time: ~20ms (with 1000 cards)
│   Improvement: Add composite index (account_id, status)
│
└─► Get admins in account
    SELECT * FROM users WHERE account_id = ? AND role = 'admin'
    Uses: account_id index, then filters role
    Time: ~15ms (with 500 users)
    Improvement: Add composite index (account_id, role)

🔴 SLOW QUERIES (No Index)
├─► Find card by Lithic token
│   SELECT * FROM cards WHERE lithic_card_token = ?
│   Uses: FULL TABLE SCAN
│   Time: ~100ms (with 10000 cards)
│   Fix: Add index on lithic_card_token
│
└─► Find all active cards globally
    SELECT * FROM cards WHERE status = 'active'
    Uses: FULL TABLE SCAN
    Time: ~200ms (with 10000 cards)
    Fix: Add index on status (if needed globally)
```

---

## Data Size Projections

```
┌────────────────────────────────────────────────────────────┐
│                  STORAGE ESTIMATES                         │
└────────────────────────────────────────────────────────────┘

SMALL DEPLOYMENT (10 accounts, 100 users, 500 cards)
├─► accounts:          10 rows × 500 bytes  = 5 KB
├─► users:            100 rows × 400 bytes  = 40 KB
├─► cards:            500 rows × 600 bytes  = 300 KB
├─► spending_profiles: 50 rows × 800 bytes  = 40 KB
├─► indexes:                                 = 100 KB
└─► Total:                                   ≈ 500 KB

MEDIUM DEPLOYMENT (100 accounts, 1K users, 5K cards)
├─► accounts:         100 rows × 500 bytes  = 50 KB
├─► users:          1,000 rows × 400 bytes  = 400 KB
├─► cards:          5,000 rows × 600 bytes  = 3 MB
├─► spending_profiles:200 rows × 800 bytes  = 160 KB
├─► indexes:                                 = 1 MB
└─► Total:                                   ≈ 5 MB

LARGE DEPLOYMENT (1K accounts, 10K users, 50K cards)
├─► accounts:       1,000 rows × 500 bytes  = 500 KB
├─► users:         10,000 rows × 400 bytes  = 4 MB
├─► cards:         50,000 rows × 600 bytes  = 30 MB
├─► spending_profiles:1K rows × 800 bytes   = 800 KB
├─► indexes:                                 = 10 MB
└─► Total:                                   ≈ 45 MB

+ TRANSACTIONS (Future)
  └─► 1M txns × 500 bytes = 500 MB (primary storage concern)
```

---

## Schema Evolution Path

```
┌────────────────────────────────────────────────────────────┐
│                  EVOLUTION ROADMAP                         │
└────────────────────────────────────────────────────────────┘

PHASE 1: CURRENT (POC) ✅
accounts ─── users ─── cards ─── spending_profiles

PHASE 2: PRODUCTION (Add critical tables) 🔄
accounts ─┬─ users ─────┬─ cards ─── spending_profiles
          │             │
          ├─ audit_logs │
          └─ addresses  │
                        └─ transactions

PHASE 3: ENHANCED (Add advanced features) 📋
accounts ─┬─ users ─────┬─ cards ─┬─ spending_profiles
          │             │         │
          ├─ audit_logs │         ├─ transactions ─── merchants
          ├─ addresses  │         │
          ├─ settings   │         ├─ card_products
          └─ webhooks   │         │
                        │         └─ spending_categories
                        │
                        └─ notifications

PHASE 4: SCALE (Add performance features) 🚀
+ Read replicas
+ Caching layer (Redis)
+ Partitioned tables (transactions by date)
+ Materialized views (analytics)
+ Event sourcing (audit trail)
```

---

## Multi-Tenancy Isolation

```
┌────────────────────────────────────────────────────────────┐
│              DATA ISOLATION PATTERN                        │
└────────────────────────────────────────────────────────────┘

                    ┌─ ACCOUNT 1 ─┐
                    │              │
        ┌───────────┤ users(1,2,3) │
        │           │ cards(1,2,3) │
        │           │ profiles(1)  │
        │           └──────────────┘
        │
    DATABASE        ┌─ ACCOUNT 2 ─┐
        │           │              │
        ├───────────┤ users(4,5,6) │
        │           │ cards(4,5,6) │
        │           │ profiles(2)  │
        │           └──────────────┘
        │
        │           ┌─ ACCOUNT 3 ─┐
        │           │              │
        └───────────┤ users(7,8,9) │
                    │ cards(7,8,9) │
                    │ profiles(3)  │
                    └──────────────┘

🔒 ISOLATION RULES:
├─► All queries MUST filter by account_id
├─► JWT contains account_id for automatic filtering
├─► Foreign key constraints enforce same-account references
└─► Row-level security (future) enforces at DB level
```

---

## Foreign Key Cascade Visualization

```
┌────────────────────────────────────────────────────────────┐
│              CASCADE DELETE BEHAVIOR                       │
└────────────────────────────────────────────────────────────┘

DELETE ACCOUNT (id=1)
│
├─► CASCADE DELETE users (account_id=1)
│   │
│   └─► CASCADE DELETE cards (user_id IN [1,2,3])
│
├─► CASCADE DELETE cards (account_id=1)
│
└─► CASCADE DELETE spending_profiles (account_id=1)
    └─► SET NULL cards.spending_profile_id


DELETE USER (id=5)
│
└─► CASCADE DELETE cards (user_id=5)


DELETE SPENDING_PROFILE (id=2)
│
└─► SET NULL cards.spending_profile_id (WHERE spending_profile_id=2)
    (Cards remain, just lose the profile)
```

---

## Best Practices Summary

```
┌────────────────────────────────────────────────────────────┐
│              DATABASE BEST PRACTICES                       │
└────────────────────────────────────────────────────────────┘

✅ DO
├─► Always filter by account_id for multi-tenancy
├─► Use transactions for multi-table operations
├─► Index foreign keys and frequently queried columns
├─► Use Sequelize validations for data integrity
├─► Implement soft deletes (paranoid mode)
├─► Add timestamps to all tables
├─► Use prepared statements (Sequelize default)
└─► Implement audit logging for sensitive operations

❌ DON'T
├─► Store sensitive data unencrypted
├─► Use SELECT * in production (specify columns)
├─► Forget to paginate large result sets
├─► Skip foreign key constraints
├─► Mix account data in queries
├─► Ignore N+1 query problems (use includes)
└─► Hard delete critical data
```

---

**Last Updated:** 2025-10-06

**Complete Documentation Index:** [README.md](README.md)
