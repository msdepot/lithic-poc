# 🔌 API Documentation

Complete API reference for the Lithic POC backend.

**Base URL:** `http://localhost:3001/api`

---

## Authentication

All user endpoints (except login) require authentication via JWT token.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### Admin Login

**POST** `/api/auth/admin-login`

Login to admin CRM system.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin@123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "type": "admin"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### User Login

**POST** `/api/auth/user-login`

Login as a business user (email only, no password).

**Request Body:**
```json
{
  "email": "eric@msdcafe.com"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "accountId": 1,
    "email": "eric@msdcafe.com",
    "firstName": "Eric",
    "lastName": "Medina",
    "role": "owner"
  },
  "account": {
    "id": 1,
    "businessName": "MSD Cafe",
    "balance": 15000
  }
}
```

**Errors:**
- `404` - User not found
- `401` - Account inactive

---

## 🏢 Account Endpoints

### Create Account

**POST** `/api/accounts`

Create a new business account with owner (Admin CRM only).

**Request Body:**
```json
{
  "businessName": "MSD Cafe",
  "ownerEmail": "eric@msdcafe.com",
  "ownerFirstName": "Eric",
  "ownerLastName": "Medina",
  "ownerPhone": "+15555551234"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "account": {
    "id": 1,
    "businessName": "MSD Cafe",
    "ownerEmail": "eric@msdcafe.com",
    "balance": 0,
    "lithicAccountToken": "ac_abc123..."
  },
  "owner": {
    "id": 1,
    "email": "eric@msdcafe.com",
    "firstName": "Eric",
    "lastName": "Medina",
    "role": "owner"
  }
}
```

**What Happens:**
1. Creates business account in database
2. Creates Lithic account holder for owner
3. Creates owner user with "owner" role
4. Returns account and owner details

**Errors:**
- `400` - Missing required fields
- `409` - Account with email already exists
- `500` - Lithic API error

---

### Fund Account

**POST** `/api/accounts/fund`

Add funds to an account (Admin CRM only).

**Request Body:**
```json
{
  "accountId": 1,
  "amount": 15000
}
```

**Response (200):**
```json
{
  "message": "Account funded successfully",
  "account": {
    "id": 1,
    "businessName": "MSD Cafe",
    "balance": 15000
  }
}
```

**Note:** In sandbox mode, this updates the database balance but doesn't actually transfer funds.

**Errors:**
- `404` - Account not found
- `400` - Invalid amount

---

## 👥 User Endpoints

All user endpoints require authentication.

### Create User

**POST** `/api/users`

Create a new user in the account.

**Required Role:** Owner or Admin

**Request Body:**
```json
{
  "email": "seth@msdcafe.com",
  "firstName": "Seth",
  "lastName": "Medina",
  "role": "admin",
  "phone": "+15555552001"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "accountId": 1,
    "email": "seth@msdcafe.com",
    "firstName": "Seth",
    "lastName": "Medina",
    "role": "admin",
    "phone": "+15555552001",
    "lithicAccountHolderToken": "ah_abc123...",
    "status": "active"
  }
}
```

**What Happens:**
1. Creates user in database
2. Creates Lithic account holder
3. Links to business account
4. Returns user details

**Role Options:**
- `owner` - Full control (usually one per account)
- `admin` - User and card management
- `user` - Limited access
- `analyst` - Read-only

**Errors:**
- `403` - Insufficient permissions
- `409` - User email already exists in account
- `400` - Invalid role
- `500` - Lithic API error

---

### Get Users

**GET** `/api/users`

Get all users in the account.

