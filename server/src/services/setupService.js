const { sequelize } = require('../models');
const logger = require('../utils/logger');

const ensureSchema = async () => {
  await sequelize.sync();
  logger.info('Supabase schema synchronized');
};

module.exports = {
  ensureSchema
};
