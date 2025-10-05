const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const Role = require('./Role');
const User = require('./User');
const Account = require('./Account');
const SpendingProfile = require('./SpendingProfile');
const Card = require('./Card');
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');
const UserSession = require('./UserSession');

// Initialize models
const models = {
  Role: Role(sequelize, DataTypes),
  User: User(sequelize, DataTypes),
  Account: Account(sequelize, DataTypes),
  SpendingProfile: SpendingProfile(sequelize, DataTypes),
  Card: Card(sequelize, DataTypes),
  Transaction: Transaction(sequelize, DataTypes),
  AuditLog: AuditLog(sequelize, DataTypes),
  UserSession: UserSession(sequelize, DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add sequelize instance and Sequelize constructor to models object
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
