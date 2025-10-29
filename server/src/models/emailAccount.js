module.exports = (sequelize, DataTypes) => {
  const EmailAccount = sequelize.define(
    'EmailAccount',
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
      provider: {
        type: DataTypes.STRING,
        allowNull: false
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      encryptedUsername: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      usernameIv: {
        type: DataTypes.STRING,
        allowNull: true
      },
      usernameAuthTag: {
        type: DataTypes.STRING,
        allowNull: true
      },
      encryptedPassword: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      passwordIv: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passwordAuthTag: {
        type: DataTypes.STRING,
        allowNull: true
      },
      oauthClientId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      oauthClientSecret: {
        type: DataTypes.STRING,
        allowNull: true
      },
      oauthRefreshToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      oauthAccessToken: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      oauthTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      imapConfig: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      pop3Config: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      smtpConfig: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastSyncedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'email_accounts',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['email_address'] }
      ]
    }
  );

  EmailAccount.associate = (models) => {
    EmailAccount.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    EmailAccount.hasMany(models.Email, { foreignKey: 'emailAccountId', as: 'emails' });
    EmailAccount.hasMany(models.Webhook, { foreignKey: 'emailAccountId', as: 'webhooks' });
  };

  return EmailAccount;
};
