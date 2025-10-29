const emailAccountService = require('../services/emailAccountService');
const emailService = require('../services/emailService');
const pollingService = require('../services/pollingService');

const listAccounts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = parseInt(req.query.offset, 10) || 0;
    const accounts = await emailAccountService.listEmailAccounts(req.user.id, { limit, offset });
    return res.json(accounts);
  } catch (error) {
    return next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const account = await emailAccountService.createEmailAccount(req.user.id, req.body);
    pollingService.startPollingForAccount(account);
    return res.status(201).json({ id: account.id, emailAddress: account.emailAddress, provider: account.provider });
  } catch (error) {
    return next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await emailAccountService.getEmailAccount(req.params.id, req.user.id);
    const response = {
      id: account.id,
      emailAddress: account.emailAddress,
      provider: account.provider,
      imapConfig: account.imapConfig,
      pop3Config: account.pop3Config,
      smtpConfig: account.smtpConfig,
      isActive: account.isActive,
      lastSyncedAt: account.lastSyncedAt
    };
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await emailAccountService.updateEmailAccount(req.params.id, req.user.id, req.body);
    pollingService.stopPollingForAccount(account.id);
    pollingService.startPollingForAccount(account);
    return res.json({ id: account.id, emailAddress: account.emailAddress, provider: account.provider, isActive: account.isActive });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await emailAccountService.deleteEmailAccount(req.params.id, req.user.id);
    pollingService.stopPollingForAccount(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const account = await emailAccountService.getEmailAccount(req.params.id, req.user.id);
    const result = await emailService.sendEmail(account, req.body);
    return res.status(202).json({ messageId: result.result.messageId, status: 'queued' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listAccounts,
  createAccount,
  getAccount,
  updateAccount,
  deleteAccount,
  sendEmail
};
