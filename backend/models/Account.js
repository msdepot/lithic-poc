const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    business_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    owner_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    lithic_account_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lithic_financial_account_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  }, {
    tableName: 'accounts',
    timestamps: true,
    underscored: true
  });

  return Account;
};
