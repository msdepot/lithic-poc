# Lithic POC - Business Rules & Logic Documentation

## Overview

This document defines all business rules, constraints, and logic for the Lithic POC system. These rules govern user interactions, data relationships, and system behavior to ensure data integrity and proper access control.

## User Management Rules

### User Creation Rules
1. **Unique Identifiers**
   - Usernames must be unique across the entire system
   - Email addresses must be unique across the entire system
   - Username must be 3-50 characters, alphanumeric plus underscores only
   - Email must be valid format and not from disposable email providers

2. **Role Assignment**
   - Only Owner can create Super Admin users
   - Only Owner and Super Admin can create Admin users
   - Admin users can create User and Analyst accounts
   - Users cannot create other user accounts
   - Analysts cannot create any user accounts

3. **Password Requirements**
   - Minimum 8 characters
   - Must contain at least one uppercase letter
   - Must contain at least one lowercase letter
   - Must contain at least one number
   - Must contain at least one special character
   - Cannot be same as username or email
   - Cannot be a common password (dictionary check)

4. **User Lifecycle**
   - Users can be deactivated but not deleted if they have associated data
   - Deactivated users cannot login or perform operations
   - Users with active cards cannot be deleted
   - Users with transaction history cannot be deleted

### Role-Based Access Control Rules

#### Owner Role Rules
- **Permissions**: Full system access
- **Restrictions**: 
  - Only one Owner account allowed per system
  - Cannot be deleted or deactivated
  - Cannot have role changed by any other user
- **Special Privileges**:
  - Can manage all user roles including Super Admins
  - Can access system-wide settings
  - Can view all audit logs
  - Can perform system maintenance operations

#### Super Admin Role Rules
- **Permissions**: All operations except Owner management
- **Restrictions**:
  - Cannot create, modify, or delete Owner accounts
  - Cannot change Owner's role or permissions
  - Cannot access Owner-specific system settings
- **Capabilities**:
  - Manage Admin, User, and Analyst accounts
  - Full access to cards, accounts, and spending profiles
  - Access to all reporting and analytics

#### Admin Role Rules
- **Permissions**: User and card management within scope
- **Restrictions**:
  - Cannot manage Owner or Super Admin accounts
  - Cannot create Admin accounts
  - Cannot access system-wide settings
- **Capabilities**:
  - Create and manage User and Analyst accounts
  - Create and manage cards for any user
  - Manage spending profiles
  - View transactions for managed users

#### User Role Rules
- **Permissions**: Self-service operations only
- **Restrictions**:
  - Can only view/modify own profile
  - Can only view own cards and transactions
  - Cannot create other users
  - Cannot manage spending profiles
- **Capabilities**:
  - View own account details
  - View own cards and their limits
  - View own transaction history
  - Request card status changes (requires admin approval)

#### Analyst Role Rules
- **Permissions**: Read-only access for analysis
- **Restrictions**:
  - Cannot create, modify, or delete any records
  - Cannot perform any write operations
  - Cannot access user management functions
- **Capabilities**:
  - View all transactions (anonymized sensitive data)
  - Generate reports and analytics
  - Export transaction data for analysis
  - View spending patterns and trends

## Account Management Rules

### Account Creation Rules
1. **User-Account Relationship**
   - Every user must have at least one account
   - Users can have multiple accounts
   - Each account must have exactly one primary owner
   - Account names must be unique per user

2. **Account Types**
   - **Personal**: For individual users, single owner
   - **Business**: For business users, can have multiple authorized users
   - Account type cannot be changed after creation

3. **Account Lifecycle**
   - New accounts start with zero balance
   - Accounts with active cards cannot be deleted
   - Accounts with transaction history cannot be deleted
   - Inactive accounts (no cards, no transactions for 90 days) can be archived

### Funding Rules
1. **Funding Sources**
   - ACH transfers (primary method)
   - Wire transfers (for large amounts)
   - Check deposits (manual processing)

2. **Funding Limits**
   - Daily ACH limit: $10,000 per account
   - Monthly ACH limit: $50,000 per account
   - Wire transfer minimum: $1,000
   - No maximum for wire transfers

