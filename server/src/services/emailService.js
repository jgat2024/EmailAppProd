const nodemailer = require('nodemailer');
const { Email } = require('../models');
const { getDecryptedCredentials } = require('./emailAccountService');
const webhookService = require('./webhookService');
const logger = require('../utils/logger');

const cacheEmail = async (account, payload) => {
  const email = await Email.create({
    emailAccountId: account.id,
    userId: account.userId,
    subject: payload.subject,
    body: payload.body,
    from: payload.from,
    to: payload.to,
    cc: payload.cc,
    bcc: payload.bcc,
    messageId: payload.messageId,
    direction: payload.direction,
    status: payload.status,
    raw: payload.raw,
    headers: payload.headers,
    receivedAt: payload.receivedAt,
    sentAt: payload.sentAt
  });

  await webhookService.trigger(account.userId, account.id, email, payload.direction === 'incoming' ? 'email.received' : 'email.sent');
  return email;
};

const buildTransport = (account, credentials) => {
  const smtpConfig = account.smtpConfig || {};
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure ?? true,
    auth: {
      user: credentials.username || account.emailAddress,
      pass: credentials.password || account.oauthAccessToken
    }
  });
};

const sendEmail = async (account, message) => {
  const credentials = getDecryptedCredentials(account);
  const transporter = buildTransport(account, credentials);

  try {
    const result = await transporter.sendMail({
      from: message.from || account.emailAddress,
      to: message.to,
      cc: message.cc,
      bcc: message.bcc,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments
    });

    const cached = await cacheEmail(account, {
      subject: message.subject,
      body: message.text || message.html,
      from: message.from || account.emailAddress,
      to: Array.isArray(message.to) ? message.to : [message.to],
      cc: message.cc,
      bcc: message.bcc,
      messageId: result.messageId,
      direction: 'outgoing',
      status: 'sent',
      raw: result,
      sentAt: new Date()
    });

    return { result, cached };
  } catch (error) {
    logger.error('Failed to send email via account %s: %s', account.id, error.message);
    await cacheEmail(account, {
      subject: message.subject,
      body: message.text || message.html,
      from: message.from || account.emailAddress,
      to: Array.isArray(message.to) ? message.to : [message.to],
      messageId: message.messageId,
      direction: 'outgoing',
      status: 'failed',
      raw: { error: error.message },
      sentAt: new Date()
    });
    throw error;
  }
};

module.exports = {
  cacheEmail,
  sendEmail
};
