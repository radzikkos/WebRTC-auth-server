const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL);
exports.sequelizeObject = { sequelize, DataTypes };
