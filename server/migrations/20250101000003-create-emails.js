'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emails', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      email_account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'email_accounts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      from: {
        type: Sequelize.STRING,
        allowNull: true
      },
      to: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      cc: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      bcc: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      direction: {
        type: Sequelize.ENUM('incoming', 'outgoing'),
        allowNull: false,
        defaultValue: 'incoming'
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'received'),
        allowNull: false,
        defaultValue: 'pending'
      },
      raw: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      headers: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('emails', ['email_account_id']);
    await queryInterface.addIndex('emails', ['user_id']);
    await queryInterface.addIndex('emails', ['message_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('emails');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_emails_direction";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_emails_status";');
  }
};
