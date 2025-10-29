const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { validate, Joi, Segments } = require('../middleware/validation');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.patch(
  '/:id/role',
  validate({
    [Segments.BODY]: Joi.object({ role: Joi.string().valid('user', 'admin').required() })
  }),
  userController.updateUserRole
);
router.delete('/:id', userController.deleteUser);

module.exports = router;
