const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');
const tokenBlacklist = require('../utils/tokenBlacklist');

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role
});

const generateToken = (user) =>
  jwt.sign(buildTokenPayload(user), config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: config.jwtIssuer
  });

const register = async ({ email, password, role = 'user' }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('Email address already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
  const user = await User.create({ email, passwordHash, role });
  const token = generateToken(user);
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};

const logout = (token) => {
  tokenBlacklist.add(token);
};

module.exports = {
  register,
  login,
  logout
};
