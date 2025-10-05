const Joi = require('joi');
const { apiLogger } = require('../utils/logger');

// Common validation schemas
const commonSchemas = {
  id: Joi.number().integer().positive(),
  email: Joi.string().email().max(100),
  username: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(50),
  password: Joi.string().min(8).max(128).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  ).messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).max(20),
  name: Joi.string().max(100),
  currency: Joi.string().length(3).uppercase(),
  amount: Joi.number().positive().precision(2),
  date: Joi.date().iso(),
  role: Joi.string().valid('owner', 'super_admin', 'admin', 'user', 'analyst')
};

// User validation schemas
const userSchemas = {
  create: Joi.object({
    username: commonSchemas.username.required(),
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    role: commonSchemas.role.required(),
    first_name: commonSchemas.name.optional(),
    last_name: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional()
  }),

  update: Joi.object({
    email: commonSchemas.email.optional(),
    first_name: commonSchemas.name.optional(),
    last_name: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    role: commonSchemas.role.optional(),
    is_active: Joi.boolean().optional()
  }).min(1),

  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: commonSchemas.password.required()
  }),

  refreshToken: Joi.object({
    refresh_token: Joi.string().required()
  })
};

// Account validation schemas
const accountSchemas = {
  create: Joi.object({
    account_name: Joi.string().max(100).required(),
    user_id: commonSchemas.id.required(),
    account_type: Joi.string().valid('personal', 'business').default('personal'),
    initial_balance: commonSchemas.amount.default(0)
  }),

  update: Joi.object({
    account_name: Joi.string().max(100).optional(),
    account_type: Joi.string().valid('personal', 'business').optional()
  }).min(1),

  addFunds: Joi.object({
    amount: commonSchemas.amount.required(),
    funding_source: Joi.string().valid('ach', 'wire', 'check').required(),
    description: Joi.string().max(500).optional()
  })
};

// Card validation schemas
const cardSchemas = {
  create: Joi.object({
    user_id: commonSchemas.id.required(),
    account_id: commonSchemas.id.required(),
    card_type: Joi.string().valid('debit', 'credit', 'prepaid').required(),
    card_subtype: Joi.string().valid('virtual', 'physical').default('virtual'),
    spending_profile_id: commonSchemas.id.optional(),
    custom_limits: Joi.object({
      daily_limit: commonSchemas.amount.optional(),
      monthly_limit: commonSchemas.amount.optional(),
      per_transaction_limit: commonSchemas.amount.optional()
    }).optional(),
    memo: Joi.string().max(500).optional(),
    shipping_address: Joi.object({
      address1: Joi.string().max(200).required(),
      address2: Joi.string().max(200).optional(),
      city: Joi.string().max(100).required(),
      state: Joi.string().max(2).required(),
      postal_code: Joi.string().max(10).required(),
      country: Joi.string().length(3).uppercase().required(),
      first_name: Joi.string().max(100).optional(),
      last_name: Joi.string().max(100).optional()
    }).optional(),
    shipping_method: Joi.string().valid('STANDARD','STANDARD_WITH_TRACKING','PRIORITY','EXPRESS','2_DAY','EXPEDITED').optional(),
    product_id: Joi.string().max(100).optional(),
    pin: Joi.string().base64().optional()
  }).xor('spending_profile_id', 'custom_limits'), // Either profile OR custom limits

  update: Joi.object({
    spending_profile_id: commonSchemas.id.allow(null).optional(),
    custom_limits: Joi.object({
      daily_limit: commonSchemas.amount.allow(null).optional(),
      monthly_limit: commonSchemas.amount.allow(null).optional(),
      per_transaction_limit: commonSchemas.amount.allow(null).optional()
    }).optional(),
    memo: Joi.string().max(500).optional()
  }).min(1),

  updateStatus: Joi.object({
    status: Joi.string().valid('active', 'locked', 'cancelled').required(),
    reason: Joi.string().max(500).optional()
  })
};

