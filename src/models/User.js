const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'role_id'
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^\+?[\d\s\-\(\)]+$/
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lithic_account_holder_token: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['is_active']
      },
      {
        unique: true,
        fields: ['lithic_account_holder_token']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
        }
      }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

    User.hasMany(models.Account, {
      foreignKey: 'user_id',
      as: 'accounts'
    });

    User.hasMany(models.Card, {
      foreignKey: 'user_id',
      as: 'cards'
    });

    User.hasMany(models.AuditLog, {
      foreignKey: 'user_id',
      as: 'audit_logs'
    });

    User.hasMany(models.UserSession, {
      foreignKey: 'user_id',
      as: 'sessions'
    });
  };

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.failed_login_attempts;
    delete values.locked_until;
    return values;
  };

  User.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  User.prototype.incrementFailedLogins = async function() {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION) || 30; // minutes

    this.failed_login_attempts += 1;

    if (this.failed_login_attempts >= maxAttempts) {
      this.locked_until = new Date(Date.now() + lockoutDuration * 60 * 1000);
    }

    await this.save();
  };

  User.prototype.resetFailedLogins = async function() {
    this.failed_login_attempts = 0;
    this.locked_until = null;
    this.last_login_at = new Date();
    await this.save();
  };

  return User;
};
