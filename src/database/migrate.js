const { SiteModel } = require("./models/sites");
const { JobModel } = require("./models/jobs");
const { getSites } = require("./data/sites");
const { sequelize } = require("./index");
const { log } = require("../log");

async function initDb() {
  try {
    await sequelize.authenticate();
    log.info("Connection established successfully.");

    // Sync tables
    await sequelize.sync({ force: true }); // Drops and recreates tables
    log.info("Tables created/recreated successfully.");

    // Insert site selectors
    const sites = getSites();
    for (const site of sites) {
      await SiteModel.create(site);
      log.info(`Extractor details for \`${site.hostname}\` added`);
    }

    log.info("Database re-initialized successfully.");
    await sequelize.close();
  } catch (error) {
    log.error("Failed to initialize DB:", error.message);
  }
}

if (require.main === module) {
  initDb();
}
