module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    audit_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    table_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'audit_log',
    timestamps: true,
    updatedAt: false, // Audit logs should never be updated
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['table_name']
      },
      {
        fields: ['table_name', 'record_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['action']
      }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  // Class methods
  AuditLog.logCreate = async function(tableName, recordId, newValues, userId = null, req = null) {
    return await this.create({
      user_id: userId,
      table_name: tableName,
      record_id: recordId,
      action: 'CREATE',
      old_values: null,
      new_values: newValues,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('User-Agent') || null
    });
  };

  AuditLog.logUpdate = async function(tableName, recordId, oldValues, newValues, userId = null, req = null) {
    return await this.create({
      user_id: userId,
      table_name: tableName,
      record_id: recordId,
      action: 'UPDATE',
      old_values: oldValues,
      new_values: newValues,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('User-Agent') || null
    });
  };

  AuditLog.logDelete = async function(tableName, recordId, oldValues, userId = null, req = null) {
    return await this.create({
      user_id: userId,
      table_name: tableName,
      record_id: recordId,
      action: 'DELETE',
      old_values: oldValues,
      new_values: null,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('User-Agent') || null
    });
  };

  AuditLog.getAuditTrail = async function(tableName, recordId, limit = 50) {
    return await this.findAll({
      where: {
        table_name: tableName,
        record_id: recordId
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'user',
          attributes: ['user_id', 'username', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.getUserActivity = async function(userId, limit = 100) {
    return await this.findAll({
      where: {
        user_id: userId
      },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  // Instance methods
  AuditLog.prototype.getChangedFields = function() {
    if (!this.old_values || !this.new_values) {
      return [];
    }

    const changes = [];
    const oldVals = this.old_values;
    const newVals = this.new_values;

    for (const field in newVals) {
      if (oldVals[field] !== newVals[field]) {
        changes.push({
          field,
          old_value: oldVals[field],
          new_value: newVals[field]
        });
      }
    }

    return changes;
  };

  AuditLog.prototype.getFormattedAction = function() {
    const actions = {
      'CREATE': 'Created',
      'UPDATE': 'Updated',
      'DELETE': 'Deleted'
    };
    return actions[this.action] || this.action;
  };

  return AuditLog;
};
