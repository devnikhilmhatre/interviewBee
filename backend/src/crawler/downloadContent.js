const { withRetries } = require("./utils");
const { log } = require("./../log");

async function downloadContent(page, url) {
  log.step(`Downloading content from ${url}`);
  await withRetries(() => page.goto(url, { waitUntil: "networkidle" }));
}

module.exports = { downloadContent };
