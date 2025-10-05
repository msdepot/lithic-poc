const { Sequelize } = require('sequelize');

// Use SQLite by default for easy POC setup
const sequelize = process.env.DB_DIALECT === 'postgres'
  ? new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: false
    });

const Account = require('./Account')(sequelize);
const User = require('./User')(sequelize);
const Card = require('./Card')(sequelize);
const SpendingProfile = require('./SpendingProfile')(sequelize);

// Relationships
Account.hasMany(User, { foreignKey: 'account_id' });
User.belongsTo(Account, { foreignKey: 'account_id' });

Account.hasMany(Card, { foreignKey: 'account_id' });
Card.belongsTo(Account, { foreignKey: 'account_id' });

User.hasMany(Card, { foreignKey: 'user_id' });
Card.belongsTo(User, { foreignKey: 'user_id' });

SpendingProfile.hasMany(Card, { foreignKey: 'spending_profile_id' });
Card.belongsTo(SpendingProfile, { foreignKey: 'spending_profile_id' });

module.exports = {
  sequelize,
  Account,
  User,
  Card,
  SpendingProfile
};
