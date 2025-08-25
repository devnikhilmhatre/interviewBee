const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../jobs.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
  logging: false,
});

module.exports = { sequelize };
