module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cards',
        key: 'card_id'
      }
    },
    lithic_transaction_token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
        isUppercase: true
      }
    },
    merchant_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    merchant_category_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    transaction_type: {
      type: DataTypes.ENUM('authorization', 'clearing', 'return', 'void'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'settled', 'declined', 'expired'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    settled_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    merchant_city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    merchant_state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    merchant_country: {
      type: DataTypes.STRING(3),
      allowNull: true,
      validate: {
        len: [2, 3],
        isUppercase: true
      }
    },
    lithic_raw_data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        fields: ['card_id']
      },
      {
        fields: ['transaction_date']
      },
      {
        fields: ['status']
      },
      {
        fields: ['transaction_type']
      },
      {
        fields: ['merchant_name']
      },
      {
        fields: ['amount']
      },
      {
        unique: true,
        fields: ['lithic_transaction_token']
      },
      {
        fields: ['card_id', 'transaction_date']
      }
    ]
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Card, {
      foreignKey: 'card_id',
      as: 'card'
    });
  };

  // Instance methods
  Transaction.prototype.isSettled = function() {
    return this.status === 'settled';
  };

  Transaction.prototype.isPending = function() {
    return this.status === 'pending';
  };

  Transaction.prototype.isDeclined = function() {
    return this.status === 'declined';
  };

  Transaction.prototype.getFormattedAmount = function() {
    return `${this.currency} ${parseFloat(this.amount).toFixed(2)}`;
  };

  Transaction.prototype.getDaysToSettle = function() {
    if (!this.settled_date || !this.transaction_date) {
      return null;
    }
    
    const diffTime = Math.abs(new Date(this.settled_date) - new Date(this.transaction_date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Class methods
  Transaction.getTransactionsByDateRange = async function(cardId, startDate, endDate) {
    return await this.findAll({
      where: {
        card_id: cardId,
        transaction_date: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      order: [['transaction_date', 'DESC']]
    });
  };

  Transaction.getSpendingByMonth = async function(cardId, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const result = await this.findOne({
      where: {
        card_id: cardId,
        transaction_date: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        },
        status: ['settled', 'pending']
      },
      attributes: [
        [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('amount')), 'total_spent'],
        [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('transaction_id')), 'transaction_count']
      ]
    });
    
    return {
      total_spent: parseFloat(result?.dataValues?.total_spent || 0),
      transaction_count: parseInt(result?.dataValues?.transaction_count || 0),
      month,
      year
    };
  };

  Transaction.getSpendingByDay = async function(cardId, date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const result = await this.findOne({
      where: {
        card_id: cardId,
        transaction_date: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate]
        },
        status: ['settled', 'pending']
      },
      attributes: [
        [sequelize.Sequelize.fn('SUM', sequelize.Sequelize.col('amount')), 'total_spent'],
        [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('transaction_id')), 'transaction_count']
      ]
    });
    
    return {
      total_spent: parseFloat(result?.dataValues?.total_spent || 0),
      transaction_count: parseInt(result?.dataValues?.transaction_count || 0),
      date: date.toISOString().split('T')[0]
    };
  };

  return Transaction;
};
