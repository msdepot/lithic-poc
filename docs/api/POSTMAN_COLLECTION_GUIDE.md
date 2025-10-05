# Lithic POC - Postman Collection Setup Guide

## Overview
This guide provides step-by-step instructions for setting up a comprehensive Postman collection to test all Lithic POC APIs. The collection includes authentication, user management, card operations, spending profiles, and transaction monitoring.

## Prerequisites
- Postman installed (latest version)
- MySQL database set up with the provided schema
- Node.js API server running (will be built later)
- Lithic sandbox API key: `595234f1-968e-4fad-b308-41f6e19bc93f`

## Collection Structure

### Environment Variables Setup

Create a new environment in Postman called "Lithic POC" with the following variables:

```json
{
  "base_url": "http://localhost:3000/api",
  "lithic_base_url": "https://sandbox.lithic.com/v1",
  "lithic_api_key": "595234f1-968e-4fad-b308-41f6e19bc93f",
  "jwt_token": "",
  "refresh_token": "",
  "current_user_id": "",
  "current_account_id": "",
  "current_card_id": "",
  "current_spending_profile_id": ""
}
```

## Authentication Folder

### 1. Login
**POST** `{{base_url}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Tests Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('token');
    pm.environment.set("jwt_token", responseJson.token);
    pm.environment.set("refresh_token", responseJson.refresh_token);
    pm.environment.set("current_user_id", responseJson.user.user_id);
});
```

### 2. Refresh Token
**POST** `{{base_url}}/auth/refresh`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "refresh_token": "{{refresh_token}}"
}
```

### 3. Change Password
**POST** `{{base_url}}/auth/change-password`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "current_password": "admin123",
  "new_password": "newpassword123"
}
```

### 4. Logout
**POST** `{{base_url}}/auth/logout`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## User Management Folder

### 5. Create User
**POST** `{{base_url}}/users`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Tests Script:**
```javascript
pm.test("User created successfully", function () {
    pm.response.to.have.status(201);
    const responseJson = pm.response.json();
    pm.environment.set("test_user_id", responseJson.user.user_id);
});
```

