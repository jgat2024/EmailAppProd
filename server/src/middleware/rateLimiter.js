const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = apiLimiter;
