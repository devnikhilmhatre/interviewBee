const { withRetries, sleep } = require("./utils");
const { saveJob, filterJobLinks, saveJobsBulk } = require("./../database/jobs");
const { extractJob } = require("./extractJob");
const { downloadContent } = require("./downloadContent");

const { log } = require("./../log");

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

async function fetchJobsParallel(browser, jobsLinks, site, concurrency = 5) {
  const filteredJobsLinks = await filterJobLinks(jobsLinks);
  log.step(`Fetching details for ${filteredJobsLinks.length} jobs (parallel)`);

  const results = [];
  let index = 0;

  while (index < filteredJobsLinks.length) {
    const batch = filteredJobsLinks.slice(index, index + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (jobLink) => {
        await sleep(500 + Math.random() * 500); // small throttle

        try {
          const job = await withRetries(async () => {
            const detailPage = await browser.newPage();
            await detailPage.goto(jobLink.url, { waitUntil: "networkidle" });
            const jobData = await extractJob(detailPage, site);
            detailPage.close();
            jobData.posted_at = jobLink.postedAt || new Date().toISOString();
            return jobData;
          });
          return job;
        } catch (error) {
          log.error(`Failed to fetch job: ${jobLink.url}`, error.message);
          return null;
        }
      })
    );

    results.push(...batchResults.filter(Boolean));
    index += concurrency;
  }

  // Bulk insert/update
  if (results.length) {
    await saveJobsBulk(results);
    log.success(`Saved ${results.length} jobs in bulk`);
  } else {
    log.info("No jobs fetched to save in this batch");
  }

  return results;
}

module.exports = { fetchJobs, fetchJobsParallel };
