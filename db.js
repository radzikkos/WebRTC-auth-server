const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_URL, {
  // gimme postgres, please!
  dialect: "postgres",
});
exports.sequelizeObject = { sequelize, DataTypes };
