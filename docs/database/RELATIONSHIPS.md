# 🔗 Database Relationships

Complete documentation of entity relationships, foreign key constraints, and data modeling patterns.

---

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ACCOUNTS (Root)                          │
│  • Business account                                              │
│  • Multi-tenancy root                                            │
│  • Balance management                                            │
└────────────┬─────────────────┬──────────────────┬───────────────┘
             │                 │                  │
             │ 1:N             │ 1:N              │ 1:N
             ▼                 ▼                  ▼
    ┌────────────────┐  ┌────────────┐  ┌─────────────────────┐
    │     USERS      │  │   CARDS    │  │ SPENDING_PROFILES   │
    │  • User roles  │  │ (partial)  │  │  • Reusable rules   │
    │  • Auth        │  └────────────┘  │  • MCC restrictions │
    └────┬───────────┘                  └──────────┬──────────┘
         │ 1:N                                     │
         │                                         │ 1:N (optional)
         ▼                                         │
    ┌────────────┐                                 │
    │   CARDS    │◄────────────────────────────────┘
    │  (full)    │
    └────────────┘
```

---

## Relationship Details

### 1. Account → Users (One-to-Many)

**Description:** Each account can have multiple users; each user belongs to one account.

**Relationship Type:** `hasMany` / `belongsTo`

**Foreign Key:** `users.account_id` → `accounts.id`

**Sequelize Definition:**
```javascript
// In models/index.js
Account.hasMany(User, { foreignKey: 'account_id' });
User.belongsTo(Account, { foreignKey: 'account_id' });
```

**On Delete:** CASCADE (deleting account deletes all users)

**Business Rules:**
- User must belong to an account
- Cannot transfer users between accounts
- Account owners are also users in the users table

**Example Queries:**
```javascript
// Get all users for an account
const users = await User.findAll({ where: { account_id: 1 } });

// Get user with account details
const user = await User.findByPk(1, { include: [Account] });
```

---

### 2. Account → Cards (One-to-Many)

**Description:** Each account can have multiple cards; each card belongs to one account.

**Relationship Type:** `hasMany` / `belongsTo`

**Foreign Key:** `cards.account_id` → `accounts.id`

**Sequelize Definition:**
```javascript
Account.hasMany(Card, { foreignKey: 'account_id' });
Card.belongsTo(Account, { foreignKey: 'account_id' });
```

**On Delete:** CASCADE (deleting account deletes all cards)

**Business Rules:**
- Cards are scoped to account for billing/reporting
- Account balance may fund cards (depending on card type)
- Account-level card limits may apply

**Example Queries:**
```javascript
// Get all cards for an account
const cards = await Card.findAll({ where: { account_id: 1 } });

// Get account with all cards
const account = await Account.findByPk(1, { include: [Card] });
```

---

### 3. User → Cards (One-to-Many)

**Description:** Each user can have multiple cards; each card is assigned to one user.

**Relationship Type:** `hasMany` / `belongsTo`

**Foreign Key:** `cards.user_id` → `users.id`

**Sequelize Definition:**
```javascript
User.hasMany(Card, { foreignKey: 'user_id' });
Card.belongsTo(User, { foreignKey: 'user_id' });
```

**On Delete:** CASCADE (deleting user deletes all their cards)

**Business Rules:**
- Card holder is the user
- User can have multiple cards (debit + reloadable)
- User must be active to receive cards

**Example Queries:**
```javascript
// Get all cards for a user
const cards = await Card.findAll({ where: { user_id: 1 } });

// Get card with user details
const card = await Card.findByPk(1, { include: [User] });

// Get user with all their cards
const user = await User.findByPk(1, { include: [Card] });
```

---

### 4. SpendingProfile → Cards (One-to-Many, Optional)

**Description:** Each spending profile can be applied to multiple cards; each card can optionally have one profile.

**Relationship Type:** `hasMany` / `belongsTo` (optional)

**Foreign Key:** `cards.spending_profile_id` → `spending_profiles.id`

**Sequelize Definition:**
```javascript
SpendingProfile.hasMany(Card, { foreignKey: 'spending_profile_id' });
Card.belongsTo(SpendingProfile, { foreignKey: 'spending_profile_id' });
```

**On Delete:** SET NULL (deleting profile removes it from cards, but cards remain)

**Nullable:** YES - Cards can exist without a spending profile

**Business Rules:**
- Profile is optional (null = no restrictions)
- One profile can control many cards
- Profile must belong to same account as card
- Card-level limits override profile limits

**Example Queries:**
```javascript
// Get all cards using a profile
const cards = await Card.findAll({ where: { spending_profile_id: 1 } });

// Get card with spending profile details
const card = await Card.findByPk(1, { include: [SpendingProfile] });

// Get profile with all cards using it
const profile = await SpendingProfile.findByPk(1, { include: [Card] });
```

---

### 5. Account → SpendingProfiles (One-to-Many)

**Description:** Each account can have multiple spending profiles; each profile belongs to one account.

**Relationship Type:** `hasMany` / `belongsTo` (implicit, not explicitly defined)

**Foreign Key:** `spending_profiles.account_id` → `accounts.id`

**On Delete:** CASCADE (deleting account deletes all profiles)

**Business Rules:**
- Profiles are reusable within an account
- Cannot share profiles across accounts
- Account admins can create profiles

---

## Multi-Level Relationships

### Account → User → Card (Chain)

**Path:** `accounts.id` → `users.account_id` → `cards.user_id`

**Use Case:** Get all cards for an account through users

**Example Query:**
```javascript
// Get account with users and their cards
const account = await Account.findByPk(1, {
  include: [{
    model: User,
    include: [Card]
  }]
});
```

---

### Card Complete Relationship (Multiple Parents)

**Description:** A card has THREE parent relationships:
1. Account (for billing/tenancy)
2. User (for ownership/assignment)
3. SpendingProfile (for restrictions - optional)

**Integrity Constraint:** `card.user_id` must belong to same `card.account_id`

**Example Query:**
```javascript
// Get card with all relationships
const card = await Card.findByPk(1, {
  include: [
    { model: Account },
    { model: User },
    { model: SpendingProfile }
  ]
});

