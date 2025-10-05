const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SpendingProfile = sequelize.define('SpendingProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    spend_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    spend_limit_duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    allowed_categories: {
      type: DataTypes.JSON,
      allowNull: true
    },
    blocked_categories: {
      type: DataTypes.JSON,
      allowNull: true
    },
    lithic_auth_rule_token: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'spending_profiles',
    timestamps: true,
    underscored: true
  });

  return SpendingProfile;
};
