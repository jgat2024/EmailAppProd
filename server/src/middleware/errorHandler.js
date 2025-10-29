const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error: %s', err.stack || err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
