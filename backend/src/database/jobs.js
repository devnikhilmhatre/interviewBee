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
      { returning: true }
    );
    return savedJob;
  } catch (error) {
    throw new Error(`Failed to save job ${job.id}: ${error.message}`);
  }
}

module.exports = {
  getAllSites,
  saveJob,
};
