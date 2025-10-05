module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'account_id'
      }
    },
    spending_profile_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'spending_profiles',
        key: 'spending_profile_id'
      }
    },
    card_type: {
      type: DataTypes.ENUM('debit', 'credit', 'prepaid'),
      allowNull: false
    },
    card_subtype: {
      type: DataTypes.ENUM('virtual', 'physical'),
      defaultValue: 'virtual'
    },
    status: {
      type: DataTypes.ENUM('active', 'locked', 'cancelled', 'expired'),
      defaultValue: 'active'
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    custom_daily_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    custom_monthly_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    custom_per_transaction_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    lithic_card_token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    lithic_auth_rule_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'cards',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['account_id']
      },
      {
        fields: ['spending_profile_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['card_type']
      },
      {
        unique: true,
        fields: ['lithic_card_token']
      }
    ],
    validate: {
      profileOrCustomLimits() {
        const hasProfile = this.spending_profile_id !== null;
        const hasCustomLimits = this.custom_daily_limit !== null || 
                               this.custom_monthly_limit !== null || 
                               this.custom_per_transaction_limit !== null;
        
        // Cards can have either a profile OR custom limits, but not both
        if (hasProfile && hasCustomLimits) {
          throw new Error('Card cannot have both spending profile and custom limits');
        }
      },
      customLimitHierarchy() {
        if (this.custom_daily_limit && this.custom_monthly_limit && 
            parseFloat(this.custom_daily_limit) > parseFloat(this.custom_monthly_limit)) {
          throw new Error('Custom daily limit cannot exceed monthly limit');
        }
        
        if (this.custom_per_transaction_limit && this.custom_daily_limit && 
            parseFloat(this.custom_per_transaction_limit) > parseFloat(this.custom_daily_limit)) {
          throw new Error('Custom per-transaction limit cannot exceed daily limit');
        }
      }
    }
  });

  Card.associate = (models) => {
    Card.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Card.belongsTo(models.Account, {
      foreignKey: 'account_id',
      as: 'account'
    });

    Card.belongsTo(models.SpendingProfile, {
      foreignKey: 'spending_profile_id',
      as: 'spending_profile'
    });

    Card.hasMany(models.Transaction, {
      foreignKey: 'card_id',
      as: 'transactions'
    });
  };

  // Instance methods
  Card.prototype.getEffectiveLimits = async function() {
    if (this.spending_profile_id) {
      const models = require('./index');
      const profile = await models.SpendingProfile.findByPk(this.spending_profile_id);
      if (profile) {
        return {
          daily_limit: profile.daily_limit,
          monthly_limit: profile.monthly_limit,
          per_transaction_limit: profile.per_transaction_limit,
          source: 'profile',
          profile_name: profile.profile_name
        };
      }
    }
    
    return {
      daily_limit: this.custom_daily_limit,
      monthly_limit: this.custom_monthly_limit,
      per_transaction_limit: this.custom_per_transaction_limit,
      source: 'custom'
    };
  };

  Card.prototype.assignToProfile = async function(profileId, transaction) {
    // Clear custom limits and assign to profile
    this.spending_profile_id = profileId;
    this.custom_daily_limit = null;
    this.custom_monthly_limit = null;
    this.custom_per_transaction_limit = null;
    this.lithic_auth_rule_token = null;
    
    if (transaction) {
      await this.save({ transaction });
    } else {
      await this.save();
    }
    
    return this;
  };

  Card.prototype.setCustomLimits = async function(limits, transaction) {
    // Remove from profile and set custom limits
    this.spending_profile_id = null;
    this.custom_daily_limit = limits.daily_limit || null;
    this.custom_monthly_limit = limits.monthly_limit || null;
    this.custom_per_transaction_limit = limits.per_transaction_limit || null;
    
    if (transaction) {
      await this.save({ transaction });
    } else {
      await this.save();
    }
    
    return this;
  };

  Card.prototype.updateStatus = async function(newStatus, reason = null) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (reason) {
      this.memo = this.memo ? `${this.memo}\n${reason}` : reason;
    }
    
    await this.save();
    
    return {
      old_status: oldStatus,
      new_status: newStatus,
      reason
    };
  };

  Card.prototype.hasTransactions = async function() {
    const models = require('./index');
    const transactionCount = await models.Transaction.count({
      where: {
        card_id: this.card_id
      }
    });
    return transactionCount > 0;
  };

  Card.prototype.toCustomAuthRule = function() {
    if (!this.custom_daily_limit && !this.custom_monthly_limit && !this.custom_per_transaction_limit) {
      return null;
    }

    const authRule = {
      account_tokens: [],
      card_tokens: [this.lithic_card_token],
      program_level: false,
      parameters: {
        conditions: {
          spend_limit: {}
        }
      }
    };

    if (this.custom_daily_limit) {
      authRule.parameters.conditions.spend_limit.daily = Math.round(parseFloat(this.custom_daily_limit) * 100);
    }
    
    if (this.custom_monthly_limit) {
      authRule.parameters.conditions.spend_limit.monthly = Math.round(parseFloat(this.custom_monthly_limit) * 100);
    }
    
    if (this.custom_per_transaction_limit) {
      authRule.parameters.conditions.spend_limit.per_authorization = Math.round(parseFloat(this.custom_per_transaction_limit) * 100);
    }

    return authRule;
  };

  return Card;
};
