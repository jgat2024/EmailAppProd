const path = require('path');
const dotenv = require('dotenv');
const config = require('./config');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const boolFromEnv = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === 'true';
};

const parsePort = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const supabaseConfigured = Boolean(process.env.SUPABASE_DB_URL || process.env.SUPABASE_DB_HOST);
const sslEnabled = boolFromEnv(process.env.SUPABASE_DB_SSL ?? process.env.DB_SSL, supabaseConfigured);

const common = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: sslEnabled ? { require: true, rejectUnauthorized: false } : false
  },
  logging: config.env === 'development' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: false
  }
};

const buildSupabaseConfig = (fallbackUrl, envVar) => {
  if (process.env.SUPABASE_DB_URL) {
    return {
      ...common,
      url: process.env.SUPABASE_DB_URL
    };
  }

  if (process.env.SUPABASE_DB_HOST) {
    return {
      ...common,
      host: process.env.SUPABASE_DB_HOST,
      port: parsePort(process.env.SUPABASE_DB_PORT, 5432),
      database: process.env.SUPABASE_DB_NAME || 'postgres',
      username: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD
    };
  }

  if (process.env[envVar]) {
    return {
      ...common,
      use_env_variable: envVar
    };
  }

  return {
    ...common,
    url: fallbackUrl
  };
};

module.exports = {
  development: buildSupabaseConfig('postgres://postgres:postgres@localhost:5432/email_app_dev', 'DATABASE_URL'),
  test: {
    ...buildSupabaseConfig('postgres://postgres:postgres@localhost:5432/email_app_test', 'DATABASE_TEST_URL'),
    logging: false
  },
  production: buildSupabaseConfig('postgres://postgres:postgres@localhost:5432/email_app_prod', 'DATABASE_URL')
};
