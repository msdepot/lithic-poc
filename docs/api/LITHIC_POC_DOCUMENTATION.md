# Lithic POC - Complete Documentation & API Specification

## Overview
This document outlines the complete architecture for a Lithic payment card management system POC that integrates with Lithic's sandbox API while maintaining a local database for custom business logic, RBAC, and spending profiles.

## System Architecture

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MySQL (localhost, root, no password)
- **API Testing**: Postman
- **Payment Provider**: Lithic Sandbox API
- **API Key**: `595234f1-968e-4fad-b308-41f6e19bc93f`

### Core Components
1. **Local Database**: Manages users, accounts, spending profiles, and RBAC
2. **Lithic Integration**: Handles card creation, management, and transactions
3. **Custom Spending Profiles**: Local implementation that controls Lithic card limits
4. **RBAC System**: Role-based access control with 5 user types

## Role-Based Access Control (RBAC)

### User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | System owner with full access | All operations, can manage all roles including Super Admins |
| **Super Admin** | High-level admin | All operations except managing Owner accounts |
| **Admin** | Standard administrator | Manage users (User/Analyst only), accounts, cards, spending profiles |
| **User** | Regular user with cards | Manage own cards, view own transactions, modify own profile |
| **Analyst** | Read-only access for analysis | View all transactions, generate reports, no modifications |

### Permission Matrix

| Operation | Owner | Super Admin | Admin | User | Analyst |
|-----------|-------|-------------|-------|------|---------|
| Manage Owner accounts | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Super Admin accounts | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Admin accounts | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage User/Analyst accounts | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create/Modify Spending Profiles | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete Spending Profiles | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create Cards for Users | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage Own Cards | ✓ | ✓ | ✓ | ✓ | ✗ |
| View All Transactions | ✓ | ✓ | ✓ | ✗ | ✓ |
| View Own Transactions | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add Funds to Accounts | ✓ | ✓ | ✓ | ✗ | ✗ |

## API Endpoints Specification

### Authentication
All endpoints require JWT token in Authorization header: `Bearer <token>`

### User Management

#### 1. Create User
- **Endpoint**: `POST /api/users`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "owner|super_admin|admin|user|analyst",
  "first_name": "string",
  "last_name": "string",
  "phone": "string"
}
```

#### 2. Get Users
- **Endpoint**: `GET /api/users`
- **Access**: Owner, Super Admin, Admin
- **Query Parameters**: `?role=admin&limit=50&offset=0`

#### 3. Get User by ID
- **Endpoint**: `GET /api/users/:userId`
- **Access**: Owner, Super Admin, Admin, Own User

#### 4. Update User
- **Endpoint**: `PATCH /api/users/:userId`
- **Access**: Owner, Super Admin, Admin, Own User
- **Body**:
```json
{
  "email": "string",
  "first_name": "string", 
  "last_name": "string",
  "phone": "string",
  "role": "string" // Only for admins
}
```

#### 5. Delete User
- **Endpoint**: `DELETE /api/users/:userId`
- **Access**: Owner, Super Admin, Admin
- **Note**: Cannot delete users with active cards

### Account Management

#### 6. Create Account
- **Endpoint**: `POST /api/accounts`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "account_name": "string",
  "user_id": "integer",
  "account_type": "personal|business",
  "initial_balance": "decimal"
}
```

#### 7. Get Accounts
- **Endpoint**: `GET /api/accounts`
- **Access**: Owner, Super Admin, Admin, Own Accounts (User)

#### 8. Update Account
- **Endpoint**: `PATCH /api/accounts/:accountId`
- **Access**: Owner, Super Admin, Admin

#### 9. Add Funds to Account
- **Endpoint**: `POST /api/accounts/:accountId/funds`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "amount": "decimal",
  "funding_source": "ach|wire|check"
}
```

### Card Management

#### 10. Create Card
- **Endpoint**: `POST /api/cards`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "user_id": "integer",
  "account_id": "integer",
  "card_type": "debit|credit|prepaid",
  "card_subtype": "virtual|physical",
  "spending_profile_id": "integer", // Optional
  "custom_limits": { // Optional, overrides spending profile
    "daily_limit": "decimal",
    "monthly_limit": "decimal",
    "per_transaction_limit": "decimal"
  },
  "memo": "string"
}
```

