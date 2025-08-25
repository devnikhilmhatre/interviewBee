// initSelectorsDb.js
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const DB_PATH = path.join(__dirname, "./../../jobs.db");

const { log } = require("./../utils");

// Define schema
const schema = {
  jobs: `
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      tags TEXT,
      url TEXT NOT NULL,
      source TEXT,
      posted_at TEXT
    )
  `,
  site_selectors: `
    CREATE TABLE IF NOT EXISTS site_selectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT UNIQUE NOT NULL,
      title_selector TEXT NOT NULL,
      company_selector TEXT NOT NULL,
      location_selector TEXT NOT NULL,
      tags_selector TEXT,
      apply_selector TEXT NOT NULL,
      job_link_selector TEXT NOT NULL,
      job_row_selector TEXT NOT NULL,
      post_date_selector TEXT,
      post_date_attribute TEXT,
      next_page_selector TEXT
    )
  `,
};

const sites = [
  {
    hostname: "remoteok.com",
    title_selector: "a.preventLink > h2",
    company_selector: "h3",
    location_selector: "div.location",
    tags_selector: "div.tags > a",
    apply_selector: "a.preventLink",
    job_link_selector: "tr.job > td.position > a",
    job_row_selector: "tr.job",
    post_date_selector: "time",
    post_date_attribute: "datetime",
    next_page_selector: "a.next",
  },
];

function initDb() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    log.warn("Existing database deleted.");
  }

  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    // Create tables
    db.run(schema.jobs);
    db.run(schema.site_selectors);

    // Insert site selectors
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO site_selectors 
      (hostname, title_selector, company_selector, location_selector, tags_selector, apply_selector, job_link_selector, job_row_selector, post_date_selector, post_date_attribute, next_page_selector) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sites.forEach((site) => {
      stmt.run(
        site.hostname,
        site.title_selector,
        site.company_selector,
        site.location_selector,
        site.tags_selector,
        site.apply_selector,
        site.job_link_selector,
        site.job_row_selector,
        site.post_date_selector,
        site.post_date_attribute,
        site.next_page_selector
      );
      log.info(`Extractor details for \`${site.hostname}\` added`);
    });

    stmt.finalize();
  });

  db.close();
  log.info("Database re-initialized successfully.");
}

if (require.main === module) {
  initDb();
}
