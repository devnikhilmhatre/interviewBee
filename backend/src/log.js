const chalk = require("chalk");

const log = {
  info: (msg, ...args) =>
    console.log(chalk.cyan.bold("ℹ️ [INFO]"), msg, ...args),
  success: (msg, ...args) =>
    console.log(chalk.green.bold("✅ [SUCCESS]"), msg, ...args),
  warn: (msg, ...args) =>
    console.log(chalk.yellow.bold("⚠️ [WARN]"), msg, ...args),
  error: (msg, ...args) =>
    console.log(chalk.red.bold("❌ [ERROR]"), msg, ...args),
  step: (msg, ...args) =>
    console.log(chalk.magenta.bold("➡️ [STEP]"), msg, ...args),
};

module.exports = { log };