### 6. Get All Users
**GET** `{{base_url}}/users?limit=50&offset=0`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 7. Get User by ID
**GET** `{{base_url}}/users/{{test_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 8. Update User
**PATCH** `{{base_url}}/users/{{test_user_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "first_name": "Johnny",
  "phone": "+1987654321"
}
```

### 9. Delete User
**DELETE** `{{base_url}}/users/{{test_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## Account Management Folder

### 10. Create Account
**POST** `{{base_url}}/accounts`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "account_name": "John's Personal Account",
  "user_id": {{test_user_id}},
  "account_type": "personal",
  "initial_balance": 1000.00
}
```

**Tests Script:**
```javascript
pm.test("Account created successfully", function () {
    pm.response.to.have.status(201);
    const responseJson = pm.response.json();
    pm.environment.set("test_account_id", responseJson.account.account_id);
});
```

### 11. Get All Accounts
**GET** `{{base_url}}/accounts`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 12. Update Account
**PATCH** `{{base_url}}/accounts/{{test_account_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "account_name": "John's Updated Account"
}
```

### 13. Add Funds to Account
**POST** `{{base_url}}/accounts/{{test_account_id}}/funds`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "amount": 500.00,
  "funding_source": "ach"
}
```

## Spending Profiles Folder

### 14. Create Spending Profile
**POST** `{{base_url}}/spending-profiles`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "profile_name": "Test Profile",
  "description": "Test spending profile for POC",
  "daily_limit": 300.00,
  "monthly_limit": 1500.00,
  "per_transaction_limit": 100.00,
  "allowed_merchant_categories": ["5411", "5812"],
  "blocked_merchant_categories": ["7995"]
}
```

**Tests Script:**
```javascript
pm.test("Spending profile created successfully", function () {
    pm.response.to.have.status(201);
    const responseJson = pm.response.json();
    pm.environment.set("test_spending_profile_id", responseJson.profile.spending_profile_id);
});
```

### 15. Get All Spending Profiles
**GET** `{{base_url}}/spending-profiles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 16. Get Spending Profile by ID
**GET** `{{base_url}}/spending-profiles/{{test_spending_profile_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 17. Update Spending Profile
**PATCH** `{{base_url}}/spending-profiles/{{test_spending_profile_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "daily_limit": 400.00,
  "monthly_limit": 2000.00,
  "description": "Updated test spending profile"
}
```

### 18. Get Cards by Spending Profile
**GET** `{{base_url}}/spending-profiles/{{test_spending_profile_id}}/cards`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 19. Delete Spending Profile
**DELETE** `{{base_url}}/spending-profiles/{{test_spending_profile_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## Card Management Folder

### 20. Create Card
**POST** `{{base_url}}/cards`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "user_id": {{test_user_id}},
  "account_id": {{test_account_id}},
  "card_type": "debit",
  "card_subtype": "virtual",
  "spending_profile_id": {{test_spending_profile_id}},
  "memo": "Test card for POC"
}
```

**Tests Script:**
```javascript
pm.test("Card created successfully", function () {
    pm.response.to.have.status(201);
    const responseJson = pm.response.json();
    pm.environment.set("test_card_id", responseJson.card.card_id);
    pm.environment.set("lithic_card_token", responseJson.card.lithic_card_token);
});
```

### 21. Create Card with Custom Limits
**POST** `{{base_url}}/cards`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "user_id": {{test_user_id}},
  "account_id": {{test_account_id}},
  "card_type": "debit",
  "card_subtype": "physical",
  "custom_limits": {
    "daily_limit": 250.00,
    "monthly_limit": 1000.00,
    "per_transaction_limit": 75.00
  },
  "memo": "Custom limits card"
}
```

### 22. Get All Cards
**GET** `{{base_url}}/cards?limit=50&offset=0`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 23. Get Cards by User
**GET** `{{base_url}}/cards?user_id={{test_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 24. Get Card by ID
**GET** `{{base_url}}/cards/{{test_card_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 25. Update Card
**PATCH** `{{base_url}}/cards/{{test_card_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "custom_limits": {
    "daily_limit": 350.00,
    "monthly_limit": 1200.00,
    "per_transaction_limit": 100.00
  },
  "memo": "Updated card limits"
}
```

### 26. Assign Card to Spending Profile
**PATCH** `{{base_url}}/cards/{{test_card_id}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "spending_profile_id": {{test_spending_profile_id}}
}
```

### 27. Lock Card
**PATCH** `{{base_url}}/cards/{{test_card_id}}/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "status": "locked",
  "reason": "Suspicious activity detected"
}
```

### 28. Unlock Card
**PATCH** `{{base_url}}/cards/{{test_card_id}}/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "status": "active",
  "reason": "Issue resolved"
}
```

### 29. Cancel Card
**PATCH** `{{base_url}}/cards/{{test_card_id}}/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{jwt_token}}
```

**Body (raw JSON):**
```json
{
  "status": "cancelled",
  "reason": "User requested cancellation"
}
```

### 30. Get Card Spending Limits
**GET** `{{base_url}}/cards/{{test_card_id}}/limits`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## Transaction Management Folder

### 31. Get All Transactions
**GET** `{{base_url}}/transactions?limit=50&offset=0`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 32. Get Transactions by Card
**GET** `{{base_url}}/transactions?card_id={{test_card_id}}&limit=25`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 33. Get Transactions by Date Range
**GET** `{{base_url}}/transactions?start_date=2024-01-01&end_date=2024-12-31&limit=100`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 34. Get Transaction by ID
**GET** `{{base_url}}/transactions/{{transaction_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 35. Get User Transactions
**GET** `{{base_url}}/users/{{test_user_id}}/transactions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 36. Get Account Transactions
**GET** `{{base_url}}/accounts/{{test_account_id}}/transactions`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## Reporting & Analytics Folder

### 37. Get Spending Summary
**GET** `{{base_url}}/reports/spending-summary?start_date=2024-01-01&end_date=2024-12-31`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 38. Get Card Usage Report
**GET** `{{base_url}}/reports/card-usage?user_id={{test_user_id}}`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

### 39. Get Spending Profile Performance
**GET** `{{base_url}}/reports/spending-profiles`

**Headers:**
```
Authorization: Bearer {{jwt_token}}
```

## Direct Lithic API Folder

### 40. Create Lithic Account Holder
**POST** `{{lithic_base_url}}/account_holders`

**Headers:**
```
Content-Type: application/json
Authorization: {{lithic_api_key}}
```

**Body (raw JSON):**
```json
{
  "beneficial_owner_entities": [],
  "beneficial_owner_individuals": [],
  "business_entity": null,
  "control_person": {
    "address": {
      "address1": "123 Main St",
      "city": "New York",
      "country": "USA",
      "postal_code": "10001",
      "state": "NY"
    },
    "dob": "1990-01-01",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "government_id": "123456789",
    "phone_number": "+12345678901"
  },
  "nature_of_business": "Software Development",
  "tos_timestamp": "2024-01-01T00:00:00Z",
  "workflow": "KYC_EXEMPT"
}
```

### 41. Create Lithic Financial Account
**POST** `{{lithic_base_url}}/financial_accounts`

**Headers:**
```
Content-Type: application/json
Authorization: {{lithic_api_key}}
```

**Body (raw JSON):**
```json
{
  "nickname": "Test Account",
  "type": "OPERATING"
}
```

### 42. Create Lithic Card
**POST** `{{lithic_base_url}}/cards`

**Headers:**
```
Content-Type: application/json
Authorization: {{lithic_api_key}}
```

**Body (raw JSON):**
```json
{
  "type": "VIRTUAL",
  "account_token": "{{lithic_account_token}}",
  "card_program_token": "{{card_program_token}}",
  "memo": "Test virtual card"
}
```

### 43. Get Lithic Card Details
**GET** `{{lithic_base_url}}/cards/{{lithic_card_token}}`

**Headers:**
```
Authorization: {{lithic_api_key}}
```

### 44. Update Lithic Card
**PATCH** `{{lithic_base_url}}/cards/{{lithic_card_token}}`

**Headers:**
```
Content-Type: application/json
Authorization: {{lithic_api_key}}
```

**Body (raw JSON):**
```json
{
  "state": "PAUSED",
  "memo": "Card paused for testing"
}
```

### 45. Get Lithic Transactions
**GET** `{{lithic_base_url}}/transactions?card_token={{lithic_card_token}}`

**Headers:**
```
Authorization: {{lithic_api_key}}
```

### 46. Create Lithic Auth Rule
**POST** `{{lithic_base_url}}/auth_rules`

**Headers:**
```
Content-Type: application/json
Authorization: {{lithic_api_key}}
```

**Body (raw JSON):**
```json
{
  "account_tokens": [],
  "card_tokens": ["{{lithic_card_token}}"],
  "program_level": false,
  "parameters": {
    "conditions": {
      "spend_limit": {
        "daily": 30000,
        "monthly": 100000
      }
    }
  }
}
```

## Test Scenarios Folder

### 47. Complete User Journey
This is a comprehensive test that runs multiple requests in sequence:

1. Create user
2. Create account for user
3. Create spending profile
4. Create card with spending profile
5. Update card limits
6. Lock and unlock card
7. Get transactions
8. Clean up (delete card, profile, account, user)

### 48. RBAC Testing
Test different user roles and their permissions:

1. Login as different role types
2. Attempt operations based on permissions
3. Verify proper authorization responses

### 49. Error Handling Tests
Test various error scenarios:

1. Invalid authentication
2. Missing required fields
3. Invalid data formats
4. Permission denied scenarios
5. Resource not found cases

## Pre-request Scripts

Add this to the collection's Pre-request Script to handle authentication automatically:

```javascript
// Auto-refresh token if expired
if (pm.environment.get("jwt_token")) {
    const token = pm.environment.get("jwt_token");
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now + 60) { // Refresh if expires in next minute
        pm.sendRequest({
            url: pm.environment.get("base_url") + "/auth/refresh",
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    refresh_token: pm.environment.get("refresh_token")
                })
            }
        }, function (err, response) {
            if (!err && response.code === 200) {
                const newToken = response.json().token;
                pm.environment.set("jwt_token", newToken);
            }
        });
    }
}
```

## Collection Tests

Add this to the collection's Tests tab for global test validation:

```javascript
// Global response time test
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Global status code validation for non-error requests
if (pm.response.code >= 200 && pm.response.code < 300) {
    pm.test("Response has valid JSON", function () {
        pm.response.to.be.json;
    });
}

// Log important response data
if (pm.response.code >= 400) {
    console.log("Error Response:", pm.response.text());
}
```

## Usage Instructions

1. **Import the Collection**: Create a new collection in Postman and add all the above requests
2. **Set up Environment**: Create the environment with all specified variables
3. **Run Authentication**: Start by running the login request to get JWT tokens
4. **Test User Journey**: Follow the logical flow: User → Account → Card → Transactions
5. **Test RBAC**: Create users with different roles and test permissions
6. **Monitor Results**: Use the Tests tab results to verify functionality

## Tips for Testing

1. **Sequential Testing**: Some requests depend on previous ones (create before update)
2. **Clean Up**: Always clean up test data to avoid conflicts
3. **Error Testing**: Intentionally test error scenarios
4. **Performance**: Monitor response times and optimize as needed
5. **Data Validation**: Verify all returned data matches expected formats

This comprehensive Postman collection will allow you to thoroughly test all aspects of your Lithic POC system, from basic CRUD operations to complex business logic involving spending profiles and role-based access control.
