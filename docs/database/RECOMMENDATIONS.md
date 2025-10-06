# 💡 Database Schema Recommendations

Comprehensive recommendations for improving the Lithic POC database schema, including optimizations, missing features, and best practices.

---

## 🎯 Priority Overview

| Priority | Category | Impact | Effort |
|----------|----------|--------|--------|
| 🔴 CRITICAL | Data Integrity | High | Low |
| 🟠 HIGH | Performance | Medium | Medium |
| 🟡 MEDIUM | Features | Medium | Medium |
| 🟢 LOW | Nice to Have | Low | Low |

---

## 🔴 CRITICAL Recommendations

### 1. Add CASCADE Policies to Foreign Keys

**Issue:** No ON DELETE or ON UPDATE policies defined  
**Risk:** Orphaned records, data inconsistency, blocked deletions  
**Impact:** High - Data integrity  
**Effort:** Low

#### Current State
```javascript
account_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'accounts',
    key: 'id'
  }
  // Missing: onDelete, onUpdate
}
```

#### Recommended Fix
```javascript
// In each model file, add cascade policies

// users.js
account_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'accounts', key: 'id' },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
}

// cards.js
account_id: {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
},
user_id: {
  onDelete: 'RESTRICT',  // Don't delete users with active cards
  onUpdate: 'CASCADE'
},
spending_profile_id: {
  onDelete: 'SET NULL',  // Card can exist without profile
  onUpdate: 'CASCADE'
}

// spending_profiles.js
account_id: {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
}
```

#### Benefits
- Prevents orphaned records
- Enables clean account deletion
- Maintains referential integrity
- Prevents data corruption

---

### 2. Add Database-Level Constraints

**Issue:** Business rules only enforced at application level  
**Risk:** Invalid data if inserted directly into database  
**Impact:** High - Data quality  
**Effort:** Low

#### Add CHECK Constraints

```javascript
// accounts.js - Add balance constraint
balance: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
  validate: {
    min: 0  // Application-level only
  }
}
// Add migration for DB-level CHECK
// ALTER TABLE accounts ADD CONSTRAINT balance_positive CHECK (balance >= 0);
```

#### Add ENUM Constraints

```javascript
// users.js
role: {
  type: DataTypes.ENUM('owner', 'admin', 'user', 'analyst'),
  allowNull: false,
  defaultValue: 'user'
}

// cards.js
card_type: {
  type: DataTypes.ENUM('debit', 'reloadable', 'virtual', 'physical'),
  allowNull: false
},
status: {
  type: DataTypes.ENUM('pending', 'active', 'inactive', 'closed'),
  defaultValue: 'pending'
},
spend_limit_duration: {
  type: DataTypes.ENUM('daily', 'monthly', 'yearly', 'lifetime'),
  allowNull: true
}

// spending_profiles.js
spend_limit_duration: {
  type: DataTypes.ENUM('daily', 'monthly', 'yearly', 'lifetime'),
  allowNull: true
}
```

#### Add Cross-Field Validation

```javascript
// In cards.js - Custom validator
{
  tableName: 'cards',
  validate: {
    // Ensure spend_limit and spend_limit_duration are both set or both null
    spendLimitConsistency() {
      if ((this.spend_limit && !this.spend_limit_duration) ||
          (!this.spend_limit && this.spend_limit_duration)) {
        throw new Error('spend_limit and spend_limit_duration must both be set or both be null');
      }
    }
  }
}
```

---

### 3. Add Missing Indexes

**Issue:** Some high-frequency query columns lack indexes  
**Risk:** Slow queries as data grows  
**Impact:** High - Performance  
**Effort:** Low

#### Add Single-Column Indexes

```javascript
// cards.js
{
  tableName: 'cards',
  indexes: [
    {
      name: 'idx_cards_lithic_token',
      fields: ['lithic_card_token']
    },
    {
      name: 'idx_cards_status',
      fields: ['status']
    },
    {
      name: 'idx_cards_last_four',
      fields: ['last_four']  // For quick card lookup
    }
  ]
}

// users.js
{
  indexes: [
    {
      name: 'idx_users_lithic_token',
      fields: ['lithic_account_holder_token']
    },
    {
      name: 'idx_users_role',
      fields: ['role']  // For permission queries
    }
  ]
}
```

#### Add Composite Indexes

```javascript
// cards.js - For common query patterns
{
  indexes: [
    // Find user's active cards
    {
      name: 'idx_cards_user_status',
      fields: ['user_id', 'status']
    },
    // Account's active cards
    {
      name: 'idx_cards_account_status',
      fields: ['account_id', 'status']
    },
    // Cards by profile and status
    {
      name: 'idx_cards_profile_status',
      fields: ['spending_profile_id', 'status']
    }
  ]
}
```

---

## 🟠 HIGH Priority Recommendations

### 4. Implement Proper Migrations

**Issue:** Using `sync({ force: true })` in development  
**Risk:** Data loss, no version control for schema changes  
**Impact:** Medium - Maintainability  
**Effort:** Medium

