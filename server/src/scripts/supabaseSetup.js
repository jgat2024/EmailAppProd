const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const logger = require('../utils/logger');
const { sequelize } = require('../models');
const { ensureSchema } = require('../services/setupService');

const run = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to Supabase database');
    await ensureSchema();
    logger.info('Supabase database is ready for use');
  } catch (error) {
    logger.error('Supabase setup failed: %s', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
