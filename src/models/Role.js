module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isIn: [['owner', 'super_admin', 'admin', 'user', 'analyst']]
      }
    },
    role_description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['role_name']
      }
    ]
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users'
    });
  };

  return Role;
};
