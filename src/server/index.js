const { sequelize } = require("./../database");
const { log } = require("./../log");

const { app } = require("./app");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    log.info("Database connected successfully.");
    await sequelize.sync(); // ensure tables exist

    app.listen(PORT, () => {
      log.success(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
