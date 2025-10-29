module.exports = (sequelize, DataTypes) => {
  const Email = sequelize.define(
    'Email',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      emailAccountId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      from: {
        type: DataTypes.STRING,
        allowNull: true
      },
      to: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      cc: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      bcc: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      direction: {
        type: DataTypes.ENUM('incoming', 'outgoing'),
        allowNull: false,
        defaultValue: 'incoming'
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed', 'received'),
        allowNull: false,
        defaultValue: 'pending'
      },
      raw: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      headers: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      receivedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'emails',
      indexes: [
        { fields: ['email_account_id'] },
        { fields: ['user_id'] },
        { fields: ['message_id'] }
      ]
    }
  );

  Email.associate = (models) => {
    Email.belongsTo(models.EmailAccount, { foreignKey: 'emailAccountId', as: 'emailAccount' });
    Email.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Email;
};
