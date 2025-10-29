'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhooks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      email_account_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'email_accounts',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      target_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      event_type: {
        type: Sequelize.ENUM('email.received', 'email.sent'),
        allowNull: false
      },
      secret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_response_status: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      last_error: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('webhooks', ['user_id']);
    await queryInterface.addIndex('webhooks', ['email_account_id']);
    await queryInterface.addIndex('webhooks', ['event_type']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('webhooks');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_webhooks_event_type";');
  }
};
