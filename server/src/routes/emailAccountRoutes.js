const express = require('express');
const emailAccountController = require('../controllers/emailAccountController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, Joi, Segments } = require('../middleware/validation');

const router = express.Router();

const baseSchema = {
  provider: Joi.string(),
  emailAddress: Joi.string().email(),
  username: Joi.string().allow('', null),
  password: Joi.string().allow('', null),
  oauthClientId: Joi.string().optional(),
  oauthClientSecret: Joi.string().optional(),
  oauthRefreshToken: Joi.string().optional(),
  oauthAccessToken: Joi.string().optional(),
  oauthTokenExpiresAt: Joi.date().optional(),
  imapConfig: Joi.object().optional(),
  pop3Config: Joi.object().optional(),
  smtpConfig: Joi.object().optional(),
  isActive: Joi.boolean().optional()
};

router.use(authenticate);

router.get('/', emailAccountController.listAccounts);
router.post(
  '/',
  validate({
    [Segments.BODY]: Joi.object({
      ...baseSchema,
      provider: baseSchema.provider.required(),
      emailAddress: baseSchema.emailAddress.required()
    })
  }),
  emailAccountController.createAccount
);
router.get('/:id', emailAccountController.getAccount);
router.put(
  '/:id',
  validate({ [Segments.BODY]: Joi.object(baseSchema).min(1) }),
  emailAccountController.updateAccount
);
router.delete('/:id', emailAccountController.deleteAccount);
router.post(
  '/:id/send',
  validate({
    [Segments.BODY]: Joi.object({
      to: Joi.alternatives(Joi.array().items(Joi.string().email()), Joi.string().email()).required(),
      cc: Joi.alternatives(Joi.array().items(Joi.string().email()), Joi.string().email()).optional(),
      bcc: Joi.alternatives(Joi.array().items(Joi.string().email()), Joi.string().email()).optional(),
      subject: Joi.string().required(),
      text: Joi.string().optional(),
      html: Joi.string().optional(),
      from: Joi.string().email().optional(),
      attachments: Joi.array().items(Joi.object()).optional()
    })
  }),
  emailAccountController.sendEmail
);

module.exports = router;
