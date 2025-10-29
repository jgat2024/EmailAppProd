const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return value;
};

module.exports = {
  env: required(process.env.NODE_ENV, 'development'),
  port: parseInt(process.env.PORT, 10) || 4000,
  apiUrl: required(process.env.API_URL, 'http://localhost:4000'),
  jwtSecret: required(process.env.JWT_SECRET, 'change-me-in-production'),
  jwtExpiresIn: required(process.env.JWT_EXPIRES_IN, '1h'),
  jwtIssuer: required(process.env.JWT_ISSUER, 'email-app'),
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  encryption: {
    algorithm: required(process.env.ENCRYPTION_ALGORITHM, 'aes-256-gcm'),
    secret: required(process.env.ENCRYPTION_KEY, '32_character_encryption_key!'),
    ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH, 10) || 16
  },
  emailPolling: {
    intervalMs: parseInt(process.env.EMAIL_POLL_INTERVAL_MS, 10) || 60000
  },
  webhook: {
    maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES, 10) || 5,
    retryDelayMs: parseInt(process.env.WEBHOOK_RETRY_DELAY_MS, 10) || 60000,
    signatureSecret: required(process.env.WEBHOOK_SIGNATURE_SECRET, 'change-me-secret')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  }
};
