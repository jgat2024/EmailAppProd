module.exports = (sequelize, DataTypes) => {
  const Webhook = sequelize.define(
    'Webhook',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      emailAccountId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      targetUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      eventType: {
        type: DataTypes.ENUM('email.received', 'email.sent'),
        allowNull: false
      },
      secret: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      retryCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastResponseStatus: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      lastError: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'webhooks',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['email_account_id'] },
        { fields: ['event_type'] }
      ]
    }
  );

  Webhook.associate = (models) => {
    Webhook.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Webhook.belongsTo(models.EmailAccount, { foreignKey: 'emailAccountId', as: 'emailAccount' });
  };

  return Webhook;
};
