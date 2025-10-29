const Imap = require('node-imap');
const Pop3Client = require('node-pop3');
const { EmailAccount } = require('../models');
const { getDecryptedCredentials, touchLastSynced } = require('./emailAccountService');
const emailService = require('./emailService');
const config = require('../config/config');
const logger = require('../utils/logger');

const watchers = new Map();

const parseAddresses = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map((item) => item.trim());
};

const processImapMessage = async (account, mail) => {
  try {
    await emailService.cacheEmail(account, {
      subject: mail.subject,
      body: mail.text || mail.html,
      from: mail.from && mail.from[0] ? mail.from[0].address : account.emailAddress,
      to: parseAddresses(mail.to && mail.to[0] && mail.to[0].address),
      messageId: mail.messageId,
      direction: 'incoming',
      status: 'received',
      raw: mail,
      headers: mail.headers,
      receivedAt: new Date()
    });
    await touchLastSynced(account.id);
  } catch (error) {
    logger.error('Failed to cache IMAP message for account %s: %s', account.id, error.message);
  }
};

const setupImapWatcher = (account) => {
  const credentials = getDecryptedCredentials(account);
  const imapConfig = {
    user: credentials.username || account.emailAddress,
    password: credentials.password || account.oauthAccessToken,
    tls: true,
    ...account.imapConfig
  };

  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err) => {
      if (err) {
        logger.error('Failed to open IMAP inbox for %s: %s', account.id, err.message);
        return;
      }
      logger.info('IMAP connection ready for account %s', account.id);
    });
  });

  imap.on('mail', async () => {
    // In a production implementation you would fetch the new messages here.
    logger.info('New IMAP mail event detected for account %s', account.id);
  });

  imap.on('error', (err) => {
    logger.error('IMAP error for account %s: %s', account.id, err.message);
  });

  imap.on('end', () => {
    logger.info('IMAP connection ended for account %s', account.id);
  });

  imap.connect();
  watchers.set(account.id, { stop: () => imap.end() });
};

const setupPop3Watcher = (account) => {
  const credentials = getDecryptedCredentials(account);
  const pop3Config = {
    user: credentials.username || account.emailAddress,
    password: credentials.password || account.oauthAccessToken,
    ...account.pop3Config
  };

  const poll = async () => {
    const client = new Pop3Client(pop3Config);
    client.on('error', (err) => {
      logger.error('POP3 connection error for %s: %s', account.id, err.message);
    });

    client.on('connect', () => {
      logger.info('POP3 connected for account %s', account.id);
    });

    client.on('stat', async () => {
      logger.info('POP3 stat for account %s complete', account.id);
    });

    client.connect();
  };

  const interval = setInterval(poll, config.emailPolling.intervalMs);
  interval.unref();
  watchers.set(account.id, { stop: () => clearInterval(interval) });
  poll();
};

const startPollingForAccount = (account) => {
  if (watchers.has(account.id)) {
    return;
  }

  if (account.imapConfig) {
    setupImapWatcher(account);
  } else if (account.pop3Config) {
    setupPop3Watcher(account);
  } else {
    logger.warn('No polling configuration for account %s', account.id);
  }
};

const stopPollingForAccount = (accountId) => {
  const watcher = watchers.get(accountId);
  if (watcher) {
    watcher.stop();
    watchers.delete(accountId);
  }
};

const bootstrapPolling = async () => {
  const accounts = await EmailAccount.findAll({ where: { isActive: true } });
  accounts.forEach((account) => {
    try {
      startPollingForAccount(account);
    } catch (error) {
      logger.error('Failed to start polling for account %s: %s', account.id, error.message);
    }
  });
};

module.exports = {
  startPollingForAccount,
  stopPollingForAccount,
  bootstrapPolling,
  processImapMessage
};
