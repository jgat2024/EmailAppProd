const userService = require('../services/userService');

const listUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await userService.listUsers({ limit, offset });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  getUser,
  updateUserRole,
  deleteUser
};
