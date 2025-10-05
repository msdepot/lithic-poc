module.exports = (sequelize, DataTypes) => {
  const SpendingProfile = sequelize.define('SpendingProfile', {
    spending_profile_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profile_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    daily_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    monthly_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    per_transaction_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    allowed_merchant_categories: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    blocked_merchant_categories: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lithic_auth_rule_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'spending_profiles',
    timestamps: true,
    indexes: [
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['profile_name']
      },
      {
        unique: true,
        fields: ['lithic_auth_rule_token']
      }
    ],
    validate: {
      dailyLessThanMonthly() {
        if (this.daily_limit && this.monthly_limit && 
            parseFloat(this.daily_limit) > parseFloat(this.monthly_limit)) {
          throw new Error('Daily limit cannot exceed monthly limit');
        }
      },
      perTransactionLessThanDaily() {
        if (this.per_transaction_limit && this.daily_limit && 
            parseFloat(this.per_transaction_limit) > parseFloat(this.daily_limit)) {
          throw new Error('Per-transaction limit cannot exceed daily limit');
        }
      },
      atLeastOneLimit() {
        if (!this.daily_limit && !this.monthly_limit && !this.per_transaction_limit) {
          throw new Error('At least one spending limit must be specified');
        }
      }
    }
  });

  SpendingProfile.associate = (models) => {
    SpendingProfile.hasMany(models.Card, {
      foreignKey: 'spending_profile_id',
      as: 'cards'
    });
  };

  // Instance methods
  SpendingProfile.prototype.hasAttachedCards = async function() {
    const models = require('./index');
    const cardCount = await models.Card.count({
      where: {
        spending_profile_id: this.spending_profile_id
      }
    });
    return cardCount > 0;
  };

  SpendingProfile.prototype.getAttachedCards = async function() {
    const models = require('./index');
    return await models.Card.findAll({
      where: {
        spending_profile_id: this.spending_profile_id
      },
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['user_id', 'username', 'first_name', 'last_name']
        },
        {
          model: models.Account,
          as: 'account',
          attributes: ['account_id', 'account_name']
        }
      ]
    });
  };

  SpendingProfile.prototype.toAuthRuleFormat = function() {
    const authRule = {
      parameters: {
        conditions: {}
      }
    };

    // Add spending limits
    if (this.daily_limit || this.monthly_limit || this.per_transaction_limit) {
      authRule.parameters.conditions.spend_limit = {};
      
      if (this.daily_limit) {
        authRule.parameters.conditions.spend_limit.daily = Math.round(parseFloat(this.daily_limit) * 100);
      }
      
      if (this.monthly_limit) {
        authRule.parameters.conditions.spend_limit.monthly = Math.round(parseFloat(this.monthly_limit) * 100);
      }
      
      if (this.per_transaction_limit) {
        authRule.parameters.conditions.spend_limit.per_authorization = Math.round(parseFloat(this.per_transaction_limit) * 100);
      }
    }

    // Add merchant category controls
    if (this.allowed_merchant_categories && this.allowed_merchant_categories.length > 0) {
      authRule.parameters.conditions.allowed_mcc = this.allowed_merchant_categories;
    }

    if (this.blocked_merchant_categories && this.blocked_merchant_categories.length > 0) {
      authRule.parameters.conditions.blocked_mcc = this.blocked_merchant_categories;
    }

    return authRule;
  };

  return SpendingProfile;
};
