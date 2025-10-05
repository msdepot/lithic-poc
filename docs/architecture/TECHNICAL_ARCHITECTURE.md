# Lithic POC - Technical Architecture & Implementation Guide

## System Overview

This document outlines the technical architecture for the Lithic Payment Card Management POC, detailing the integration between local business logic and Lithic's sandbox API.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Postman/UI    │◄──►│   Node.js API   │◄──►│   Lithic API    │
│   (Frontend)    │    │   (Backend)     │    │   (Sandbox)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │                 │
                       │  MySQL Database │
                       │   (localhost)   │
                       │                 │
                       └─────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Prisma or Sequelize
- **Authentication**: JWT with bcrypt
- **API Client**: Lithic Node.js SDK
- **Validation**: Joi or Yup
- **Logging**: Winston
- **Testing**: Jest + Supertest

### Database
- **Host**: localhost
- **User**: root
- **Password**: (empty)
- **Database**: lithic_poc

### External Services
- **Lithic API**: Sandbox environment
- **API Key**: `595234f1-968e-4fad-b308-41f6e19bc93f`

## Project Structure

```
lithic-poc/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── accountController.js
│   │   ├── cardController.js
│   │   ├── spendingProfileController.js
│   │   ├── transactionController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── validation.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Card.js
│   │   ├── SpendingProfile.js
│   │   ├── Transaction.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── accounts.js
│   │   ├── cards.js
│   │   ├── spendingProfiles.js
│   │   ├── transactions.js
│   │   └── reports.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── lithicService.js
│   │   ├── spendingProfileService.js
│   │   ├── notificationService.js
│   │   └── syncService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   ├── lithic.js
│   │   └── jwt.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/
│   ├── setup-db.js
│   └── seed-data.js
├── package.json
├── .env.example
└── README.md
```

## Core Components

### 1. Authentication & Authorization

#### JWT Implementation
```javascript
// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  refreshExpiresIn: '7d',
  algorithm: 'HS256'
};

// Token Structure
{
  user_id: number,
  username: string,
  role: string,
  permissions: string[],
  iat: number,
  exp: number
}
```

#### RBAC Middleware
```javascript
const rbacMiddleware = (requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = getRolePermissions(userRole);
    
    const hasPermission = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

### 2. Lithic Integration Service

#### Service Architecture
```javascript
class LithicService {
  constructor() {
    this.client = new Lithic({
      apiKey: process.env.LITHIC_API_KEY,
      environment: 'sandbox'
    });
  }

  async createAccountHolder(userData) {
    // Transform local user data to Lithic format
    const lithicData = this.transformUserToAccountHolder(userData);
    const response = await this.client.accountHolders.create(lithicData);
    return response;
  }

  async createCard(cardData) {
    const lithicCardData = this.transformCardData(cardData);
    const response = await this.client.cards.create(lithicCardData);
    return response;
  }

  async createAuthRule(spendingProfile, cardTokens) {
    const authRuleData = {
      account_tokens: [],
      card_tokens: cardTokens,
      program_level: false,
      parameters: {
        conditions: {
          spend_limit: {
            daily: spendingProfile.daily_limit * 100, // Convert to cents
            monthly: spendingProfile.monthly_limit * 100
          }
        }
      }
    };
    
    return await this.client.authRules.create(authRuleData);
  }
}
```

### 3. Spending Profile Management

#### Custom Implementation Logic
```javascript
class SpendingProfileService {
  async createProfile(profileData) {
    // 1. Create profile in local database
    const profile = await SpendingProfile.create(profileData);
    
    // 2. Create corresponding Lithic auth rule template
    const authRule = await this.lithicService.createAuthRule(profile, []);
    
    // 3. Store Lithic auth rule token
    await profile.update({
      lithic_auth_rule_token: authRule.token
    });
    
    return profile;
  }

