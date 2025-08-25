const { chromium } = require("playwright");
const { withRetries, sleep } = require("./utils");
const { getAllSites, saveJob } = require("./database/jobs");
const inquirer = require("inquirer").default;
const { log } = require("./utils");

async function crawl(site) {
  const { hostname } = site;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let nextPageUrl = `https://${hostname}`;

  try {
    while (nextPageUrl) {
      await downloadContent(page, nextPageUrl);
      let jobsLinks = await extractJobLinks(page, site);
      if (jobsLinks.length == 0) {
        console.warn("No jobLinks found.");
        return;
      }
      await fetchJobs(browser, jobsLinks, site);
      nextPageUrl = await nextPage(page, site);
    }
  } catch (error) {
    log.error(`Failed to crawl: ${nextPageUrl}`, error.message);
  } finally {
    browser.close();
  }
}

async function downloadContent(page, url) {
  log.step(`Downloading content from ${url}`);
  await withRetries(() =>
    page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 })
  );
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
  log.step(`Fetching details for ${jobsLinks.length} jobs`);
  for (let jobLink of jobsLinks) {
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

async function nextPage(page, site) {
  log.step("Extracting Next page URL");
  const { next_page_selector } = site;

  const url = next_page_selector
    ? await page.evaluate((sel) => {
        const nextLink = document.querySelector(sel);
        return nextLink ? nextLink.href : null;
      }, next_page_selector)
    : null;

  log.info("Next page URL:", url || "No more pages");
  return url;
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

  await crawl(answers.site);
}

if (require.main === module) {
  main();
}
