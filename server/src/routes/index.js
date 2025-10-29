const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const emailAccountRoutes = require('./emailAccountRoutes');
const webhookRoutes = require('./webhookRoutes');
const adminRoutes = require('./adminRoutes');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/email-accounts', emailAccountRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);
router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
