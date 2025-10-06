# 🔗 Lithic Integration Documentation

This document explains how the Lithic POC integrates with Lithic's card issuing API.

## Overview

This POC uses **Lithic's real sandbox API** to demonstrate card issuing capabilities. All cards, account holders, and auth rules are created through actual API calls, not mocked.

**Sandbox Environment:**
- Base URL: `https://sandbox.lithic.com/v1`
- API Key: Stored in `.env` file
- Documentation: https://docs.lithic.com/

---

## API Client Setup

### Configuration

Located in `backend/config/lithic.js`:

```javascript
const axios = require('axios');

const lithicClient = axios.create({
  baseURL: process.env.LITHIC_BASE_URL || 'https://sandbox.lithic.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.LITHIC_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

module.exports = lithicClient;
```

### Environment Variables

In `.env` file:
```env
LITHIC_API_KEY=your_sandbox_api_key_here
LITHIC_BASE_URL=https://sandbox.lithic.com/v1
```

**Security Note:** Never commit API keys to version control. Use environment variables.

---

## Integration Points

### 1. Account Holder Creation

**When:** A user is created (owner, admin, user, or analyst)

**Lithic Endpoint:** `POST /account_holders`

**Purpose:** Each user needs a Lithic account holder to receive cards

**Implementation:** `backend/routes/users.js` and `backend/routes/accounts.js`

**Request:**
```javascript
const response = await lithicClient.post('/account_holders', {
  individual: {
    first_name: 'Eric',
    last_name: 'Medina',
    phone_number: '+15555551234',
    email: 'eric@msdcafe.com'
  },
  kyc_exempt: true,  // Sandbox only
  tos_timestamp: new Date().toISOString()
});
```

**Response:**
```json
{
  "token": "ah_abcd1234efgh5678ijkl",
  "status": "ACCEPTED",
  "account_type": "INDIVIDUAL",
  "individual": {
    "first_name": "Eric",
    "last_name": "Medina",
    "email": "eric@msdcafe.com",
    "phone_number": "+15555551234"
  }
}
```

**What We Store:**
```javascript
user.lithic_account_holder_token = response.data.token;
```

**Key Points:**
- `kyc_exempt: true` is for sandbox only
- In production, full KYC would be required
- Each user gets their own account holder
- Account holder token is stored in database

---

### 2. Financial Account Creation

**When:** First card is created for an account

**Lithic Endpoint:** `POST /financial_accounts`

**Purpose:** Financial accounts hold funds and link to cards

**Implementation:** `backend/routes/cards.js`

**Request:**
```javascript
const response = await lithicClient.post('/financial_accounts', {
  account_holder_token: account.lithic_account_token,
  type: 'ISSUING'
});
```

**Response:**
```json
{
  "token": "fa_abcd1234efgh5678ijkl",
  "account_token": "ah_abcd1234efgh5678ijkl",
  "type": "ISSUING",
  "status": "ACTIVE"
}
```

**What We Store:**
```javascript
account.lithic_financial_account_token = response.data.token;
```

**Key Points:**
- Created once per account (on first card creation)
- Type is always `ISSUING` for card issuing
- Links to the business owner's account holder
- Token reused for all cards in the account

---

### 3. Card Creation

**When:** User creates a debit or reloadable card

**Lithic Endpoint:** `POST /cards`

**Purpose:** Issue physical or virtual cards to users

**Implementation:** `backend/routes/cards.js`

**Request (Debit Card):**
```javascript
const response = await lithicClient.post('/cards', {
  account_token: user.lithic_account_holder_token,
  card_type: 'VIRTUAL',
  memo: `${cardType} card for ${user.first_name} ${user.last_name}`,
  spend_limit: spendLimit ? parseInt(spendLimit * 100) : null,
  spend_limit_duration: spendLimitDuration?.toUpperCase() || null
});
```

**Request (Reloadable Card):**
```javascript
const response = await lithicClient.post('/cards', {
  account_token: user.lithic_account_holder_token,
  card_type: 'VIRTUAL',
  memo: `Reloadable card for ${user.first_name} ${user.last_name}`,
  spend_limit: spendLimit ? parseInt(spendLimit * 100) : null,
  spend_limit_duration: spendLimitDuration?.toUpperCase() || null
});
```

**Response:**
```json
{
  "token": "card_abcd1234efgh5678ijkl",
  "last_four": "4532",
  "pan": "4111111111114532",
  "cvv": "123",
  "exp_month": "12",
  "exp_year": "2026",
  "type": "VIRTUAL",
  "state": "OPEN",
  "spend_limit": 200000,
  "spend_limit_duration": "MONTHLY"
}
```

