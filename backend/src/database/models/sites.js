const { DataTypes } = require("sequelize");
const { sequelize } = require("./../index");

const SiteModel = sequelize.define(
  "Sites",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    hostname: { type: DataTypes.STRING, unique: true, allowNull: false },
    title_selector: { type: DataTypes.STRING, allowNull: false },
    company_selector: { type: DataTypes.STRING, allowNull: false },
    location_selector: { type: DataTypes.STRING, allowNull: false },
    tags_selector: DataTypes.STRING,
    apply_selector: { type: DataTypes.STRING, allowNull: false },
    job_link_selector: { type: DataTypes.STRING, allowNull: false },
    job_row_selector: { type: DataTypes.STRING, allowNull: false },
    post_date_selector: DataTypes.STRING,
    post_date_attribute: DataTypes.STRING,
    next_page_selector: DataTypes.STRING,
    infinite_scroll: DataTypes.BOOLEAN,
  },
  { tableName: "sites", timestamps: false }
);

module.exports = { SiteModel };
