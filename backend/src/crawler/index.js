const { chromium } = require("playwright");
const { withRetries, sleep } = require("./utils");
const { getAllSites, saveJob, filterJobLinks } = require("./../database//jobs");
const inquirer = require("inquirer").default;
const { log } = require("./../log");

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
      await fetchJobs(browser, jobsLinks, site);
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

async function downloadContent(page, url) {
  log.step(`Downloading content from ${url}`);
  await withRetries(() => page.goto(url, { waitUntil: "networkidle" }));
}

async function extractJobLinks(page, site) {
  log.step("Extracting job links from listing page");
  const {
    job_link_selector,
    post_date_selector,
    post_date_attribute,
    job_row_selector,
  } = site;
  const jobLinks = await page.evaluate(
    ({
      job_link_selector,
      post_date_selector,
      post_date_attribute,
      job_row_selector,
    }) => {
      return Array.from(document.querySelectorAll(job_link_selector))
        .map((a) => {
          const row = a.closest(job_row_selector);
          const postedAtElement = row.querySelector(post_date_selector);
          const postedAt = post_date_attribute
            ? postedAtElement?.getAttribute(post_date_attribute)
            : postedAtElement?.textContent.trim();

          return { url: a.href || a.querySelector("a")?.href, postedAt };
        })
        .filter(Boolean);
    },
    {
      job_link_selector,
      post_date_selector,
      post_date_attribute,
      job_row_selector,
    }
  );
  log.success(`Found ${jobLinks.length} job links on page`);
  return jobLinks;
}

async function fetchJobs(browser, jobsLinks, site) {
  const filteredJobsLinks = await filterJobLinks(jobsLinks);
  log.step(`Fetching details for ${filteredJobsLinks.length} jobs`);
  let count = 0;
  for (let jobLink of filteredJobsLinks) {
    count += 1;
    log.step(`${count}: Fetching ${jobLink.url}`);
    await sleep(1000 + Math.random() * 1000);

    try {
      const job = await withRetries(async () => {
        const detailPage = await browser.newPage();
        await downloadContent(detailPage, jobLink["url"]);
        let job = await extractJob(detailPage, site);
        detailPage.close();
        job["posted_at"] = jobLink["postedAt"] || new Date().toISOString();
        return job;
      });

      await saveJob(job);
      log.success(`Saved job: ${job.title} @ ${job.company}`);
    } catch (error) {
      log.error(`Failed to fetch job: ${jobLink.url}`, error.message);
    }
  }
}

async function extractJob(page, site) {
  log.step("Extracting job details", page.url());
  const {
    hostname,
    title_selector,
    company_selector,
    location_selector,
    tags_selector,
    apply_selector,
  } = site;

  const data = await page.evaluate(
    ({ titleSel, compSel, locSel, tagsSel, applySel }) => {
      const title = document.querySelector(titleSel)?.textContent.trim() || "";
      const company = document.querySelector(compSel)?.textContent.trim() || "";
      const location =
        document.querySelector(locSel)?.textContent.trim() || "Remote";
      const tags = tagsSel
        ? Array.from(document.querySelectorAll(tagsSel)).map((t) =>
            t.textContent.trim()
          )
        : [];
      const applyUrl =
        document.querySelector(applySel)?.href || window.location.href;
      return { title, company, location, tags, url: applyUrl };
    },
    {
      titleSel: title_selector,
      compSel: company_selector,
      locSel: location_selector,
      tagsSel: tags_selector,
      applySel: apply_selector,
    }
  );

  log.success(`Extracted job: ${data.title} @ ${data.company}`);

  return {
    id: data.url.split("/").pop(),
    title: data.title,
    company: data.company,
    location: data.location,
    tags: data.tags,
    url: data.url,
    source: hostname,
  };
}

async function nextPage(page, site, previousJobCount = 0) {
  const { next_page_selector, infinite_scroll, job_link_selector } = site;

  if (infinite_scroll) {
    // Scroll a little to load next batch of jobs
    log.step("Scrolling for next batch of infinite scroll jobs...");

    let maxScroll = 3;

    for (let i = 0; i <= maxScroll; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500 + Math.random() * 500);
    }
    // Count jobs after scroll
    const currentJobCount = await page.evaluate(
      (sel) => document.querySelectorAll(sel).length,
      job_link_selector
    );

    if (currentJobCount > previousJobCount) {
      log.info(`Loaded ${currentJobCount - previousJobCount} new jobs`);
      return page.url(); // return current URL to continue crawling
    } else {
      log.info("No more jobs to load via scrolling");
      return null; // stop crawling
    }
  } else if (next_page_selector) {
    // Numbered pagination
    const url = await page.evaluate((sel) => {
      const nextLink = document.querySelector(sel);
      return nextLink ? nextLink.href : null;
    }, next_page_selector);

    log.info("Next page URL:", url || "No more pages");
    return url;
  } else {
    return null;
  }
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