**What We Store:**
```javascript
card.lithic_card_token = response.data.token;
card.last_four = response.data.last_four;
```

**Key Points:**
- `spend_limit` is in cents (multiply by 100)
- `card_type` can be `VIRTUAL` or `PHYSICAL`
- POC uses `VIRTUAL` for instant provisioning
- Card details (PAN, CVV) returned in sandbox
- In production, card details would be securely stored

**Spend Limit Durations:**
- `DAILY` - Resets every 24 hours
- `MONTHLY` - Resets on 1st of each month
- `YEARLY` - Resets on January 1st
- `TRANSACTION` - Per-transaction limit

---

### 4. Authorization Rules (Spending Profiles)

**When:** Spending profile is created

**Lithic Endpoint:** `POST /auth_rules`

**Purpose:** Control what merchants/categories cards can be used at

**Implementation:** `backend/routes/spendingProfiles.js`

**Request:**
```javascript
const response = await lithicClient.post('/auth_rules', {
  account_tokens: [account.lithic_account_token],
  allowed_mcc: allowedCategories.length > 0 ? allowedCategories : null,
  blocked_mcc: blockedCategories.length > 0 ? blockedCategories : null,
  spend_limits: spendLimit ? [{
    amount: parseInt(spendLimit * 100),
    interval: spendLimitDuration?.toUpperCase() || 'MONTHLY'
  }] : null
});
```

**Example Request:**
```json
{
  "account_tokens": ["ah_abcd1234efgh5678ijkl"],
  "blocked_mcc": ["7995", "7011"],
  "spend_limits": [{
    "amount": 50000,
    "interval": "MONTHLY"
  }]
}
```

**Response:**
```json
{
  "token": "auth_rule_abcd1234efgh5678ijkl",
  "state": "ACTIVE",
  "account_tokens": ["ah_abcd1234efgh5678ijkl"],
  "blocked_mcc": ["7995", "7011"],
  "spend_limits": [{
    "amount": 50000,
    "interval": "MONTHLY"
  }]
}
```

**What We Store:**
```javascript
spendingProfile.lithic_auth_rule_token = response.data.token;
```

**Key Points:**
- `allowed_mcc` and `blocked_mcc` are mutually exclusive
- Use `blocked_mcc` to block specific categories
- Use `allowed_mcc` to only allow specific categories
- MCC codes are 4-digit merchant category codes
- Multiple auth rules can be created and combined

**Common MCC Codes:**

| MCC | Category |
|-----|----------|
| 5411 | Grocery Stores |
| 5812 | Eating Places/Restaurants |
| 5814 | Fast Food Restaurants |
| 5541 | Service Stations (Gas) |
| 7011 | Hotels/Lodging |
| 7995 | Betting/Casino Gambling |
| 5999 | Miscellaneous Retail |

---

### 5. Attaching Auth Rules to Cards

**When:** Card is created with a spending profile

**Lithic Endpoint:** `PATCH /cards/{card_token}`

**Purpose:** Apply spending profile rules to specific cards

**Implementation:** `backend/routes/cards.js`

**Request:**
```javascript
await lithicClient.patch(`/cards/${card.lithic_card_token}`, {
  auth_rule_token: spendingProfile.lithic_auth_rule_token
});
```

**Key Points:**
- Auth rules can be attached during or after card creation
- Multiple cards can share the same auth rule
- Changing the auth rule affects all attached cards
- Auth rules can be updated or removed

---

## Error Handling

### Lithic API Errors

**Common Error Responses:**

**400 Bad Request:**
```json
{
  "message": "Invalid parameter: spend_limit must be positive"
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid API key"
}
```

**429 Rate Limit:**
```json
{
  "message": "Rate limit exceeded"
}
```

### Implementation

```javascript
try {
  const response = await lithicClient.post('/cards', cardData);
  // Success handling
} catch (error) {
  console.error('Lithic API Error:', error.response?.data);
  res.status(500).json({ 
    error: 'Failed to create card',
    message: error.response?.data?.message || error.message
  });
}
```

---

## Sandbox vs Production

### Sandbox Features
- ✅ Full API functionality
- ✅ Test cards that don't charge real money
- ✅ Instant provisioning
- ✅ No KYC required (`kyc_exempt: true`)
- ✅ Test transaction simulations

### Production Changes Required

