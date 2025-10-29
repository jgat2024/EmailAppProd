const axios = require('axios');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Webhook } = require('../models');
const config = require('../config/config');
const logger = require('../utils/logger');

const signPayload = (secret, body) => {
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
};

const createWebhook = async (userId, payload) =>
  Webhook.create({
    userId,
    emailAccountId: payload.emailAccountId,
    targetUrl: payload.targetUrl,
    eventType: payload.eventType,
    secret: payload.secret,
    isActive: payload.isActive ?? true
  });

const listWebhooks = (userId) => Webhook.findAll({ where: { userId } });

const getWebhook = async (userId, id) => {
  const webhook = await Webhook.findOne({ where: { id, userId } });
  if (!webhook) {
    const error = new Error('Webhook not found');
    error.status = 404;
    throw error;
  }
  return webhook;
};

const updateWebhook = async (userId, id, payload) => {
  const webhook = await getWebhook(userId, id);
  webhook.targetUrl = payload.targetUrl ?? webhook.targetUrl;
  webhook.eventType = payload.eventType ?? webhook.eventType;
  webhook.secret = payload.secret ?? webhook.secret;
  webhook.isActive = payload.isActive ?? webhook.isActive;
  webhook.retryCount = payload.retryCount ?? webhook.retryCount;
  await webhook.save();
  return webhook;
};

const deleteWebhook = async (userId, id) => {
  const webhook = await getWebhook(userId, id);
  await webhook.destroy();
};

const deliver = async (webhook, body) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const signature = signPayload(webhook.secret || config.webhook.signatureSecret, body);
  if (signature) {
    headers['x-email-app-signature'] = signature;
  }

  for (let attempt = 0; attempt <= config.webhook.maxRetries; attempt += 1) {
    try {
      const response = await axios.post(webhook.targetUrl, body, { timeout: 10000, headers });
      await webhook.update({
        lastTriggeredAt: new Date(),
        lastResponseStatus: response.status,
        lastError: null,
        retryCount: attempt
      });
      return;
    } catch (error) {
      logger.error('Webhook delivery failed (%s) attempt %d: %s', webhook.id, attempt + 1, error.message);
      await webhook.update({
        lastTriggeredAt: new Date(),
        lastResponseStatus: error.response ? error.response.status : null,
        lastError: error.message,
        retryCount: attempt + 1
      });

      if (attempt === config.webhook.maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, config.webhook.retryDelayMs));
    }
  }
};

const trigger = async (userId, emailAccountId, email, eventType) => {
  const webhooks = await Webhook.findAll({
    where: {
      userId,
      eventType,
      isActive: true,
      [Op.or]: [{ emailAccountId }, { emailAccountId: null }]
    }
  });

  const payload = {
    event: eventType,
    occurredAt: new Date().toISOString(),
    emailAccountId,
    email: {
      id: email.id,
      subject: email.subject,
      from: email.from,
      to: email.to,
      status: email.status,
      direction: email.direction,
      messageId: email.messageId
    }
  };

  await Promise.all(
    webhooks.map(async (webhook) => {
      try {
        await deliver(webhook, payload);
      } catch (error) {
        logger.error('Webhook delivery permanently failed for %s: %s', webhook.id, error.message);
      }
    })
  );
};

module.exports = {
  createWebhook,
  listWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  trigger
};
