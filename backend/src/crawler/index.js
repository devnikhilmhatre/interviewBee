const { chromium } = require("playwright");
const { withRetries } = require("./utils");
const { getAllSites } = require("./../database//jobs");
const inquirer = require("inquirer").default;
const { log } = require("./../log");

const { extractJobLinks } = require("./extractLinks");
const { fetchJobs, fetchJobsParallel } = require("./fetchJobs");
const { nextPage } = require("./nextPage");
const { downloadContent } = require("./downloadContent");

async function crawl(site, maxJobs) {
  const { hostname } = site;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let nextPageUrl = `https://${hostname}`;

  let previousJobCount = 0;
  let firstLoad = true;

  try {
    while (nextPageUrl) {
      if (firstLoad || !site.infinite_scroll) {
        await downloadContent(page, nextPageUrl);
        firstLoad = false;
      }

      let jobsLinks = await extractJobLinks(page, site);
      if (jobsLinks.length == 0) {
        console.warn("No jobLinks found.");
        break;
      }
      await fetchJobsParallel(browser, jobsLinks, site);
      previousJobCount += jobsLinks.length;

      if (previousJobCount > maxJobs) {
        console.warn(
          "Limiting job fetch for current state else it would a lot of time to fetch them all."
        );
        break;
      }
      nextPageUrl = await nextPage(page, site, previousJobCount);
    }
  } catch (error) {
    log.error(`Failed to crawl: ${nextPageUrl}`, error.message);
  } finally {
    browser.close();
  }

  log.info(`Total Number of jobs fetched: ${previousJobCount}`);
}

async function main() {
  const sites = await getAllSites();
  if (!sites.length) {
    console.warn(
      "No sites found in database. Please run migration script first."
    );
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "site",
      message: "Select a website to crawl:",
      choices: sites.map((s) => ({ name: s.hostname, value: s })),
    },
  ]);

  let maxJobs = 100;
  await crawl(answers.site, maxJobs);
}

if (require.main === module) {
  main();
}
