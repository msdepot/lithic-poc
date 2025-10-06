# 💡 Database Schema Recommendations

Comprehensive recommendations for improving the database schema, including new features, optimizations, and best practices.

---

## 🔴 Critical Improvements

### 1. Add Database Indexes

**Current Issue:** Missing indexes causing slow queries

**Impact:** High - Performance degrades with scale

**Recommendation:**

```javascript
// In Card model
lithic_card_token: {
  type: DataTypes.STRING,
  allowNull: true,
  index: true  // ← ADD THIS
}

// In SpendingProfile model
lithic_auth_rule_token: {
  type: DataTypes.STRING,
  allowNull: true,
  index: true  // ← ADD THIS
}
```

**Benefits:**
- 100x faster Lithic API lookups
- Reduced database load
- Better user experience

**See:** [INDEXES.md](INDEXES.md) for complete index strategy

---

### 2. Add Audit/History Tables

**Current Issue:** No audit trail for changes

**Impact:** Medium - Cannot track who changed what

**Recommendation:** Create audit tables for compliance

```javascript
// New model: AuditLog.js
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
    type: DataTypes.STRING,  // 'CREATE', 'UPDATE', 'DELETE'
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING,  // 'user', 'card', 'spending_profile'
    allowNull: false
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  old_values: {
    type: DataTypes.JSON,
    allowNull: true
  },
  new_values: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  underscored: true,
  updatedAt: false  // Only need created_at for logs
});
```

**Benefits:**
- Compliance (SOC2, PCI-DSS)
- Security forensics
- Debugging capabilities
- User accountability

**Example Usage:**
```javascript
// After updating a card
await AuditLog.create({
  account_id: card.account_id,
  user_id: req.user.id,
  action: 'UPDATE',
  entity_type: 'card',
  entity_id: card.id,
  old_values: { status: 'pending' },
  new_values: { status: 'active' },
  ip_address: req.ip
});
```

---

### 3. Implement Soft Deletes

**Current Issue:** Hard deletes lose data permanently

**Impact:** Medium - Cannot recover deleted records

**Recommendation:** Use Sequelize paranoid mode

```javascript
// In all models
const User = sequelize.define('User', {
  // ... fields
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,  // ← ADD THIS
  underscored: true
});
```

**Schema Changes:**
```javascript
// Adds deleted_at column to all tables
deleted_at: {
  type: DataTypes.DATE,
  allowNull: true
}
```

**Benefits:**
- Data recovery capability
- Compliance with data retention policies
- Safer operations (undo deletes)

**Query Changes:**
```javascript
// Normal query (excludes deleted)
const users = await User.findAll();

// Include deleted records
const users = await User.findAll({ paranoid: false });

// Only deleted records
const users = await User.findAll({ 
  where: { deleted_at: { [Op.ne]: null } },
  paranoid: false
});

// Permanent delete
await user.destroy({ force: true });
```

---

## 🟡 High Priority Improvements

### 4. Add Transaction Table

**Current Issue:** No transaction history

**Impact:** High - Cannot track spending, detect fraud

**Recommendation:** Create transactions table

```javascript
const Transaction = sequelize.define('Transaction', {
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
  card_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'cards', key: 'id' }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  lithic_transaction_token: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    index: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  merchant_category_code: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  transaction_type: {
    type: DataTypes.STRING,  // 'AUTHORIZATION', 'CLEARING', 'REFUND'
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,  // 'PENDING', 'APPROVED', 'DECLINED'
    allowNull: false
  },
  declined_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    index: true
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['card_id', 'transaction_date'] },
    { fields: ['account_id', 'transaction_date'] },
    { fields: ['merchant_category_code'] }
  ]
});
```

**Relationships:**
```javascript
Account.hasMany(Transaction, { foreignKey: 'account_id' });
Card.hasMany(Transaction, { foreignKey: 'card_id' });
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(Account, { foreignKey: 'account_id' });
Transaction.belongsTo(Card, { foreignKey: 'card_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });
```

**Benefits:**
- Spending analytics
- Fraud detection
- Reporting capabilities
- Reconciliation with Lithic

---

### 5. Add Address Table

**Current Issue:** No address storage for KYC/compliance

**Impact:** Medium - Required for production use

**Recommendation:** Create addresses table

```javascript
const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  addressable_type: {
    type: DataTypes.STRING,  // 'account', 'user'
    allowNull: false
  },
  addressable_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  address_type: {
    type: DataTypes.STRING,  // 'billing', 'shipping', 'business'
    allowNull: false
  },
  street_line1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  street_line2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(2),
    defaultValue: 'US'
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'addresses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['addressable_type', 'addressable_id'] }
  ]
});
```

