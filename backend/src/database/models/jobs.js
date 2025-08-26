const { DataTypes } = require("sequelize");
const { sequelize } = require("./../index");

const JobModel = sequelize.define(
  "Job",
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    location: DataTypes.STRING,
    tags: DataTypes.STRING,
    url: { type: DataTypes.STRING, allowNull: false },
    source: DataTypes.STRING,
    posted_at: DataTypes.STRING,
  },
  {
    tableName: "jobs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["url"],
      },
      { fields: ["company"] },
      { fields: ["location"] },
      { fields: ["posted_at"] },
    ],
  }
);

module.exports = { JobModel };
