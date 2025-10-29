const express = require('express');
const webhookController = require('../controllers/webhookController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, Joi, Segments } = require('../middleware/validation');

const router = express.Router();

const baseSchema = {
  emailAccountId: Joi.string().uuid().allow(null).optional(),
  targetUrl: Joi.string().uri(),
  eventType: Joi.string().valid('email.received', 'email.sent'),
  secret: Joi.string().optional(),
  isActive: Joi.boolean().optional()
};

router.use(authenticate);

router.get('/', webhookController.listWebhooks);
router.post(
  '/',
  validate({
    [Segments.BODY]: Joi.object({
      ...baseSchema,
      targetUrl: baseSchema.targetUrl.required(),
      eventType: baseSchema.eventType.required()
    })
  }),
  webhookController.createWebhook
);
router.get('/:id', webhookController.getWebhook);
router.put(
  '/:id',
  validate({ [Segments.BODY]: Joi.object(baseSchema).min(1) }),
  webhookController.updateWebhook
);
router.delete('/:id', webhookController.deleteWebhook);

module.exports = router;