  async assignCardToProfile(cardId, profileId) {
    const transaction = await db.transaction();
    
    try {
      // 1. Get card and profile
      const card = await Card.findByPk(cardId);
      const profile = await SpendingProfile.findByPk(profileId);
      
      // 2. Remove any existing custom auth rules
      if (card.lithic_auth_rule_token) {
        await this.lithicService.removeAuthRule(card.lithic_auth_rule_token);
      }
      
      // 3. Apply profile's auth rule to card
      await this.lithicService.applyAuthRuleToCard(
        profile.lithic_auth_rule_token,
        card.lithic_card_token
      );
      
      // 4. Update local database
      await card.update({
        spending_profile_id: profileId,
        custom_daily_limit: null,
        custom_monthly_limit: null,
        custom_per_transaction_limit: null,
        lithic_auth_rule_token: null
      });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateProfile(profileId, updates) {
    const transaction = await db.transaction();
    
    try {
      // 1. Update local profile
      const profile = await SpendingProfile.findByPk(profileId);
      await profile.update(updates);
      
      // 2. Update Lithic auth rule
      await this.lithicService.updateAuthRule(
        profile.lithic_auth_rule_token,
        this.transformProfileToAuthRule(profile)
      );
      
      // 3. This automatically affects all cards using this profile
      await transaction.commit();
      
      return profile;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

### 4. Data Synchronization

#### Webhook Handler
```javascript
class WebhookHandler {
  async handleLithicWebhook(req, res) {
    const { event_type, data } = req.body;
    
    try {
      switch (event_type) {
        case 'card_transaction.updated':
          await this.syncTransaction(data);
          break;
        case 'card.created':
          await this.syncCard(data);
          break;
        case 'account_holder.updated':
          await this.syncAccountHolder(data);
          break;
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }

  async syncTransaction(transactionData) {
    const existingTransaction = await Transaction.findOne({
      where: { lithic_transaction_token: transactionData.token }
    });

    if (existingTransaction) {
      await existingTransaction.update({
        status: transactionData.status,
        settled_date: transactionData.settled_date,
        lithic_raw_data: transactionData
      });
    } else {
      // Find associated card
      const card = await Card.findOne({
        where: { lithic_card_token: transactionData.card_token }
      });

      if (card) {
        await Transaction.create({
          card_id: card.card_id,
          lithic_transaction_token: transactionData.token,
          amount: transactionData.amount / 100, // Convert from cents
          currency: transactionData.currency,
          merchant_name: transactionData.merchant.descriptor,
          transaction_type: transactionData.type,
          status: transactionData.status,
          transaction_date: transactionData.created,
          lithic_raw_data: transactionData
        });
      }
    }
  }
}
```

### 5. Error Handling & Validation

#### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.user_id
  });

  // Lithic API errors
  if (err.name === 'LithicError') {
    return res.status(err.status || 500).json({
      error: {
        code: 'LITHIC_API_ERROR',
        message: err.message,
        details: err.body
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input provided',
        details: err.details
      }
    });
  }

  // Database errors
  if (err.name === 'SequelizeError') {
    return res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed'
      }
    });
  }

  // Default error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

#### Request Validation
```javascript
const validateCreateCard = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  account_id: Joi.number().integer().positive().required(),
  card_type: Joi.string().valid('debit', 'credit', 'prepaid').required(),
  card_subtype: Joi.string().valid('virtual', 'physical').default('virtual'),
  spending_profile_id: Joi.number().integer().positive().optional(),
  custom_limits: Joi.object({
    daily_limit: Joi.number().positive().optional(),
    monthly_limit: Joi.number().positive().optional(),
    per_transaction_limit: Joi.number().positive().optional()
  }).optional(),
  memo: Joi.string().max(500).optional()
}).xor('spending_profile_id', 'custom_limits'); // Either profile OR custom limits
```

## Security Considerations

### 1. API Security
- JWT tokens with short expiration
- Refresh token rotation
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### 2. Data Protection
- Sensitive data encryption at rest
- No PCI data storage locally
- Lithic tokens used for card references
- Audit logging for all operations
- Secure API key management

### 3. Access Control
- Role-based permissions
- Resource-level authorization
- User session management
- Failed login attempt tracking

## Performance Optimizations

### 1. Database
- Proper indexing strategy
- Connection pooling
- Query optimization
- Pagination for large datasets

### 2. API
- Response caching where appropriate
- Async/await for non-blocking operations
- Batch operations for bulk updates
- Connection reuse for Lithic API calls

### 3. Monitoring
- Response time tracking
- Error rate monitoring
- Database performance metrics
- Lithic API rate limit monitoring

## Deployment Strategy

### 1. Environment Setup
```bash
# Development
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=lithic_poc
LITHIC_API_KEY=595234f1-968e-4fad-b308-41f6e19bc93f
LITHIC_ENVIRONMENT=sandbox
JWT_SECRET=your-secret-key
```

### 2. Database Migration
```javascript
// Migration script
const setupDatabase = async () => {
  // 1. Create database if not exists
  await createDatabase('lithic_poc');
  
  // 2. Run schema creation
  await runSQLFile('./DATABASE_SCHEMA.sql');
  
  // 3. Seed initial data
  await seedInitialData();
  
  // 4. Verify setup
  await verifyDatabaseSetup();
};
```

### 3. Health Checks
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      lithic_api: await checkLithicAPI(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(
    check => check.status === 'healthy'
  );
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## Testing Strategy

### 1. Unit Tests
- Service layer logic
- Utility functions
- Validation schemas
- Error handling

### 2. Integration Tests
- Database operations
- Lithic API integration
- Authentication flows
- RBAC enforcement

### 3. End-to-End Tests
- Complete user journeys
- Card lifecycle management
- Spending profile operations
- Transaction synchronization

## Monitoring & Logging

### 1. Application Logs
```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Metrics Collection
- Request/response times
- Error rates by endpoint
- Database query performance
- Lithic API response times
- User activity patterns

### 3. Alerting
- High error rates
- Database connection issues
- Lithic API failures
- Unusual spending patterns
- Security incidents

This technical architecture provides a solid foundation for building a scalable, secure, and maintainable Lithic POC that integrates seamlessly with both local business logic and external payment services.
