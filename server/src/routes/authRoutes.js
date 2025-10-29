const express = require('express');
const authController = require('../controllers/authController');
const { validate, Joi, Segments } = require('../middleware/validation');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  validate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      role: Joi.string().valid('user', 'admin').optional()
    })
  }),
  authController.register
);

router.post(
  '/login',
  validate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  authController.login
);

router.post('/logout', authenticate, authController.logout);

module.exports = router;
