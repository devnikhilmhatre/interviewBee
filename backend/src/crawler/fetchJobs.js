const { withRetries, sleep } = require("./utils");
const { saveJob, filterJobLinks } = require("./../database//jobs");
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

module.exports = { fetchJobs };
