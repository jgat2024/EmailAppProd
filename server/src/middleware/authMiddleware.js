const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');
const tokenBlacklist = require('../utils/tokenBlacklist');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token has been revoked' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret, { issuer: config.jwtIssuer });
    req.user = payload;
    return next();
  } catch (error) {
    logger.warn('JWT verification failed: %s', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  return next();
};

module.exports = {
  authenticate,
  requireAdmin
};