**Required Role:** Any authenticated user

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "eric@msdcafe.com",
      "firstName": "Eric",
      "lastName": "Medina",
      "role": "owner",
      "phone": "+15555551234",
      "cardCount": 2,
      "status": "active"
    },
    {
      "id": 2,
      "email": "seth@msdcafe.com",
      "firstName": "Seth",
      "lastName": "Medina",
      "role": "admin",
      "phone": "+15555552001",
      "cardCount": 1,
      "status": "active"
    }
  ]
}
```

**Features:**
- Returns all users in the authenticated user's account
- Includes card count for each user
- Ordered by creation date

---

## 💳 Card Endpoints

All card endpoints require authentication.

### Create Card

**POST** `/api/cards`

Create a new card for a user.

**Required Role:** Owner or Admin

**Request Body:**
```json
{
  "userId": 2,
  "cardType": "debit",
  "spendLimit": 2000,
  "spendLimitDuration": "monthly",
  "spendingProfileId": null
}
```

**Field Options:**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| userId | number | Yes | Valid user ID in account |
| cardType | string | Yes | `debit`, `reloadable` |
| spendLimit | number | No | Amount in dollars |
| spendLimitDuration | string | No | `daily`, `monthly`, `yearly` |
| spendingProfileId | number | No | Valid profile ID or null |

**Response (201):**
```json
{
  "message": "Card created successfully",
  "card": {
    "id": 1,
    "accountId": 1,
    "userId": 2,
    "cardType": "debit",
    "lastFour": "4532",
    "spendLimit": 2000,
    "spendLimitDuration": "monthly",
    "spendingProfileId": null,
    "lithicCardToken": "card_abc123...",
    "status": "active",
    "user": {
      "firstName": "Seth",
      "lastName": "Medina"
    }
  }
}
```

**What Happens:**
1. Creates financial account if first card
2. Creates card via Lithic API
3. Saves card in database
4. Applies spending limits
5. Attaches spending profile if specified
6. Returns card details

**Errors:**
- `403` - Insufficient permissions
- `404` - User not found
- `400` - Invalid card type or limits
- `500` - Lithic API error

---

### Get Cards

**GET** `/api/cards`

Get all cards in the account.

**Required Role:** Any authenticated user

**Response (200):**
```json
{
  "cards": [
    {
      "id": 1,
      "cardType": "debit",
      "lastFour": "4532",
      "spendLimit": 2000,
      "spendLimitDuration": "monthly",
      "status": "active",
      "user": {
        "id": 2,
        "firstName": "Seth",
        "lastName": "Medina",
        "email": "seth@msdcafe.com"
      },
      "spendingProfile": null
    },
    {
      "id": 2,
      "cardType": "reloadable",
      "lastFour": "8821",
      "spendLimit": 500,
      "spendLimitDuration": "monthly",
      "status": "active",
      "user": {
        "id": 3,
        "firstName": "Gabriel",
        "lastName": "Medina",
        "email": "gabriel@msdcafe.com"
      },
      "spendingProfile": {
        "id": 1,
        "name": "Basic User Spending"
      }
    }
  ]
}
```

**Features:**
- Returns all cards in the authenticated user's account
- Includes user information
- Includes spending profile if attached
- Ordered by creation date

---

## 📊 Spending Profile Endpoints

All spending profile endpoints require authentication.

### Create Spending Profile

**POST** `/api/spending-profiles`

Create a reusable spending restriction template.

**Required Role:** Owner or Admin

**Request Body:**
```json
{
  "name": "Basic User Spending",
  "description": "Limited spending for regular users - no gambling or hotels",
  "spendLimit": 500,
  "spendLimitDuration": "monthly",
  "blockedCategories": "7995,7011",
  "allowedCategories": ""
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Profile name |
| description | string | No | Profile description |
| spendLimit | number | No | Spending limit amount |
| spendLimitDuration | string | No | `daily`, `monthly`, `yearly` |
| blockedCategories | string | No | Comma-separated MCC codes |
| allowedCategories | string | No | Comma-separated MCC codes |

**Response (201):**
```json
{
  "message": "Spending profile created successfully",
  "spendingProfile": {
    "id": 1,
    "accountId": 1,
    "name": "Basic User Spending",
    "description": "Limited spending for regular users - no gambling or hotels",
    "spendLimit": 500,
    "spendLimitDuration": "monthly",
    "blockedCategories": ["7995", "7011"],
    "allowedCategories": [],
    "lithicAuthRuleToken": "auth_rule_abc123..."
  }
}
```

**What Happens:**
1. Creates spending profile in database
2. Creates Lithic auth rule
3. Stores auth rule token
4. Returns profile details

**Common MCC Codes:**
- `7995` - Betting/Casino Gambling
- `7011` - Hotels/Lodging
- `5411` - Grocery Stores
- `5814` - Fast Food Restaurants
- `5541` - Service Stations/Gas

**Errors:**
- `403` - Insufficient permissions
- `400` - Invalid spend limit or categories
- `500` - Lithic API error

---

### Get Spending Profiles

**GET** `/api/spending-profiles`

Get all spending profiles in the account.

**Required Role:** Any authenticated user

**Response (200):**
```json
{
  "spendingProfiles": [
    {
      "id": 1,
      "name": "Basic User Spending",
      "description": "Limited spending for regular users",
      "spendLimit": 500,
      "spendLimitDuration": "monthly",
      "blockedCategories": ["7995", "7011"],
      "allowedCategories": [],
      "cardCount": 3
    }
  ]
}
```

**Features:**
- Returns all profiles in the authenticated user's account
- Includes count of cards using each profile
- Ordered by creation date

---

## Error Responses

All endpoints may return these error codes:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Missing required field: email"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "Only owners and admins can create users"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists",
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to create Lithic account holder"
}
```

---

## Rate Limiting

**Current:** No rate limiting (POC)

**Production Recommendation:**
- 100 requests per minute per IP
- 1000 requests per hour per user
- Use middleware like `express-rate-limit`

---

## CORS Configuration

**Current:** Allows all origins (development)

```javascript
app.use(cors({
  origin: '*'
}));
```

**Production Recommendation:**
```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

---

## API Testing

### Using cURL

**Admin Login:**
```bash
curl -X POST http://localhost:3001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin@123"}'
```

**Create User:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email":"test@example.com",
    "firstName":"Test",
    "lastName":"User",
    "role":"user",
    "phone":"+15555550000"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set `Authorization` header with Bearer token
3. Test each endpoint

### Using Frontend

The React frontend provides a complete UI for all API endpoints. Start with:
```bash
npm run dev
```

---

## API Versioning

**Current:** No versioning (POC)

**Future Recommendation:**
- Version in URL: `/api/v1/users`
- Version in header: `API-Version: 1`
- Maintain backward compatibility

---

**Last Updated:** 2025-10-06

For implementation details, see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

For feature descriptions, see **[FEATURES.md](FEATURES.md)**.
