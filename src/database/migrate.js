// initSelectorsDb.js
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const DB_PATH = "./jobs.db";

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Existing database deleted.");
}

const db = new sqlite3.Database(DB_PATH);

// Create table if not exists
db.serialize(() => {
  db.run(`
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
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS site_selectors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT UNIQUE NOT NULL,
      title_selector TEXT NOT NULL,
      company_selector TEXT NOT NULL,
      location_selector TEXT NOT NULL,
      tags_selector TEXT,
      apply_selector TEXT NOT NULL,
      job_link_selector TEXT NOT NULL,
      post_date_selector TEXT,
      post_date_attribute TEXT,
      next_page_selector TEXT
    )
  `);

  // Insert example entries
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO site_selectors 
    (hostname, title_selector, company_selector, location_selector, tags_selector, apply_selector, job_link_selector, post_date_selector, post_date_attribute, next_page_selector) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1️⃣ RemoteOK
  stmt.run(
    "remoteok.com",
    "a.preventLink > h2", // Job title
    "h3", // Company
    "div.location", // Location
    "div.tags > a", // Tags
    "a.preventLink", // Apply button
    "tr.job > td.position > a", // Job link in table row
    "time", // post date selector
    "datetime", // post date attribute
    "a.next" // Next page link
  );

  // 2️⃣ Jobspresso
  stmt.run(
    "jobspresso.co",
    ".listing-item__title", // Job title
    ".listing-item__company", // Company
    ".listing-item__location", // Location
    ".listing-item__tags > span", // Tags
    ".listing-item__link", // Apply button
    ".listing-item > a", // Job link
    "time", // post date selector
    "datetime", // post date attribute
    ".pagination-next a" // Next page
  );

  // 3️⃣ StackOverflow Jobs Archive (static HTML example)
  stmt.run(
    "stackoverflow.com",
    ".fs-body3", // Job title
    ".fc-black-700", // Company
    ".fc-black-500", // Location
    ".ps-relative > span", // Tags
    ".s-link", // Apply button
    ".js-result-link", // Job link
    "time", // post date selector
    "datetime", // post date attribute
    ".s-pagination--item.js-pagination-item-next a" // Next page
  );

  stmt.finalize();

  console.log("Database initialized and example selectors added.");
});

db.close();
