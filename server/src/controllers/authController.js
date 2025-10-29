const authService = require('../services/authService');
const tokenBlacklist = require('../utils/tokenBlacklist');

const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    tokenBlacklist.add(token);
  }
  return res.status(204).send();
};

module.exports = {
  register,
  login,
  logout
};
