const { log } = require("../log");

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
