const crypto = require('crypto');
const config = require('../config/config');

const normalizeKey = (secret) => {
  const buffer = Buffer.alloc(32);
  Buffer.from(secret).copy(buffer);
  return buffer;
};

const algorithm = config.encryption.algorithm;
const key = normalizeKey(config.encryption.secret);

const encrypt = (plainText) => {
  if (plainText === undefined || plainText === null) {
    return null;
  }

  const iv = crypto.randomBytes(config.encryption.ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(String(plainText), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return {
    iv: iv.toString('base64'),
    content: encrypted,
    authTag
  };
};

const decrypt = (payload) => {
  if (!payload || !payload.iv || !payload.content || !payload.authTag) {
    return null;
  }

  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  let decrypted = decipher.update(payload.content, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const serialize = (payload) => (payload ? JSON.stringify(payload) : null);
const deserialize = (payload) => {
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
};

module.exports = {
  encrypt,
  decrypt,
  serialize,
  deserialize
};
