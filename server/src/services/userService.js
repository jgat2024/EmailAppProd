const { User } = require('../models');

const listUsers = async ({ limit = 25, offset = 0 }) => {
  const { rows, count } = await User.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['passwordHash'] }
  });
  return { users: rows, count };
};

const getUser = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

const updateUserRole = async (id, role) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  user.role = role;
  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  await user.destroy();
};

module.exports = {
  listUsers,
  getUser,
  updateUserRole,
  deleteUser
};
