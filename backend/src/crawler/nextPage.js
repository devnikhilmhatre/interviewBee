const { log } = require("./../log");

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

module.exports = { nextPage };
