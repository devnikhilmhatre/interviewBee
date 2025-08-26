const { log } = require("./../log");

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

module.exports = { extractJobLinks };