#### Current Approach
```javascript
// server.js
sequelize.sync({ force: true })  // Drops tables!
```

#### Recommended: Use Sequelize-CLI

```bash
# Install
npm install --save-dev sequelize-cli

# Initialize
npx sequelize-cli init

# Create migration
npx sequelize-cli migration:generate --name initial-schema

# Run migrations
npx sequelize-cli db:migrate
```

#### Example Migration Structure
```javascript
// migrations/20251006-initial-schema.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // ... all fields
    });
    
    await queryInterface.createTable('users', { /* ... */ });
    await queryInterface.createTable('spending_profiles', { /* ... */ });
    await queryInterface.createTable('cards', { /* ... */ });
    
    // Add foreign keys
    await queryInterface.addConstraint('users', {
      fields: ['account_id'],
      type: 'foreign key',
      references: { table: 'accounts', field: 'id' },
      onDelete: 'CASCADE'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cards');
    await queryInterface.dropTable('spending_profiles');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('accounts');
  }
};
```

#### Benefits
- Version-controlled schema changes
- Safe production deployments
- Rollback capability
- Team collaboration

---

### 5. Add Audit Trail Tables

**Issue:** No history of changes to critical data  
**Risk:** Cannot track who changed what and when  
**Impact:** Medium - Compliance, debugging  
**Effort:** Medium

#### Create Audit Log Table

```javascript
// models/AuditLog.js
module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true  // System actions may not have user
    },
    action: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING,  // 'user', 'card', 'account', etc.
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    old_values: {
      type: DataTypes.JSON,  // Previous state
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSON,  // New state
      allowNull: true
    },
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.STRING
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false  // Only need created_at
  });
  
  return AuditLog;
};
```

#### Implement Audit Middleware

```javascript
// middleware/audit.js
async function auditLog(req, entity_type, entity_id, action, old_values, new_values) {
  await AuditLog.create({
    account_id: req.user.account_id,
    user_id: req.user.id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });
}
```

---

### 6. Add Transaction Support for Critical Operations

**Issue:** Multi-step operations not wrapped in transactions  
**Risk:** Partial failures leave database in inconsistent state  
**Impact:** Medium - Data integrity  
**Effort:** Medium

#### Example: Card Creation (Current)

```javascript
// ❌ Not atomic - if Lithic call fails, database is inconsistent
async function createCard(cardData) {
  const card = await Card.create(cardData);
  const lithicCard = await lithicClient.post('/cards', {/*...*/});
  card.lithic_card_token = lithicCard.data.token;
  await card.save();
  return card;
}
```

#### Recommended: Use Transactions

```javascript
// ✅ Atomic - all or nothing
async function createCard(cardData) {
  return await sequelize.transaction(async (t) => {
    // Create card in database
    const card = await Card.create(cardData, { transaction: t });
    
    try {
      // Create in Lithic
      const lithicCard = await lithicClient.post('/cards', {/*...*/});
      
      // Update with Lithic token
      card.lithic_card_token = lithicCard.data.token;
      card.last_four = lithicCard.data.last_four;
      card.status = 'active';
      await card.save({ transaction: t });
      
      return card;
    } catch (error) {
      // Transaction will auto-rollback on error
      throw new Error(`Lithic card creation failed: ${error.message}`);
    }
  });
}
```

#### Critical Operations Needing Transactions
1. Card creation (DB + Lithic)
2. User creation with account (DB + Lithic account holder)
3. Account deletion (cascade delete multiple tables)
4. Bulk operations (multiple cards, users)

---

## 🟡 MEDIUM Priority Recommendations

### 7. Add New Tables for Enhanced Features

#### A. Transaction History Table

```javascript
// models/Transaction.js
module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'cards', key: 'id' }
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false  // Denormalized for fast queries
    },
    lithic_transaction_token: {
      type: DataTypes.STRING,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    merchant_name: DataTypes.STRING,
    merchant_category: DataTypes.STRING,  // MCC
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'declined'),
      allowNull: false
    },
    declined_reason: DataTypes.STRING,
    transaction_date: DataTypes.DATE
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['card_id'] },
      { fields: ['account_id', 'transaction_date'] },
      { fields: ['lithic_transaction_token'] },
      { fields: ['status'] }
    ]
  });
  
  return Transaction;
};
```

**Benefits:**
- Track spending history
- Generate reports
- Detect fraud patterns
- Webhook processing from Lithic

---

#### B. Account Settings Table

```javascript
// models/AccountSettings.js
module.exports = (sequelize) => {
  const AccountSettings = sequelize.define('AccountSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'accounts', key: 'id' },
      onDelete: 'CASCADE'
    },
    // Notification settings
    email_on_card_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_on_transaction: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    transaction_alert_threshold: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 1000.00
    },
    // Security settings
    require_2fa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ip_whitelist: {
      type: DataTypes.JSON,  // Array of allowed IPs
      defaultValue: []
    },
    // Business settings
    default_card_type: {
      type: DataTypes.STRING,
      defaultValue: 'virtual'
    },
    auto_approve_cards: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'account_settings',
    timestamps: true
  });
  
  return AccountSettings;
};
```