1. **KYC Compliance:**
   ```javascript
   // Remove kyc_exempt
   // Add proper KYC documentation
   {
     individual: {
       first_name: 'Eric',
       last_name: 'Medina',
       dob: '1990-01-01',
       address: { /* full address */ },
       // ... additional KYC fields
     }
   }
   ```

2. **Physical Cards:**
   ```javascript
   {
     card_type: 'PHYSICAL',
     shipping: {
       method: 'STANDARD',
       address: { /* shipping address */ }
     }
   }
   ```

3. **Real Funding:**
   - Integrate with bank accounts
   - ACH transfers
   - Wire transfers
   - Balance management

4. **Webhooks:**
   ```javascript
   // Subscribe to events
   POST /webhooks
   {
     url: 'https://your-domain.com/webhooks/lithic',
     event_types: [
       'transaction.created',
       'card.created',
       'account_holder.updated'
     ]
   }
   ```

5. **Security:**
   - Store card details securely (PCI compliance)
   - Implement fraud detection
   - Add transaction monitoring
   - Use production API keys

---

## Data Flow Example

### Creating a User with Card

```
1. User submits create user form
   │
   ▼
2. POST /api/users
   │
   ├─► Create user in database
   │   └─► POST /account_holders (Lithic)
   │       └─► Store account_holder_token
   │
   ▼
3. User created successfully
   │
   ▼
4. User submits create card form
   │
   ▼
5. POST /api/cards
   │
   ├─► Check if financial account exists
   │   ├─► No: POST /financial_accounts (Lithic)
   │   │   └─► Store financial_account_token
   │   └─► Yes: Use existing token
   │
   ├─► POST /cards (Lithic)
   │   └─► Store card_token and last_four
   │
   ├─► If spending profile selected:
   │   └─► PATCH /cards/{card_token} (Lithic)
   │       └─► Attach auth_rule_token
   │
   └─► Create card in database
       └─► Link to user and profile
   │
   ▼
6. Card created successfully
```

---

## Testing with Lithic Sandbox

### Test Scenarios

1. **Create Account Holder:**
   - Use any valid email/phone
   - No real verification required
   - Instant approval

2. **Create Cards:**
   - Cards are instantly active
   - Full card details returned
   - Can create unlimited test cards

3. **Test Transactions:**
   ```javascript
   POST /simulate/authorize
   {
     "token": "card_token",
     "amount": 5000,  // $50.00
     "descriptor": "TEST MERCHANT"
   }
   ```

4. **Test Auth Rules:**
   - Block specific MCCs
   - Test with different merchant types
   - Verify spending limits

### Sandbox Limitations

- No real money transfers
- Simplified KYC
- Some features may be limited
- Rate limits may differ from production

---

## Rate Limits

**Sandbox:**
- 100 requests per second
- 10,000 requests per hour

**Production:**
- Contact Lithic for limits
- Implement backoff strategies

**Implementation:**
```javascript
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        await sleep(1000 * (i + 1)); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

---

## Monitoring & Logging

### Current Logging

```javascript
console.log('Creating Lithic account holder:', email);
console.error('Lithic API error:', error.response?.data);
```

### Production Recommendations

1. **Structured Logging:**
   ```javascript
   const winston = require('winston');
   
   logger.info('lithic.account_holder.create', {
     email: user.email,
     accountId: account.id
   });
   ```

2. **Error Tracking:**
   - Use Sentry, Rollbar, or similar
   - Track all Lithic API errors
   - Alert on critical failures

3. **Metrics:**
   - Track API response times
   - Monitor success/failure rates
   - Alert on rate limit approaches

---

## Security Best Practices

1. **API Key Management:**
   - Store in environment variables
   - Never commit to version control
   - Rotate regularly
   - Use different keys for sandbox/production

2. **Card Data:**
   - Never log full PAN, CVV
   - Store securely if needed (PCI compliance)
   - Use tokenization

3. **Account Holder Data:**
   - Encrypt PII in database
   - Follow GDPR/privacy regulations
   - Implement data retention policies

4. **Webhook Validation:**
   ```javascript
   const crypto = require('crypto');
   
   function validateWebhook(payload, signature, secret) {
     const hmac = crypto.createHmac('sha256', secret);
     const digest = hmac.update(payload).digest('hex');
     return signature === digest;
   }
   ```

---

## Additional Resources

- **Lithic Documentation:** https://docs.lithic.com/
- **API Reference:** https://docs.lithic.com/reference
- **Sandbox Console:** https://sandbox.lithic.com/
- **Support:** support@lithic.com

---

**Last Updated:** 2025-10-06

For feature descriptions, see **[FEATURES.md](FEATURES.md)**.

For architecture details, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.