// Spending Profile validation schemas
const spendingProfileSchemas = {
  create: Joi.object({
    profile_name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
    daily_limit: commonSchemas.amount.optional(),
    monthly_limit: commonSchemas.amount.optional(),
    per_transaction_limit: commonSchemas.amount.optional(),
    allowed_merchant_categories: Joi.array().items(Joi.string()).optional(),
    blocked_merchant_categories: Joi.array().items(Joi.string()).optional()
  }).custom((value, helpers) => {
    // At least one limit must be specified
    if (!value.daily_limit && !value.monthly_limit && !value.per_transaction_limit) {
      return helpers.error('custom.atLeastOneLimit');
    }

    // Validate limit hierarchy
    if (value.daily_limit && value.monthly_limit && value.daily_limit > value.monthly_limit) {
      return helpers.error('custom.dailyExceedsMonthly');
    }

    if (value.per_transaction_limit && value.daily_limit && value.per_transaction_limit > value.daily_limit) {
      return helpers.error('custom.perTransactionExceedsDaily');
    }

    return value;
  }, 'Spending profile validation').messages({
    'custom.atLeastOneLimit': 'At least one spending limit must be specified',
    'custom.dailyExceedsMonthly': 'Daily limit cannot exceed monthly limit',
    'custom.perTransactionExceedsDaily': 'Per-transaction limit cannot exceed daily limit'
  }),

  update: Joi.object({
    profile_name: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    daily_limit: commonSchemas.amount.allow(null).optional(),
    monthly_limit: commonSchemas.amount.allow(null).optional(),
    per_transaction_limit: commonSchemas.amount.allow(null).optional(),
    allowed_merchant_categories: Joi.array().items(Joi.string()).optional(),
    blocked_merchant_categories: Joi.array().items(Joi.string()).optional()
  }).min(1).custom((value, helpers) => {
    // Validate limit hierarchy if limits are being updated
    if (value.daily_limit && value.monthly_limit && value.daily_limit > value.monthly_limit) {
      return helpers.error('custom.dailyExceedsMonthly');
    }

    if (value.per_transaction_limit && value.daily_limit && value.per_transaction_limit > value.daily_limit) {
      return helpers.error('custom.perTransactionExceedsDaily');
    }

    return value;
  }, 'Spending profile update validation').messages({
    'custom.dailyExceedsMonthly': 'Daily limit cannot exceed monthly limit',
    'custom.perTransactionExceedsDaily': 'Per-transaction limit cannot exceed daily limit'
  })
};

// Query parameter validation schemas
const querySchemas = {
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(50),
    offset: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).optional()
  }),

  dateRange: Joi.object({
    start_date: commonSchemas.date.optional(),
    end_date: commonSchemas.date.optional()
  }).custom((value, helpers) => {
    if (value.start_date && value.end_date && value.start_date > value.end_date) {
      return helpers.error('custom.invalidDateRange');
    }
    return value;
  }, 'Date range validation').messages({
    'custom.invalidDateRange': 'Start date must be before end date'
  }),

  userFilters: Joi.object({
    role: commonSchemas.role.optional(),
    is_active: Joi.boolean().optional(),
    search: Joi.string().max(100).optional()
  }),

  cardFilters: Joi.object({
    user_id: commonSchemas.id.optional(),
    account_id: commonSchemas.id.optional(),
    card_type: Joi.string().valid('debit', 'credit', 'prepaid').optional(),
    status: Joi.string().valid('active', 'locked', 'cancelled', 'expired').optional()
  }),

  transactionFilters: Joi.object({
    card_id: commonSchemas.id.optional(),
    user_id: commonSchemas.id.optional(),
    account_id: commonSchemas.id.optional(),
    status: Joi.string().valid('pending', 'settled', 'declined', 'expired').optional(),
    transaction_type: Joi.string().valid('authorization', 'clearing', 'return', 'void').optional(),
    min_amount: commonSchemas.amount.optional(),
    max_amount: commonSchemas.amount.optional()
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        apiLogger.warn('Validation failed', {
          endpoint: req.path,
          method: req.method,
          errors: validationErrors,
          userId: req.user?.user_id
        });

        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input provided',
            details: validationErrors
          }
        });
      }

      // Replace the original data with validated and sanitized data
      switch (source) {
        case 'body':
          req.body = value;
          break;
        case 'query':
          req.query = value;
          break;
        case 'params':
          req.params = value;
          break;
      }

      next();
    } catch (err) {
      apiLogger.error('Validation middleware error', {
        error: err.message,
        stack: err.stack,
        endpoint: req.path
      });

      return res.status(500).json({
        error: {
          code: 'VALIDATION_MIDDLEWARE_ERROR',
          message: 'Validation processing failed'
        }
      });
    }
  };
};

// Combine multiple validations
const validateAll = (...validations) => {
  return (req, res, next) => {
    const runValidation = (index) => {
      if (index >= validations.length) {
        return next();
      }

      validations[index](req, res, (err) => {
        if (err) {
          return next(err);
        }
        runValidation(index + 1);
      });
    };

    runValidation(0);
  };
};

// Validate ID parameter
const validateId = (paramName = 'id') => {
  return validate(Joi.object({
    [paramName]: commonSchemas.id.required()
  }), 'params');
};

module.exports = {
  validate,
  validateAll,
  validateId,
  userSchemas,
  accountSchemas,
  cardSchemas,
  spendingProfileSchemas,
  querySchemas,
  commonSchemas
};
