const { JobModel } = require("./models/jobs");
const { SiteModel } = require("./models/sites");
const { log } = require("./../log");

// Fetch all sites from SQLite
async function getAllSites() {
  try {
    const sites = await SiteModel.findAll({ raw: true });
    return sites;
  } catch (error) {
    throw new Error(`Failed to fetch sites: ${error.message}`);
  }
}

async function filterJobLinks(jobsLinks) {
  if (!jobsLinks || jobsLinks.length === 0) return [];

  const urls = jobsLinks.map((j) => j.url);

  // Fetch existing jobs from DB
  const existingJobs = await JobModel.findAll({
    where: { url: urls },
    attributes: ["url"],
  });

  const existingUrls = new Set(existingJobs.map((job) => job.url));

  // Filter out already existing jobs
  const filtered = jobsLinks.filter((j) => !existingUrls.has(j.url));

  return filtered;
}

async function saveJob(job) {
  try {
    const [savedJob] = await JobModel.upsert(
      {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location || "",
        tags: JSON.stringify(job.tags || []),
        url: job.url,
        source: job.source,
        posted_at: job.posted_at,
      },
      { returning: true, conflictFields: ["url"] }
    );
    return savedJob;
  } catch (error) {
    throw new Error(`Failed to save job ${job.id}: ${error.message}`);
  }
}

async function saveJobsBulk(jobs) {
  if (!jobs?.length) return;

  try {
    // Extract URLs
    const urls = jobs.map((job) => job.url);

    // Fetch existing jobs from DB
    const existingJobs = await JobModel.findAll({
      where: { url: urls },
      attributes: ["url"],
      raw: true,
    });

    const existingUrls = new Set(existingJobs.map((j) => j.url));

    // Separate jobs into new and to-update
    const toInsert = [];
    const toUpdate = [];

    for (const job of jobs) {
      const jobData = {
        title: job.title,
        company: job.company,
        location: job.location || "",
        tags: JSON.stringify(job.tags || []),
        url: job.url,
        source: job.source,
        posted_at: job.posted_at,
      };

      if (existingUrls.has(job.url)) {
        toUpdate.push(jobData);
      } else {
        toInsert.push(jobData);
      }
    }

    // Bulk insert new jobs
    if (toInsert.length) {
      await JobModel.bulkCreate(toInsert);
    }

    // Update existing jobs one by one (SQLite doesn't support bulk update easily)
    for (const job of toUpdate) {
      log.warn(`Skipping update for demo purpose. ${job.url}`);
      // await JobModel.update(job, { where: { url: job.url } });
    }

    return jobs.length;
  } catch (error) {
    throw new Error(`Failed to bulk save jobs: ${error.message}`);
  }
}

module.exports = {
  getAllSites,
  saveJob,
  saveJobsBulk,
  filterJobLinks,
};