---

#### C. API Keys Table (for customer integrations)

```javascript
// models/ApiKey.js
module.exports = (sequelize) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'accounts', key: 'id' }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    prefix: {
      type: DataTypes.STRING,  // First 8 chars for identification
      allowNull: false
    },
    permissions: {
      type: DataTypes.JSON,  // ['cards:read', 'cards:write', etc.]
      defaultValue: []
    },
    last_used_at: DataTypes.DATE,
    expires_at: DataTypes.DATE,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'api_keys',
    timestamps: true
  });
  
  return ApiKey;
};
```

---

### 8. Implement Soft Deletes

**Issue:** Hard deletes lose historical data  
**Risk:** Cannot recover accidentally deleted data  
**Impact:** Medium - Data recovery  
**Effort:** Low

#### Add Sequelize Paranoid Mode

```javascript
// In each model
{
  tableName: 'users',
  timestamps: true,
  paranoid: true,  // Adds deletedAt column
  underscored: true
}
```

#### Benefits
- Recoverable deletions
- Maintain referential integrity
- Historical reporting
- Compliance with data retention policies

#### Query Examples
```javascript
// Exclude soft-deleted by default
const users = await User.findAll();

// Include soft-deleted
const allUsers = await User.findAll({ paranoid: false });

// Only soft-deleted
const deletedUsers = await User.findAll({
  where: { deletedAt: { [Op.ne]: null } },
  paranoid: false
});

// Restore soft-deleted
await user.restore();

// Permanent delete
await user.destroy({ force: true });
```

---

### 9. Add Data Validation Hooks

**Issue:** Limited data validation before database insert  
**Impact:** Medium - Data quality  
**Effort:** Low

#### Add Model Hooks

```javascript
// users.js
{
  hooks: {
    beforeCreate: async (user, options) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error('Invalid email format');
      }
      
      // Normalize email
      user.email = user.email.toLowerCase().trim();
    },
    
    beforeUpdate: async (user, options) => {
      // Prevent changing email if cards exist
      if (user.changed('email')) {
        const cardCount = await Card.count({ where: { user_id: user.id } });
        if (cardCount > 0) {
          throw new Error('Cannot change email for user with active cards');
        }
      }
    }
  }
}

// cards.js
{
  hooks: {
    beforeCreate: async (card, options) => {
      // Validate account/user consistency
      const user = await User.findByPk(card.user_id);
      if (user.account_id !== card.account_id) {
        throw new Error('Card and user must belong to same account');
      }
      
      // Validate profile if provided
      if (card.spending_profile_id) {
        const profile = await SpendingProfile.findByPk(card.spending_profile_id);
        if (profile.account_id !== card.account_id) {
          throw new Error('Spending profile must belong to same account');
        }
      }
    }
  }
}
```

---

## 🟢 LOW Priority Recommendations

### 10. Add Full-Text Search

For searching cards, users, transactions by multiple criteria.

```javascript
// Add GIN index for full-text search (PostgreSQL)
// migration
await queryInterface.sequelize.query(`
  CREATE INDEX idx_users_fulltext ON users 
  USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || email))
`);
```

---

### 11. Add Database Views for Common Queries

```sql
-- View: active_cards_summary
CREATE VIEW active_cards_summary AS
SELECT 
  c.id,
  c.last_four,
  c.card_type,
  c.status,
  u.first_name || ' ' || u.last_name as cardholder_name,
  u.email as cardholder_email,
  sp.name as profile_name,
  a.business_name
FROM cards c
JOIN users u ON c.user_id = u.id
JOIN accounts a ON c.account_id = a.id
LEFT JOIN spending_profiles sp ON c.spending_profile_id = sp.id
WHERE c.status = 'active';
```

---

### 12. Consider Time-Series Optimization

If tracking many transactions, consider:
- Partitioning transactions table by date
- Separate hot/cold storage
- TimescaleDB for time-series data

---

## 📊 Implementation Roadmap

### Phase 1: Critical (Week 1)
- [ ] Add CASCADE policies
- [ ] Add ENUM constraints
- [ ] Add missing indexes
- [ ] Add CHECK constraints

### Phase 2: High Priority (Week 2-3)
- [ ] Implement migrations
- [ ] Add audit logging
- [ ] Add transaction support
- [ ] Add soft deletes

### Phase 3: Medium Priority (Week 4-6)
- [ ] Add transaction history table
- [ ] Add account settings table
- [ ] Add data validation hooks
- [ ] Add API keys table

### Phase 4: Nice to Have (Future)
- [ ] Full-text search
- [ ] Database views
- [ ] Advanced analytics tables

---

## 🎯 Quick Wins (Do First)

1. **Add ENUM types** - 30 minutes, immediate data validation
2. **Add indexes on lithic_*_token fields** - 15 minutes, faster lookups
3. **Add CASCADE policies** - 1 hour, prevents orphaned records
4. **Enable paranoid mode** - 30 minutes, enables soft deletes

---

**Last Updated:** 2025-10-06  
**Reviewed By:** Database Schema Analysis Agent