3. **Funding Validation**
   - All funding sources must be verified
   - External bank accounts require micro-deposit verification
   - Business accounts require additional documentation

## Card Management Rules

### Card Creation Rules
1. **Prerequisites**
   - User must have role of "user" or higher
   - User must have at least one active account
   - Account must have sufficient balance for card type
   - User must pass basic identity verification

2. **Card Types & Limits**
   - **Debit Cards**: Linked to account balance, cannot exceed available funds
   - **Credit Cards**: Pre-approved credit limit, requires credit check
   - **Prepaid Cards**: Fixed amount loaded, no credit check required

3. **Card Subtypes**
   - **Virtual**: Instant issuance, online/mobile use only
   - **Physical**: 5-7 business days delivery, full merchant acceptance

### Card Lifecycle Rules
1. **Status Transitions**
   ```
   Created → Active → Locked/Unlocked → Cancelled
                  ↓
                Expired
   ```

2. **Status Change Permissions**
   - **User**: Can lock/unlock own cards
   - **Admin**: Can change any card status
   - **System**: Auto-expires cards based on expiry date

3. **Card Limits Management**
   - Cards can have spending profile OR custom limits, never both
   - Changing from profile to custom limits removes card from profile
   - Changing from custom to profile overwrites custom limits
   - Limit changes take effect immediately

### Spending Control Rules
1. **Limit Hierarchy**
   - Per-transaction limit ≤ Daily limit ≤ Monthly limit
   - System enforces these relationships at all times
   - Violations prevent limit updates

2. **Limit Enforcement**
   - Limits checked in real-time during authorization
   - Declined transactions don't count against limits
   - Limits reset at midnight UTC (daily) and 1st of month (monthly)

3. **Merchant Category Controls**
   - Allowed categories: transactions only in specified MCCs
   - Blocked categories: transactions blocked for specified MCCs
   - If both specified: allowed list takes precedence

## Spending Profile Rules

### Profile Management Rules
1. **Profile Creation**
   - Only Admin level and above can create profiles
   - Profile names must be unique system-wide
   - At least one limit type must be specified
   - Limit hierarchy must be maintained

2. **Profile Assignment**
   - Cards can be assigned to exactly one profile
   - Assigning to profile removes any custom limits
   - Profile changes affect all assigned cards immediately
   - Cards removed from profile retain last applied limits as custom limits

3. **Profile Modification**
   - Changes to profile limits affect all assigned cards
   - Cards cannot be individually exempted from profile changes
   - Profile changes are logged and auditable
   - Historical profile settings are preserved for reporting

4. **Profile Deletion**
   - Profiles with assigned cards cannot be deleted
   - Must remove all cards from profile before deletion
   - Deleted profiles are soft-deleted (marked inactive)
   - Profile deletion requires confirmation

### Profile-Card Interaction Rules
1. **Assignment Logic**
   ```
   Card + Profile Assignment:
   1. Remove existing custom limits
   2. Clear existing auth rules in Lithic
   3. Apply profile's auth rule to card
   4. Update local database relationship
   ```

2. **Custom Limits Logic**
   ```
   Card + Custom Limits:
   1. Remove from any assigned profile
   2. Create individual auth rule in Lithic
   3. Apply custom limits to auth rule
   4. Update local database with custom values
   ```

## Transaction Rules

### Transaction Processing Rules
1. **Authorization Flow**
   - All transactions require real-time authorization
   - Spending limits checked before approval
   - Merchant category restrictions enforced
   - Account balance verified for debit cards

2. **Transaction States**
   - **Pending**: Authorization approved, awaiting settlement
   - **Settled**: Funds transferred, transaction complete
   - **Declined**: Authorization denied
   - **Expired**: Pending transaction timed out

3. **Settlement Rules**
   - Authorizations expire after 7 days if not settled
   - Settled amounts may differ from authorized amounts
   - Partial settlements are allowed
   - Multiple settlements per authorization are allowed