**Polymorphic Pattern:**
```javascript
// Get account address
const addresses = await Address.findAll({
  where: {
    addressable_type: 'account',
    addressable_id: accountId
  }
});
```

---

### 6. Improve Password Security

**Current Issue:** No password for users (POC only)

**Impact:** Critical for production

**Recommendation:** Add proper authentication

```javascript
// In User model
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  // ... existing fields
  
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true  // For migration compatibility
  },
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 10);
        user.password = undefined;
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};
```

---

## 🟢 Medium Priority Improvements

### 7. Add Card Product Templates

**Current Issue:** Card settings defined per card

**Impact:** Low - Makes bulk operations harder

**Recommendation:** Create card_products table

```javascript
const CardProduct = sequelize.define('CardProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false  // 'Corporate Card', 'Travel Card'
  },
  card_type: {
    type: DataTypes.STRING,
    allowNull: false  // 'debit', 'reloadable'
  },
  default_spend_limit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  default_spend_limit_duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  default_spending_profile_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  card_design: {
    type: DataTypes.STRING,  // Reference to card design asset
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'card_products',
  timestamps: true,
  underscored: true
});

// Add to Card model
card_product_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'card_products', key: 'id' }
}
```

**Benefits:**
- Template-based card creation
- Consistent card settings
- Easier bulk updates

---

### 8. Add Webhooks/Notifications Table

**Current Issue:** No webhook management

**Impact:** Medium - Cannot handle Lithic webhooks properly

**Recommendation:** Create webhooks table

```javascript
const Webhook = sequelize.define('Webhook', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: true  // System webhooks may not have account
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false  // 'transaction.created', 'card.updated'
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'  // 'pending', 'processed', 'failed'
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'webhooks',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['status', 'created_at'] },
    { fields: ['event_type'] }
  ]
});
```

---

### 9. Add Settings Table

**Current Issue:** No flexible configuration storage

**Impact:** Low - Hard to add feature flags

**Recommendation:** Create account_settings table

```javascript
const AccountSetting = sequelize.define('AccountSetting', {
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
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.JSON,
    allowNull: true
  },
  value_type: {
    type: DataTypes.STRING,  // 'string', 'number', 'boolean', 'json'
    allowNull: false
  }
}, {
  tableName: 'account_settings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['account_id', 'key'], unique: true }
  ]
});
```

**Example Usage:**
```javascript
// Enable feature
await AccountSetting.upsert({
  account_id: 1,
  key: 'enable_virtual_cards',
  value: true,
  value_type: 'boolean'
});

// Get setting
const setting = await AccountSetting.findOne({
  where: { account_id: 1, key: 'max_cards_per_user' }
});
const maxCards = setting?.value || 5;  // Default to 5
```

---

### 10. Add Spending Categories Table

**Current Issue:** MCC codes stored as JSON

**Impact:** Low - Hard to query/analyze

**Recommendation:** Create spending_categories table

```javascript
const SpendingCategory = sequelize.define('SpendingCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mcc_code: {
    type: DataTypes.STRING(4),
    allowNull: false,
    unique: true
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false  // 'Restaurants', 'Travel', 'Gas Stations'
  },
  category_group: {
    type: DataTypes.STRING,
    allowNull: true  // 'Food & Dining', 'Transportation'
  },
  is_high_risk: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // Gambling, adult content
  }
}, {
  tableName: 'spending_categories',
  timestamps: true,
  underscored: true
});
```

**Many-to-Many with Spending Profiles:**
```javascript
const ProfileCategory = sequelize.define('ProfileCategory', {
  spending_profile_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  spending_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rule_type: {
    type: DataTypes.STRING,  // 'allowed', 'blocked'
    allowNull: false
  }
}, {
  tableName: 'profile_categories',
  timestamps: true,
  underscored: true
});

SpendingProfile.belongsToMany(SpendingCategory, { through: ProfileCategory });
SpendingCategory.belongsToMany(SpendingProfile, { through: ProfileCategory });
```

---

## 🔵 Data Integrity Improvements

### 11. Add Database Constraints

**Current Issue:** Limited validation at DB level

**Impact:** Medium - Data integrity issues

**Recommendation:** Add CHECK constraints

```javascript
// In User model
email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true  // ← ADD THIS
  }
},

role: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'user',
  validate: {
    isIn: [['owner', 'admin', 'user', 'analyst']]  // ← ADD THIS
  }
}

// In Card model
spend_limit: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  validate: {
    min: 0  // ← ADD THIS
  }
}

// In Account model
balance: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
  validate: {
    min: 0  // ← ADD THIS (or allow negative for credit)
  }
}
```

