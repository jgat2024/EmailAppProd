const http = require('http');
const app = require('./app');
const config = require('./config/config');
const { sequelize } = require('./models');
const pollingService = require('./services/pollingService');
const { ensureSchema } = require('./services/setupService');
const logger = require('./utils/logger');

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');
    await ensureSchema();
    await pollingService.bootstrapPolling();

    const server = http.createServer(app);
    server.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server: %s', error.message);
    process.exit(1);
  }
};

start();
