const { JobModel } = require("./models/jobs");
const { SiteModel } = require("./models/sites");

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
    // Prepare data for bulkCreate
    const bulkData = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location || "",
      tags: JSON.stringify(job.tags || []),
      url: job.url,
      source: job.source,
      posted_at: job.posted_at,
    }));

    await JobModel.bulkCreate(bulkData, {
      updateOnDuplicate: [
        "title",
        "company",
        "location",
        "tags",
        "source",
        "posted_at",
      ],
      conflictFields: ["url"],
    });

    return bulkData.length;
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