---

### 12. Add Unique Composite Constraints

**Current Issue:** Can create duplicate records

**Impact:** Medium - Data duplication

**Recommendation:** Add composite unique constraints

```javascript
// In SpendingProfile model
{
  indexes: [
    {
      unique: true,
      fields: ['account_id', 'name']  // Unique profile names per account
    }
  ]
}

// In Card model (if card numbers stored)
{
  indexes: [
    {
      unique: true,
      fields: ['lithic_card_token']  // Prevent duplicate Lithic tokens
    }
  ]
}
```

---

## 📊 Performance Improvements

### 13. Implement Database Read Replicas

**Current Issue:** Single database for reads/writes

**Impact:** High at scale

**Recommendation:** Configure Sequelize with read replicas

```javascript
const sequelize = new Sequelize({
  dialect: 'postgres',
  replication: {
    read: [
      { host: 'read-replica-1.example.com', username: 'read_user', password: 'pw' },
      { host: 'read-replica-2.example.com', username: 'read_user', password: 'pw' }
    ],
    write: {
      host: 'primary.example.com',
      username: 'write_user',
      password: 'pw'
    }
  },
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
});
```

---

### 14. Add Database Connection Pooling

**Current Issue:** No explicit pool configuration

**Impact:** Medium - Connection exhaustion at scale

**Recommendation:** Configure connection pools

```javascript
const sequelize = new Sequelize({
  // ... other config
  pool: {
    max: 10,          // Maximum connections
    min: 2,           // Minimum connections
    acquire: 30000,   // Max time to get connection (ms)
    idle: 10000       // Max idle time before release (ms)
  },
  dialectOptions: {
    connectTimeout: 60000
  }
});
```

---

## 🔐 Security Improvements

### 15. Add PII Encryption

**Current Issue:** Sensitive data stored in plain text

**Impact:** High - Compliance risk

**Recommendation:** Encrypt PII fields

```javascript
const crypto = require('crypto');

// Encryption helper
const encrypt = (text) => {
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
  // ... encryption logic
};

// In User model
{
  hooks: {
    beforeCreate: (user) => {
      if (user.ssn) {
        user.ssn_encrypted = encrypt(user.ssn);
        user.ssn = undefined;
      }
    }
  }
}
```

---

### 16. Implement Row-Level Security (PostgreSQL)

**Current Issue:** Application-level access control only

**Impact:** Medium - Security defense-in-depth

**Recommendation:** Use PostgreSQL RLS

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own account's data
CREATE POLICY account_isolation ON users
  USING (account_id = current_setting('app.current_account_id')::int);

-- Set account context in application
await sequelize.query("SET app.current_account_id = :accountId", {
  replacements: { accountId: req.user.account_id }
});
```

---

## 📈 Scalability Recommendations

### 17. Partition Large Tables

**For Future:** When tables exceed 10M rows

```sql
-- Partition transactions by date
CREATE TABLE transactions_2025_q1 PARTITION OF transactions
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

CREATE TABLE transactions_2025_q2 PARTITION OF transactions
  FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
```

---

### 18. Implement Caching Layer

**Current Issue:** Every query hits database

**Impact:** High at scale

**Recommendation:** Add Redis caching

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
async function getAccount(accountId) {
  const cacheKey = `account:${accountId}`;
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const account = await Account.findByPk(accountId);
  
  // Store in cache (5 minutes)
  await client.setEx(cacheKey, 300, JSON.stringify(account));
  
  return account;
}
```

---

## 📋 Implementation Priority

| Priority | Improvement | Effort | Impact | Timeline |
|----------|------------|--------|--------|----------|
| 🔴 P0 | Add database indexes | Low | High | Week 1 |
| 🔴 P0 | Implement soft deletes | Low | Medium | Week 1 |
| 🔴 P0 | Add password security | Medium | Critical | Week 2 |
| 🟡 P1 | Add audit logging | Medium | High | Week 3 |
| 🟡 P1 | Add transactions table | High | High | Week 4 |
| 🟡 P1 | Add address table | Medium | Medium | Week 4 |
| 🟢 P2 | Add card products | Medium | Low | Month 2 |
| 🟢 P2 | Add webhooks table | Medium | Medium | Month 2 |
| 🟢 P2 | Add settings table | Low | Low | Month 2 |
| 🔵 P3 | Add constraints | Low | Medium | Month 3 |
| 🔵 P3 | Connection pooling | Low | Medium | Month 3 |
| 🔵 P3 | Caching layer | High | High | Month 3 |

---

**Last Updated:** 2025-10-06

**Next:** See [ER_DIAGRAM.md](ER_DIAGRAM.md) for visual schema representation
