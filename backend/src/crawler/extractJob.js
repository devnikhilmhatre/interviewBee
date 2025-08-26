const { log } = require("./../log");

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

module.exports = { extractJob };
