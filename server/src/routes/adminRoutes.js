const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, requireAdmin, (req, res) => {
  res.render('admin', {
    title: 'Admin Dashboard',
    user: req.user
  });
});

module.exports = router;
