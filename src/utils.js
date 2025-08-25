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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetries(func, retries = 3) {
  let attempt = 0;
  while (true) {
    try {
      return await func();
    } catch (err) {
      attempt++;
      if (attempt > retries) return;
      const backoff = 1000 * Math.pow(2, attempt);
      log.warn(
        `⚠️ Retry ${attempt} after error: ${err.message}. Waiting ${backoff}ms...`
      );

      await sleep(backoff);
    }
  }
}

module.exports = { withRetries, sleep, log };
