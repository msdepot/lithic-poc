module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    account_id: {
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
    account_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    account_type: {
      type: DataTypes.ENUM('personal', 'business'),
      defaultValue: 'personal'
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
        isUppercase: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lithic_financial_account_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'accounts',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['lithic_financial_account_token']
      },
      {
        unique: true,
        fields: ['user_id', 'account_name']
      }
    ]
  });

  Account.associate = (models) => {
    Account.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Account.hasMany(models.Card, {
      foreignKey: 'account_id',
      as: 'cards'
    });
  };

  // Instance methods
  Account.prototype.addFunds = async function(amount) {
    this.balance = parseFloat(this.balance) + parseFloat(amount);
    await this.save();
    return this.balance;
  };

  Account.prototype.deductFunds = async function(amount) {
    const newBalance = parseFloat(this.balance) - parseFloat(amount);
    if (newBalance < 0) {
      throw new Error('Insufficient funds');
    }
    this.balance = newBalance;
    await this.save();
    return this.balance;
  };

  Account.prototype.hasActiveCards = async function() {
    const models = require('./index');
    const activeCards = await models.Card.count({
      where: {
        account_id: this.account_id,
        status: ['active', 'locked']
      }
    });
    return activeCards > 0;
  };

  return Account;
};
