# 🔗 Database Relationships Documentation

Comprehensive documentation of all foreign key relationships, data integrity rules, and referential constraints.

---

## Overview

The Lithic POC database uses a hierarchical multi-tenant design with **accounts** as the root entity. All relationships enforce referential integrity through foreign key constraints.

### Relationship Summary

| From Table | To Table | Relationship Type | Foreign Key | Optional? |
|------------|----------|-------------------|-------------|-----------|
| users | accounts | Many-to-One | `account_id` | No |
| cards | accounts | Many-to-One | `account_id` | No |
| cards | users | Many-to-One | `user_id` | No |
| cards | spending_profiles | Many-to-One | `spending_profile_id` | Yes |
| spending_profiles | accounts | Many-to-One | `account_id` | No |

**Total Relationships:** 5 foreign keys

---

## Relationship Details

### 1. users → accounts

**Type:** Many-to-One (Each user belongs to one account)  
**Foreign Key:** `users.account_id` → `accounts.id`

#### Configuration
```javascript
// In Sequelize models/index.js
Account.hasMany(User, { foreignKey: 'account_id' });
User.belongsTo(Account, { foreignKey: 'account_id' });
```

#### Constraints
- **NOT NULL:** Yes - Every user must have an account
- **ON DELETE:** Not specified (should add CASCADE)
- **ON UPDATE:** Not specified (should add CASCADE)

#### Business Rules
1. Users cannot exist without a parent account
2. User's account determines their access scope
3. All user queries should be scoped by account_id for multi-tenancy

#### Example Query
```javascript
// Get all users for an account
const users = await User.findAll({
  where: { account_id: 1 }
});

// Get user with account details
const user = await User.findByPk(1, {
  include: [Account]
});
```

#### Data Integrity Issues
- **Missing CASCADE:** If account is deleted, users become orphaned
- **Recommendation:** Add `ON DELETE CASCADE` or `ON DELETE RESTRICT`

---

### 2. cards → accounts

**Type:** Many-to-One (Each card belongs to one account)  
**Foreign Key:** `cards.account_id` → `accounts.id`

#### Configuration
```javascript
Account.hasMany(Card, { foreignKey: 'account_id' });
Card.belongsTo(Account, { foreignKey: 'account_id' });
```

#### Constraints
- **NOT NULL:** Yes - Every card must have an account
- **ON DELETE:** Not specified
- **ON UPDATE:** Not specified

#### Business Rules
1. Card's account_id must match the cardholder's account_id
2. Cross-validation: `cards.account_id === users.account_id` (where `cards.user_id = users.id`)
3. Ensures proper multi-tenant isolation

#### Example Query
```javascript
// Get all cards for an account
const cards = await Card.findAll({
  where: { account_id: 1 }
});

// Validate card-user account consistency
const card = await Card.findByPk(1, {
  include: [
    { model: Account },
    { model: User }
  ]
});
// card.account_id should equal card.User.account_id
```

#### Validation Requirement
```javascript
// Before creating a card, validate account consistency
async function createCard(cardData) {
  const user = await User.findByPk(cardData.user_id);
  if (user.account_id !== cardData.account_id) {
    throw new Error('User and card must belong to same account');
  }
  return await Card.create(cardData);
}
```

---

### 3. cards → users

**Type:** Many-to-One (Each card belongs to one user/cardholder)  
**Foreign Key:** `cards.user_id` → `users.id`

#### Configuration
```javascript
User.hasMany(Card, { foreignKey: 'user_id' });
Card.belongsTo(User, { foreignKey: 'user_id' });
```

#### Constraints
- **NOT NULL:** Yes - Every card must have a cardholder
- **ON DELETE:** Not specified (should add RESTRICT or SET NULL)
- **ON UPDATE:** Not specified

#### Business Rules
1. One user can have multiple cards (1:N relationship)
2. Card's user must belong to same account as card
3. Deleting a user should not automatically delete their cards (historical data)

#### Example Query
```javascript
// Get all cards for a user
const userCards = await Card.findAll({
  where: { user_id: 3 },
  include: [User, SpendingProfile]
});

// Get user with all their cards
const user = await User.findByPk(3, {
  include: [Card]
});
```

