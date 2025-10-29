'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_accounts', {
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
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      encrypted_username: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      username_iv: {
        type: Sequelize.STRING,
        allowNull: true
      },
      username_auth_tag: {
        type: Sequelize.STRING,
        allowNull: true
      },
      encrypted_password: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      password_iv: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password_auth_tag: {
        type: Sequelize.STRING,
        allowNull: true
      },
      oauth_client_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      oauth_client_secret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      oauth_refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      oauth_access_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      oauth_token_expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      imap_config: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      pop3_config: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      smtp_config: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_synced_at: {
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

    await queryInterface.addIndex('email_accounts', ['user_id']);
    await queryInterface.addIndex('email_accounts', ['email_address']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('email_accounts');
  }
};