#### 11. Get Cards
- **Endpoint**: `GET /api/cards`
- **Access**: Owner, Super Admin, Admin, Own Cards (User)
- **Query Parameters**: `?user_id=123&status=active&limit=50`

#### 12. Get Card by ID
- **Endpoint**: `GET /api/cards/:cardId`
- **Access**: Owner, Super Admin, Admin, Card Owner

#### 13. Update Card
- **Endpoint**: `PATCH /api/cards/:cardId`
- **Access**: Owner, Super Admin, Admin, Card Owner
- **Body**:
```json
{
  "spending_profile_id": "integer", // null removes from profile
  "custom_limits": {
    "daily_limit": "decimal",
    "monthly_limit": "decimal", 
    "per_transaction_limit": "decimal"
  },
  "memo": "string"
}
```

#### 14. Update Card Status
- **Endpoint**: `PATCH /api/cards/:cardId/status`
- **Access**: Owner, Super Admin, Admin, Card Owner
- **Body**:
```json
{
  "status": "active|locked|cancelled",
  "reason": "string"
}
```

#### 15. Get Card Spending Limits
- **Endpoint**: `GET /api/cards/:cardId/limits`
- **Access**: Owner, Super Admin, Admin, Card Owner

### Spending Profiles Management

#### 16. Create Spending Profile
- **Endpoint**: `POST /api/spending-profiles`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "profile_name": "string",
  "description": "string",
  "daily_limit": "decimal",
  "monthly_limit": "decimal",
  "per_transaction_limit": "decimal",
  "allowed_merchant_categories": ["array of strings"],
  "blocked_merchant_categories": ["array of strings"]
}
```

#### 17. Get Spending Profiles
- **Endpoint**: `GET /api/spending-profiles`
- **Access**: Owner, Super Admin, Admin

#### 18. Get Spending Profile by ID
- **Endpoint**: `GET /api/spending-profiles/:profileId`
- **Access**: Owner, Super Admin, Admin

#### 19. Update Spending Profile
- **Endpoint**: `PATCH /api/spending-profiles/:profileId`
- **Access**: Owner, Super Admin, Admin
- **Body**:
```json
{
  "profile_name": "string",
  "description": "string", 
  "daily_limit": "decimal",
  "monthly_limit": "decimal",
  "per_transaction_limit": "decimal"
}
```
- **Note**: Updates all cards using this profile

#### 20. Delete Spending Profile
- **Endpoint**: `DELETE /api/spending-profiles/:profileId`
- **Access**: Owner, Super Admin, Admin
- **Note**: Cannot delete profiles with attached cards

#### 21. Get Cards by Spending Profile
- **Endpoint**: `GET /api/spending-profiles/:profileId/cards`
- **Access**: Owner, Super Admin, Admin

### Transaction Management

#### 22. Get Transactions
- **Endpoint**: `GET /api/transactions`
- **Access**: Owner, Super Admin, Admin, Analyst, Own Transactions (User)
- **Query Parameters**: `?card_id=123&start_date=2024-01-01&end_date=2024-12-31&status=settled&limit=100`

#### 23. Get Transaction by ID
- **Endpoint**: `GET /api/transactions/:transactionId`
- **Access**: Owner, Super Admin, Admin, Analyst, Transaction Owner

#### 24. Get User Transactions
- **Endpoint**: `GET /api/users/:userId/transactions`
- **Access**: Owner, Super Admin, Admin, Analyst, Own Transactions

#### 25. Get Account Transactions
- **Endpoint**: `GET /api/accounts/:accountId/transactions`
- **Access**: Owner, Super Admin, Admin, Analyst, Account Owner

### Authentication & Authorization

#### 26. Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

#### 27. Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Access**: Authenticated Users

#### 28. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated Users

#### 29. Change Password
- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated Users
- **Body**:
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

### Reporting & Analytics

#### 30. Get Spending Summary
- **Endpoint**: `GET /api/reports/spending-summary`
- **Access**: Owner, Super Admin, Admin, Analyst
- **Query Parameters**: `?user_id=123&start_date=2024-01-01&end_date=2024-12-31`

#### 31. Get Card Usage Report
- **Endpoint**: `GET /api/reports/card-usage`
- **Access**: Owner, Super Admin, Admin, Analyst

#### 32. Get Spending Profile Performance
- **Endpoint**: `GET /api/reports/spending-profiles`
- **Access**: Owner, Super Admin, Admin, Analyst

## Lithic API Integration Points

### Account Holders (Maps to Users)
- **Create**: `POST /v1/account_holders`
- **Update**: `PATCH /v1/account_holders/{account_holder_token}`
- **Get**: `GET /v1/account_holders/{account_holder_token}`

### Financial Accounts (Maps to Accounts)  
- **Create**: `POST /v1/financial_accounts`
- **Update**: `PATCH /v1/financial_accounts/{financial_account_token}`
- **Get**: `GET /v1/financial_accounts/{financial_account_token}`

### Cards
- **Create**: `POST /v1/cards`
- **Update**: `PATCH /v1/cards/{card_token}`
- **Get**: `GET /v1/cards/{card_token}`
- **Get Spending Limits**: `GET /v1/cards/{card_token}/spend_limits`

### Auth Rules (For Spending Controls)
- **Create**: `POST /v1/auth_rules`
- **Update**: `PATCH /v1/auth_rules/{auth_rule_token}`
- **Apply**: `POST /v1/auth_rules/{auth_rule_token}/apply`

### Transactions
- **List**: `GET /v1/transactions`
- **Get**: `GET /v1/transactions/{transaction_token}`

### Funding (Limited in Sandbox)
- **External Payment**: `POST /v1/external_payments`

## Custom Spending Profile Logic

### Implementation Strategy
1. **Profile Creation**: Store profile rules in local database
2. **Card Assignment**: Link cards to profiles in local DB
3. **Limit Enforcement**: 
   - Create Lithic Auth Rules based on profile settings
   - Apply auth rules to cards when profile is assigned
   - Update auth rules when profile is modified
4. **Profile Changes**: 
   - When profile is updated, update all associated Lithic auth rules
   - When card is assigned to new profile, remove old auth rules and apply new ones
   - When card gets custom limits, remove from profile and create individual auth rules

### Profile-to-Auth-Rule Mapping
```javascript
// Example: Convert spending profile to Lithic auth rule
const createAuthRuleFromProfile = (profile) => {
  return {
    account_tokens: [], // Will be populated with specific accounts
    program_level: false,
    parameters: {
      conditions: {
        spend_limit: {
          daily: profile.daily_limit,
          monthly: profile.monthly_limit,
          per_authorization: profile.per_transaction_limit
        }
      }
    }
  };
};
```

## Error Handling & Status Codes

### Standard HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., username already exists)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

### Custom Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

## Business Rules & Constraints

### User Management
- Usernames must be unique
- Email addresses must be unique
- Only users with role "user" or higher can have cards
- Cannot delete users with active cards
- Super Admins cannot modify Owner accounts

### Account Management
- Each user must have at least one account
- Account names must be unique per user
- Cannot delete accounts with active cards

### Card Management
- Cards must be associated with both a user and an account
- Users can only manage their own cards (except admins)
- Cards cannot be deleted, only cancelled
- When a card is assigned to a spending profile, any custom limits are removed
- When custom limits are set, the card is removed from any spending profile

### Spending Profiles
- Profile names must be unique
- Cannot delete profiles with attached cards
- When a profile is modified, all cards using that profile are updated
- Limits must be positive numbers
- Daily limits cannot exceed monthly limits

### Transactions
- All transactions are read-only in the local system
- Transaction data is synced from Lithic via webhooks or polling
- Users can only view their own transactions (except admins and analysts)

## Database Considerations

### Indexing Strategy
- Primary keys on all tables
- Unique indexes on usernames, emails, card tokens
- Foreign key indexes for performance
- Composite indexes on frequently queried combinations

### Data Synchronization
- Lithic tokens stored locally for all entities
- Regular sync jobs to keep data consistent
- Webhook endpoints to receive real-time updates
- Conflict resolution for concurrent updates

### Security Considerations
- Passwords hashed using bcrypt
- JWT tokens for API authentication
- API keys encrypted at rest
- Sensitive card data never stored locally (use Lithic tokens)
- Rate limiting on all endpoints
- Input validation and sanitization

This documentation provides the complete foundation for building your Lithic POC with full RBAC, spending profiles, and comprehensive card management capabilities.