// Result structure:
{
  id: 1,
  account_id: 1,
  user_id: 5,
  spending_profile_id: 2,
  card_type: 'debit',
  Account: { business_name: 'MSD Cafe' },
  User: { first_name: 'Gabriel', last_name: 'Santos' },
  SpendingProfile: { name: 'Travel Only' }
}
```

---

## Data Integrity Patterns

### Pattern 1: Account Scoping

**Rule:** All entities (except accounts) are scoped to an account

**Enforcement:**
```javascript
// When creating a user
const user = await User.create({
  account_id: req.user.account_id,  // Always from authenticated context
  email: 'new@example.com',
  // ...
});

// When querying
const users = await User.findAll({
  where: { account_id: req.user.account_id }  // Always filter by account
});
```

**Prevents:**
- Cross-account data leakage
- Unauthorized access to other accounts' data

---

### Pattern 2: User-Card Validation

**Rule:** A card's user must belong to the card's account

**Enforcement:**
```javascript
// Before creating card
const user = await User.findOne({
  where: {
    id: user_id,
    account_id: account_id
  }
});

if (!user) {
  throw new Error('User must belong to the account');
}
```

**Prevents:**
- Assigning cards to users from different accounts

---

### Pattern 3: Profile-Card Validation

**Rule:** A card's spending profile must belong to the card's account

**Enforcement:**
```javascript
// Before attaching profile to card
if (spending_profile_id) {
  const profile = await SpendingProfile.findOne({
    where: {
      id: spending_profile_id,
      account_id: account_id
    }
  });
  
  if (!profile) {
    throw new Error('Profile must belong to the account');
  }
}
```

**Prevents:**
- Using profiles from other accounts

---

## Cascade Behavior

### Delete Account → All Related Data Deleted

```
DELETE accounts WHERE id = 1
  ├─► DELETE users WHERE account_id = 1
  │     └─► DELETE cards WHERE user_id IN (...)
  ├─► DELETE cards WHERE account_id = 1
  └─► DELETE spending_profiles WHERE account_id = 1
```

**Result:** Complete data removal (GDPR-compliant)

---

### Delete User → User's Cards Deleted

```
DELETE users WHERE id = 5
  └─► DELETE cards WHERE user_id = 5
```

**Result:** User and their cards removed

---

### Delete Spending Profile → Cards Remain

```
DELETE spending_profiles WHERE id = 2
  └─► UPDATE cards SET spending_profile_id = NULL WHERE spending_profile_id = 2
```

**Result:** Cards lose restriction profile but remain active

---

## Common Query Patterns

### 1. Get Account Dashboard

```javascript
const account = await Account.findByPk(accountId, {
  include: [
    {
      model: User,
      include: [Card]
    },
    SpendingProfile
  ]
});

// Returns complete hierarchy
{
  id: 1,
  business_name: 'MSD Cafe',
  Users: [
    {
      id: 1,
      email: 'eric@msdcafe.com',
      role: 'owner',
      Cards: [...]
    }
  ],
  SpendingProfiles: [...]
}
```

---

### 2. Get User's Complete Profile

```javascript
const user = await User.findByPk(userId, {
  include: [
    Account,
    {
      model: Card,
      include: [SpendingProfile]
    }
  ]
});
```

---

### 3. Get Cards with All Details

```javascript
const cards = await Card.findAll({
  where: { account_id: accountId },
  include: [User, Account, SpendingProfile],
  order: [['created_at', 'DESC']]
});
```

---

### 4. Check Profile Usage

```javascript
const profile = await SpendingProfile.findByPk(profileId, {
  include: [{
    model: Card,
    include: [User]  // Get users using this profile
  }]
});

const cardsCount = profile.Cards.length;
```

---

## Relationship Cardinality Summary

| From | To | Cardinality | Foreign Key | Optional | Delete Behavior |
|------|-----|-------------|-------------|----------|-----------------|
| Account | User | 1:N | `users.account_id` | No | CASCADE |
| Account | Card | 1:N | `cards.account_id` | No | CASCADE |
| Account | SpendingProfile | 1:N | `spending_profiles.account_id` | No | CASCADE |
| User | Card | 1:N | `cards.user_id` | No | CASCADE |
| SpendingProfile | Card | 1:N | `cards.spending_profile_id` | Yes | SET NULL |

---

## Future Relationship Considerations

### Potential Additions

1. **Transactions Table**
   - `transactions.card_id` → `cards.id`
   - Track spending history
   - Enable reporting and analytics

2. **Transaction → Merchant (Many-to-One)**
   - `transactions.merchant_id` → `merchants.id`
   - Merchant-level analytics

3. **User → Role (Many-to-Many)**
   - More complex role assignments
   - Multiple roles per user

4. **Card → CardProduct (Many-to-One)**
   - `cards.card_product_id` → `card_products.id`
   - Template-based card creation

5. **Account → Billing (One-to-Many)**
   - `billing_events.account_id` → `accounts.id`
   - Invoice tracking

---

**Last Updated:** 2025-10-06

**Next:** See [INDEXES.md](INDEXES.md) for query optimization
