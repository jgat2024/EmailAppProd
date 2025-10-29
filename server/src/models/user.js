module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'users',
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    }
  );

  User.associate = (models) => {
    User.hasMany(models.EmailAccount, { foreignKey: 'userId', as: 'emailAccounts' });
    User.hasMany(models.Webhook, { foreignKey: 'userId', as: 'webhooks' });
  };

  return User;
};