### Transaction Limits & Controls
1. **Velocity Controls**
   - Maximum 10 transactions per minute per card
   - Maximum 100 transactions per day per card
   - Unusual patterns trigger fraud alerts

2. **Amount Limits**
   - Per-transaction limits enforced at authorization
   - Daily/monthly limits tracked across all transactions
   - Limits include both settled and pending transactions

3. **Geographic Controls**
   - Domestic transactions allowed by default
   - International transactions require explicit enabling
   - High-risk countries blocked by default

## Data Integrity Rules

### Referential Integrity
1. **User Dependencies**
   - Users cannot be deleted if they have accounts
   - Accounts cannot be deleted if they have cards
   - Cards cannot be deleted if they have transactions

2. **Cascade Behavior**
   - User deactivation deactivates all associated accounts
   - Account closure cancels all associated cards
   - Card cancellation doesn't delete transaction history

### Data Consistency Rules
1. **Balance Consistency**
   - Account balances must match sum of all transactions
   - Daily reconciliation process validates balances
   - Discrepancies trigger alerts and investigation

2. **Limit Consistency**
   - Card limits must respect hierarchy rules
   - Profile changes must propagate to all assigned cards
   - Lithic auth rules must match local database settings

## Audit & Compliance Rules

### Audit Logging Rules
1. **Required Audit Events**
   - All user account changes
   - All card status changes
   - All spending limit modifications
   - All transaction approvals/declines
   - All login attempts (successful and failed)

2. **Audit Data Retention**
   - Audit logs retained for minimum 7 years
   - Logs are immutable once created
   - Log access restricted to Owner and Super Admin roles

3. **Audit Trail Requirements**
   - Every change must include user ID, timestamp, old/new values
   - System changes must be clearly identified
   - IP address and user agent logged for all actions

### Compliance Rules
1. **PCI DSS Compliance**
   - No sensitive card data stored locally
   - All card references use Lithic tokens
   - Encryption required for all sensitive data at rest

2. **Data Privacy**
   - User data access logged and monitored
   - Data export requires explicit approval
   - Personal data can be anonymized for analytics

## Error Handling Rules

### Validation Rules
1. **Input Validation**
   - All inputs validated at API boundary
   - SQL injection prevention required
   - XSS prevention for all text inputs
   - File upload restrictions enforced

2. **Business Logic Validation**
   - Role-based permission checks before all operations
   - Data consistency checks before database updates
   - External API response validation

### Error Response Rules
1. **Error Information**
   - Errors include clear, actionable messages
   - Sensitive information not exposed in error messages
   - Error codes provided for programmatic handling

2. **Error Logging**
   - All errors logged with full context
   - Critical errors trigger immediate alerts
   - Error patterns monitored for system health

## Performance Rules

### Response Time Requirements
1. **API Response Times**
   - Authentication: < 500ms
   - Card operations: < 1000ms
   - Transaction queries: < 2000ms
   - Reporting: < 5000ms

2. **Database Performance**
   - Query optimization required for all operations
   - Indexes maintained for all foreign keys
   - Pagination required for large result sets

### Scalability Rules
1. **Concurrent Operations**
   - System must handle 100 concurrent users
   - Database connections properly pooled
   - Rate limiting prevents abuse

2. **Data Growth**
   - Transaction data partitioned by date
   - Old data archived after 2 years
   - Database maintenance scheduled during off-hours

## Integration Rules

### Lithic API Integration
1. **API Usage Rules**
   - All Lithic operations must have local database backup
   - Failed Lithic operations must be retried with exponential backoff
   - Lithic rate limits must be respected

2. **Data Synchronization**
   - Local data is source of truth for business logic
   - Lithic data is source of truth for card/transaction states
   - Conflicts resolved in favor of Lithic data

3. **Webhook Processing**
   - All webhooks must be processed idempotently
   - Webhook failures must be retried
   - Webhook processing must be asynchronous

These business rules ensure the system operates consistently, securely, and in compliance with financial regulations while providing a robust foundation for the Lithic POC implementation.