#### Cascade Consideration
- **Current:** No ON DELETE policy
- **Recommended:** `ON DELETE RESTRICT` - prevent deleting users with active cards
- **Alternative:** Use status='inactive' for soft deletes instead

---

### 4. cards → spending_profiles

**Type:** Many-to-One (Each card optionally has one spending profile)  
**Foreign Key:** `cards.spending_profile_id` → `spending_profiles.id`

#### Configuration
```javascript
SpendingProfile.hasMany(Card, { foreignKey: 'spending_profile_id' });
Card.belongsTo(SpendingProfile, { foreignKey: 'spending_profile_id' });
```

#### Constraints
- **NOT NULL:** No - Spending profile is optional
- **NULLABLE:** Yes - Cards can exist without a profile
- **ON DELETE:** Not specified (should add SET NULL)
- **ON UPDATE:** Not specified

#### Business Rules
1. **Optional Relationship:** Cards can operate without a spending profile
2. **Shared Profiles:** Multiple cards can use the same profile
3. **Account Scoped:** Profile must belong to same account as card
4. **Fallback:** If no profile, use card-level spending limits

#### Example Query
```javascript
// Get all cards using a specific profile
const profileCards = await Card.findAll({
  where: { spending_profile_id: 1 }
});

// Get card with optional profile
const card = await Card.findByPk(1, {
  include: [
    { model: SpendingProfile, required: false }
  ]
});
```

#### Profile Update Impact
When updating a spending profile:
- Changes affect ALL cards using that profile
- Must sync with Lithic Auth Rules
- Consider notification to cardholders

#### Recommended Validation
```javascript
async function assignProfile(cardId, profileId) {
  const card = await Card.findByPk(cardId);
  const profile = await SpendingProfile.findByPk(profileId);
  
  if (card.account_id !== profile.account_id) {
    throw new Error('Card and profile must belong to same account');
  }
  
  card.spending_profile_id = profileId;
  await card.save();
}
```

---

### 5. spending_profiles → accounts

**Type:** Many-to-One (Each profile belongs to one account)  
**Foreign Key:** `spending_profiles.account_id` → `accounts.id`

#### Configuration
```javascript
Account.hasMany(SpendingProfile, { foreignKey: 'account_id' });
SpendingProfile.belongsTo(Account, { foreignKey: 'account_id' });
```

#### Constraints
- **NOT NULL:** Yes - Every profile must belong to an account
- **ON DELETE:** Not specified (should add CASCADE)
- **ON UPDATE:** Not specified

#### Business Rules
1. Profiles are scoped to their account
2. Cannot share profiles across accounts (multi-tenant isolation)
3. Account deletion should cascade to profiles

#### Example Query
```javascript
// Get all profiles for an account
const profiles = await SpendingProfile.findAll({
  where: { account_id: 1 }
});

// Get profile with account and all cards using it
const profile = await SpendingProfile.findByPk(1, {
  include: [
    Account,
    { model: Card, include: [User] }
  ]
});
```

---

## Referential Integrity Policies

### Current State
⚠️ **No explicit ON DELETE or ON UPDATE policies defined**

Sequelize defaults:
- ON DELETE: NO ACTION (prevents deletion if references exist)
- ON UPDATE: NO ACTION

### Recommended Policies

| Relationship | ON DELETE | ON UPDATE | Rationale |
|--------------|-----------|-----------|-----------|
| users → accounts | CASCADE or RESTRICT | CASCADE | If account deleted, remove users OR prevent deletion |
| cards → accounts | CASCADE or RESTRICT | CASCADE | Same as above |
| cards → users | RESTRICT | CASCADE | Don't delete users with active cards |
| cards → spending_profiles | SET NULL | CASCADE | Card can exist without profile |
| spending_profiles → accounts | CASCADE | CASCADE | Profiles are account-scoped |

### Implementation Example

```javascript
// In User model
account_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'accounts',
    key: 'id'
  },
  onDelete: 'CASCADE',  // Add this
  onUpdate: 'CASCADE'   // Add this
}
```

---

## Data Integrity Checks

### Cross-Table Validation

