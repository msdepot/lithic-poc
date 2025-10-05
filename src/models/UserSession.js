const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define('UserSession', {
    session_id: {
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
    jwt_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_used_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_sessions',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['jwt_token_hash']
      },
      {
        fields: ['refresh_token_hash']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  UserSession.associate = (models) => {
    UserSession.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Class methods
  UserSession.createSession = async function(userId, jwtToken, refreshToken, req = null) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    return await this.create({
      user_id: userId,
      jwt_token_hash: this.hashToken(jwtToken),
      refresh_token_hash: this.hashToken(refreshToken),
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('User-Agent') || null,
      expires_at: expiresAt,
      is_active: true
    });
  };

  UserSession.findByJwtToken = async function(jwtToken) {
    const tokenHash = this.hashToken(jwtToken);
    return await this.findOne({
      where: {
        jwt_token_hash: tokenHash,
        is_active: true,
        expires_at: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'user'
        }
      ]
    });
  };

  UserSession.findByRefreshToken = async function(refreshToken) {
    const tokenHash = this.hashToken(refreshToken);
    return await this.findOne({
      where: {
        refresh_token_hash: tokenHash,
        is_active: true,
        expires_at: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'user'
        }
      ]
    });
  };

  UserSession.revokeUserSessions = async function(userId) {
    return await this.update(
      { is_active: false },
      {
        where: {
          user_id: userId,
          is_active: true
        }
      }
    );
  };

  UserSession.cleanupExpiredSessions = async function() {
    return await this.destroy({
      where: {
        expires_at: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
  };

  UserSession.hashToken = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  };

  // Instance methods
  UserSession.prototype.isExpired = function() {
    return new Date() > this.expires_at;
  };

  UserSession.prototype.updateLastUsed = async function() {
    this.last_used_at = new Date();
    await this.save();
  };

  UserSession.prototype.revoke = async function() {
    this.is_active = false;
    await this.save();
  };

  UserSession.prototype.refreshSession = async function(newJwtToken, newRefreshToken) {
    this.jwt_token_hash = UserSession.hashToken(newJwtToken);
    this.refresh_token_hash = UserSession.hashToken(newRefreshToken);
    this.last_used_at = new Date();
    
    // Extend expiry by 7 days
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
    this.expires_at = newExpiresAt;
    
    await this.save();
    return this;
  };

  return UserSession;
};
