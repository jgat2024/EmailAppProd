const webhookService = require('../services/webhookService');

const listWebhooks = async (req, res, next) => {
  try {
    const webhooks = await webhookService.listWebhooks(req.user.id);
    return res.json(webhooks);
  } catch (error) {
    return next(error);
  }
};

const createWebhook = async (req, res, next) => {
  try {
    const webhook = await webhookService.createWebhook(req.user.id, req.body);
    return res.status(201).json(webhook);
  } catch (error) {
    return next(error);
  }
};

const getWebhook = async (req, res, next) => {
  try {
    const webhook = await webhookService.getWebhook(req.user.id, req.params.id);
    return res.json(webhook);
  } catch (error) {
    return next(error);
  }
};

const updateWebhook = async (req, res, next) => {
  try {
    const webhook = await webhookService.updateWebhook(req.user.id, req.params.id, req.body);
    return res.json(webhook);
  } catch (error) {
    return next(error);
  }
};

const deleteWebhook = async (req, res, next) => {
  try {
    await webhookService.deleteWebhook(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listWebhooks,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook
};