#### 1. Account Consistency (Cards)
```sql
-- Verify all cards belong to users in the same account
SELECT c.id as card_id, c.account_id as card_account, u.account_id as user_account
FROM cards c
JOIN users u ON c.user_id = u.id
WHERE c.account_id != u.account_id;
-- Should return 0 rows
```

#### 2. Profile Account Matching
```sql
-- Verify all cards use profiles from the same account
SELECT c.id, c.account_id as card_account, sp.account_id as profile_account
FROM cards c
JOIN spending_profiles sp ON c.spending_profile_id = sp.id
WHERE c.account_id != sp.account_id;
-- Should return 0 rows
```

#### 3. Orphaned Records
```sql
-- Find cards with deleted users (shouldn't exist with proper FK)
SELECT * FROM cards WHERE user_id NOT IN (SELECT id FROM users);

-- Find cards with deleted profiles
SELECT * FROM cards 
WHERE spending_profile_id IS NOT NULL 
  AND spending_profile_id NOT IN (SELECT id FROM spending_profiles);
```

### Application-Level Checks

```javascript
// Validation middleware for card creation
async function validateCardCreation(req, res, next) {
  const { account_id, user_id, spending_profile_id } = req.body;
  
  // Check user belongs to account
  const user = await User.findOne({ 
    where: { id: user_id, account_id } 
  });
  if (!user) {
    return res.status(400).json({ 
      error: 'User does not belong to this account' 
    });
  }
  
  // Check profile belongs to account (if provided)
  if (spending_profile_id) {
    const profile = await SpendingProfile.findOne({
      where: { id: spending_profile_id, account_id }
    });
    if (!profile) {
      return res.status(400).json({
        error: 'Spending profile does not belong to this account'
      });
    }
  }
  
  next();
}
```

---

## Cascade Effects

### Deleting an Account
**Current Behavior:** Blocked if users/cards/profiles exist

**Recommended Behavior:**
```
Delete Account (id=1)
  ↓
1. Delete or reassign all users (CASCADE)
  ↓
2. Delete or archive all cards (CASCADE)
  ↓
3. Delete all spending profiles (CASCADE)
  ↓
4. Delete account record
```

### Deleting a User
**Current Behavior:** Blocked if cards exist

**Recommended Behavior:**
```
Delete User (id=3)
  ↓
1. Check for active cards (RESTRICT)
  ↓
2. If active cards exist → Error
3. If no active cards → Proceed
  ↓
4. Consider: Set cards.user_id = NULL or set status='orphaned'
```

### Deleting a Spending Profile
**Current Behavior:** Blocked if cards reference it

**Recommended Behavior:**
```
Delete Profile (id=1)
  ↓
1. Find all cards using this profile
  ↓
2. SET NULL on cards.spending_profile_id (SET NULL)
  ↓
3. Cards revert to card-level limits
  ↓
4. Delete profile
```

---

## Query Performance Considerations

### Index Coverage

All foreign keys are automatically indexed by Sequelize:
- ✅ `users.account_id`
- ✅ `cards.account_id`
- ✅ `cards.user_id`
- ✅ `cards.spending_profile_id`
- ✅ `spending_profiles.account_id`

### Composite Indexes (Recommended)

```javascript
// For common query patterns
// 1. Finding user's cards within account
indexes: [
  {
    fields: ['account_id', 'user_id']
  }
]

// 2. Active cards per account
indexes: [
  {
    fields: ['account_id', 'status']
  }
]
```

### N+1 Query Prevention

```javascript
// ❌ Bad: N+1 queries
const cards = await Card.findAll();
for (let card of cards) {
  const user = await User.findByPk(card.user_id); // N queries!
}

// ✅ Good: Single query with join
const cards = await Card.findAll({
  include: [User, SpendingProfile]
});
```

---

## Migration Strategy

If implementing recommended changes:

```javascript
// migration: add-cascade-policies.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing foreign keys
    await queryInterface.removeConstraint('users', 'users_account_id_fkey');
    
    // Add new foreign key with CASCADE
    await queryInterface.addConstraint('users', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'users_account_id_fkey',
      references: {
        table: 'accounts',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    
    // Repeat for other foreign keys...
  },
  
  down: async (queryInterface, Sequelize) => {
    // Revert changes
  }
};
```

---

**Last Updated:** 2025-10-06  
**Schema Version:** 1.0
