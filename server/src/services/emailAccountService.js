const { EmailAccount, Email, sequelize } = require('../models');
const { encrypt, decrypt } = require('../utils/crypto');
const logger = require('../utils/logger');

const formatEncrypted = (value) => {
  if (value === undefined || value === null || value === '') {
    return { content: null, iv: null, authTag: null };
  }
  const payload = encrypt(value);
  return payload || { content: null, iv: null, authTag: null };
};

const createEmailAccount = async (userId, payload) => {
  const encryptedUsername = formatEncrypted(payload.username);
  const encryptedPassword = formatEncrypted(payload.password);

  const account = await EmailAccount.create({
    userId,
    provider: payload.provider,
    emailAddress: payload.emailAddress,
    encryptedUsername: encryptedUsername.content,
    usernameIv: encryptedUsername.iv,
    usernameAuthTag: encryptedUsername.authTag,
    encryptedPassword: encryptedPassword.content,
    passwordIv: encryptedPassword.iv,
    passwordAuthTag: encryptedPassword.authTag,
    oauthClientId: payload.oauthClientId,
    oauthClientSecret: payload.oauthClientSecret,
    oauthRefreshToken: payload.oauthRefreshToken,
    oauthAccessToken: payload.oauthAccessToken,
    oauthTokenExpiresAt: payload.oauthTokenExpiresAt,
    imapConfig: payload.imapConfig,
    pop3Config: payload.pop3Config,
    smtpConfig: payload.smtpConfig,
    isActive: payload.isActive ?? true
  });

  return account;
};

const listEmailAccounts = async (userId, { limit = 25, offset = 0 } = {}) => {
  const { rows, count } = await EmailAccount.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['encryptedPassword', 'passwordIv', 'passwordAuthTag', 'encryptedUsername', 'usernameIv', 'usernameAuthTag'] }
  });
  return { accounts: rows, count };
};

const getEmailAccount = async (id, userId) => {
  const account = await EmailAccount.findOne({ where: { id, userId } });
  if (!account) {
    const error = new Error('Email account not found');
    error.status = 404;
    throw error;
  }
  return account;
};

const updateEmailAccount = async (id, userId, payload) => {
  const account = await getEmailAccount(id, userId);

  if (Object.prototype.hasOwnProperty.call(payload, 'username')) {
    const encrypted = formatEncrypted(payload.username);
    account.encryptedUsername = encrypted.content;
    account.usernameIv = encrypted.iv;
    account.usernameAuthTag = encrypted.authTag;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'password')) {
    const encrypted = formatEncrypted(payload.password);
    account.encryptedPassword = encrypted.content;
    account.passwordIv = encrypted.iv;
    account.passwordAuthTag = encrypted.authTag;
  }

  if (payload.oauthAccessToken !== undefined) {
    account.oauthAccessToken = payload.oauthAccessToken;
  }
  if (payload.oauthRefreshToken !== undefined) {
    account.oauthRefreshToken = payload.oauthRefreshToken;
  }
  if (payload.oauthTokenExpiresAt !== undefined) {
    account.oauthTokenExpiresAt = payload.oauthTokenExpiresAt;
  }

  account.provider = payload.provider ?? account.provider;
  account.emailAddress = payload.emailAddress ?? account.emailAddress;
  account.oauthClientId = payload.oauthClientId ?? account.oauthClientId;
  account.oauthClientSecret = payload.oauthClientSecret ?? account.oauthClientSecret;
  account.imapConfig = payload.imapConfig ?? account.imapConfig;
  account.pop3Config = payload.pop3Config ?? account.pop3Config;
  account.smtpConfig = payload.smtpConfig ?? account.smtpConfig;
  account.isActive = payload.isActive ?? account.isActive;

  await account.save();
  return account;
};

const deleteEmailAccount = async (id, userId) => {
  const account = await getEmailAccount(id, userId);
  await sequelize.transaction(async (transaction) => {
    await Email.destroy({ where: { emailAccountId: id }, transaction });
    await account.destroy({ transaction });
  });
};

const getDecryptedCredentials = (account) => {
  const username = decrypt({
    content: account.encryptedUsername,
    iv: account.usernameIv,
    authTag: account.usernameAuthTag
  });
  const password = decrypt({
    content: account.encryptedPassword,
    iv: account.passwordIv,
    authTag: account.passwordAuthTag
  });

  return { username, password };
};

const touchLastSynced = async (accountId) => {
  await EmailAccount.update({ lastSyncedAt: new Date() }, { where: { id: accountId } });
};

const storeOauthTokens = async (accountId, { accessToken, refreshToken, expiresAt }) => {
  await EmailAccount.update(
    {
      oauthAccessToken: accessToken,
      oauthRefreshToken: refreshToken,
      oauthTokenExpiresAt: expiresAt
    },
    { where: { id: accountId } }
  );
};

const refreshOAuthIfNeeded = async (account, oauthClient) => {
  if (!account.oauthRefreshToken || !oauthClient) return account;
  if (account.oauthTokenExpiresAt && new Date(account.oauthTokenExpiresAt) > new Date()) {
    return account;
  }

  try {
    const tokens = await oauthClient.refreshToken(account.oauthRefreshToken);
    await storeOauthTokens(account.id, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || account.oauthRefreshToken,
      expiresAt: tokens.expiresAt
    });
    account.oauthAccessToken = tokens.accessToken;
    account.oauthRefreshToken = tokens.refreshToken || account.oauthRefreshToken;
    account.oauthTokenExpiresAt = tokens.expiresAt;
  } catch (error) {
    logger.error('OAuth token refresh failed for account %s: %s', account.id, error.message);
    throw error;
  }
  return account;
};

module.exports = {
  createEmailAccount,
  listEmailAccounts,
  getEmailAccount,
  updateEmailAccount,
  deleteEmailAccount,
  getDecryptedCredentials,
  touchLastSynced,
  storeOauthTokens,
  refreshOAuthIfNeeded
};
