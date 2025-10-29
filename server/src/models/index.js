const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];

const config = { ...dbConfig };
let sequelize;

if (config.use_env_variable) {
  const connectionString = process.env[config.use_env_variable];
  const { use_env_variable, ...rest } = config;
  sequelize = new Sequelize(connectionString, rest);
} else if (config.url) {
  const { url, ...rest } = config;
  sequelize = new Sequelize(url, rest);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = {
  ...db,
  sequelize,
  Sequelize
};
