const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Card = sequelize.define('Card', {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    spending_profile_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'spending_profiles',
        key: 'id'
      }
    },
    lithic_card_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    card_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_four: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    spend_limit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    spend_limit_duration: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'cards',
    timestamps: true,
    underscored: true
  });

  return Card;
};
